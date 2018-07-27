var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var FeatureManager = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.appliedItems=[];

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    FeatureManager.prototype = Object.create(AbstractBlock.prototype);
    var proto = FeatureManager.prototype;
    proto.constructor = FeatureManager;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {

        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
          //  {appliedItemIds: []},
          //  {appliedEffectIndex: []}
        ];
    };

    proto.addItemId = function(itemId,stackIdx){

        var feature= this.parent.gameData.layers.get(this.parent.mapId()).mapData.items.get(itemId).blocks.Feature;

        var newItemEffect = {
            itemId: itemId,
            effectIndex: stackIdx,
            stillValid : ko.computed(function() {
                if (feature.effects().length>0){
                    return true
                }
                else{
                    return false
                }

            }, this)

        };

        var i =0;
        var found = false;
        while (i<this.appliedItems.length){
            if (this.appliedItems[i].itemId ==itemId && this.appliedItems[i].effectIndex ==stackIdx){
                found = true;
                break;
            }
            i++;
        }
        // push new entry

        if (!found){
            this.appliedItems.push(
                newItemEffect
            );
        }

        this.updateObjectProperties();
    };

        /**
        var positions = this.appliedItemIds().indexOf(itemId);
        if (positions == -1) {
            this._insertItem(itemId,stackIdx);
        }
        else if (positions instanceof Array){
            var insert = true;
            for (var i = 0;i<positions.length;i++) {
                if (this.appliedEffectIndex()[positions[i]] == stackIdx) {
                    insert = false;
                }
            }
            if (insert){
                this._insertItem(itemId,stackIdx);
            }
        }
        else {
            if (!this.appliedEffectIndex()[positions]== stackIdx){
                this._insertItem(itemId,stackIdx);
            }
        }
        this.updateObjectProperties();



        proto._insertItem = function(itemId,stackIdx){
            this.appliedItemIds().push(itemId);
            this.appliedEffectIndex().push(stackIdx);
            this.notifyStateChange();
        };

         **/



    /**
     *
     * @param itemId
     * @param stackIdx
     * removes single ItemId, same item with other stackIdx can still be included.
     */
    proto.removeItemId = function(itemId,stackIdx){
        var i =0;
        var found = -1;
        while (i<this.appliedItems.length){
            if (this.appliedItems[i].itemId ==itemId && this.appliedItems[i].effectIndex ==stackIdx){
                found = i;
                break;
            }
            i++;
        }
        this.appliedItems.splice(i, 1);
        this.updateObjectProperties();
    };

    /**
     *
     * @param itemId
     * removes all itemIds that are the same.
     */
    proto.removeItem= function(itemId){
        var positions = this.appliedItemIds().indexOf(itemId);
        if (!positions==-1) {
            this.appliedItemIds().splice(positions, 1);
            this.appliedEffectIndex().splice(positions, 1);
            this.notifyStateChange();
            this.updateObjectProperties();
        }

    };


    proto.resetHelpers = function () {
        this.updateObjectProperties();
    };

    proto.updateObjectProperties = function () {

        // create change Object
        var toBeAdded = {};
        var BlockNames = Object.keys(this.parent.blocks);
        for (var i=0;i<BlockNames.length;i++) {
            toBeAdded[BlockNames[i]] = {};
        }

        // fill change Object by looping over items
        for (var i=0; i< this.appliedItems.length; i++) {
            // check whether effect is still valid
            if (this.appliedItems[i].stillValid()){
                // get item from _id
                var item = this.parent.gameData.layers.get(this.parent.mapId()).mapData.items.get(this.appliedItems[i].itemId);
                // get block values
                var variables = item.blocks.Feature.effects()[this.appliedItems[i].effectIndex].variables;
                var blocks = item.blocks.Feature.effects()[this.appliedItems[i].effectIndex].blocks;
                var operators = item.blocks.Feature.effects()[this.appliedItems[i].effectIndex].operators;
                var changes = item.blocks.Feature.effects()[this.appliedItems[i].effectIndex].changes;

                // loop over block type variables
                for (var k = 0; k < blocks.length; k++) {

                    var variable = variables[k];
                    var block = blocks[k];
                    var operator = operators[k];
                    var change = changes[k];

                    if (operator == "plus") {
                        if (!toBeAdded[block].hasOwnProperty(variable)) {
                            toBeAdded[block][variable] = Number(change);
                        }
                        else {
                            toBeAdded[block][variable] += Number(change);
                        }
                    }
                    else if (operator == "times") {

                        if (!toBeAdded[block].hasOwnProperty(variable)) {
                            var baseline = this.parent.objType.blocks[block][variable];
                            var times = (baseline * change) - baseline;
                            toBeAdded[block][variable] = Number(times);
                        }
                        else {
                            var baseline = this.parent.objType.blocks[block][variable];
                            var times = (baseline * change) - baseline;
                            toBeAdded[block][variable] += Number(times);
                        }
                    }
                }
            }

        };

        var change = false;
        // apply change to Building Blocks
        for (var i=0;i<BlockNames.length;i++) {
            var currentBlock = toBeAdded[BlockNames[i]];
            var properties = Object.keys(currentBlock);
            this.parent.blocks[BlockNames[i]].setInitTypeVars();
            for (var k=0;k<properties.length;k++) {
                var base= this.parent.objType.blocks[BlockNames[i]][properties[k]];
                if (this.parent.blocks[BlockNames[i]].typeCache[properties[k]] != toBeAdded[BlockNames[i]][properties[k]] + base){
                    this.parent.blocks[BlockNames[i]].typeCache[properties[k]] = toBeAdded[BlockNames[i]][properties[k]] + base;
                    change = true;
                }

            }
        }

        if (change){
            this.parent.notifyChange();
        }

    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    FeatureManager.prototype.finalizeBlockClass('FeatureManager');
    exports.FeatureManager = FeatureManager

})(typeof exports === 'undefined' ? window : exports);

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
        this.helperVar = 22;

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
            {appliedItemIds: []},
            {appliedEffectIndex: []}
        ];
    };

    proto.addItemId = function(itemId,stackIdx){

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
    };

    proto._insertItem = function(itemId,stackIdx){
        this.appliedItemIds().push(itemId);
        this.appliedEffectIndex().push(stackIdx);
        this.notifyStateChange();
    };



    /**
     *
     * @param itemId
     * @param stackIdx
     * removes single ItemId, same item with other stackIdx can still be included.
     */
    proto.removeItemId = function(itemId,stackIdx){
        var positions = this.appliedItemIds().indexOf(itemId);
        if (positions instanceof Array){
            var helpArray = this.appliedEffectIndex()[positions];
            var subPosition = this.appliedEffectIndex().indexOf(stackIdx);
            var finalPosition = positions[subPosition];
        }
        else{
            var finalPosition = positions;
        }
        this.appliedItemIds().splice(finalPosition, 1);
        this.appliedEffectIndex().splice(finalPosition, 1);
        this.notifyStateChange();
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

      //  this.parent.setInitTypeVars(); // might be problematic

        // create change Object
        var toBeAdded = {};
        var BlockNames = Object.keys(this.parent.blocks);
        for (var i=0;i<BlockNames.length;i++) {
            toBeAdded[BlockNames[i]] = {};
        }

        // fill change Object
        // loop over items
        for (var i=0; i< this.appliedItemIds().length; i++){
            // get item from id
            var item = this.parent.gameData.layers.get(this.parent.mapId()).mapData.items.get(this.appliedItemIds()[i]);
            // sanity Check

            if (item.blocks.Feature.effects()[this.appliedEffectIndex()[i]].currentTargetObjectIds.indexOf(this.appliedItemIds()[i])){

                // get block values
                var variables = item.blocks.Feature.effects()[this.appliedEffectIndex()[i]].variables;
                var blocks = item.blocks.Feature.effects()[this.appliedEffectIndex()[i]].blocks;
                var operators = item.blocks.Feature.effects()[this.appliedEffectIndex()[i]].operators;
                var changes = item.blocks.Feature.effects()[this.appliedEffectIndex()[i]].changes;

                // loop over block type variables
                for (var k=0; k< blocks.length; k++) {

                    var variable = variables[k];
                    var block = blocks[k];
                    var operator = operators[k];
                    var change = changes[k];

                    if (operator=="plus"){
                        if (!toBeAdded[block].hasOwnProperty(variable)) {
                            toBeAdded[block][variable] = Number(change);
                        }
                        else {
                            toBeAdded[block][variable] += Number(change);
                        }
                    }
                    else if (operator=="times"){

                        if (!toBeAdded[block].hasOwnProperty(variable)) {
                            var baseline = this.parent.objType.blocks[block][variable];
                            var times = (baseline*change)-baseline;
                            toBeAdded[block][variable]= Number(times);
                        }
                        else {
                            var baseline = this.parent.objType.blocks[block][variable];
                            var times = (baseline*change)-baseline;
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

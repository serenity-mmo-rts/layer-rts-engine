var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
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
            {_change: false},
            {_appliedItemIds: []},
            {_appliedEffectIndex: []}
        ];
    };


    proto.setState = function(value){
        this._change = value;
    };

    proto.getState = function(){
        return this._change;
    };

    proto.addItemId = function(itemId,stackIdx){

        var positions = this._appliedItemIds.indexOf(itemId);
        if (positions == -1) {
            this.insertItem(itemId,stackIdx);
        }
        else if (positions instanceof Array){
            var insert = true;
            for (var i = 0;i<positions.length;i++) {
                if (this._appliedEffectIndex[positions[i]] == stackIdx) {
                    insert = false;
                }
            }
            if (insert){
                this.insertItem(itemId,stackIdx);
            }
        }
        else {
            if (!this._appliedEffectIndex[positions]== stackIdx){
                this.insertItem(itemId,stackIdx);
            }
        }
    };

    proto.insertItem = function(itemId,stackIdx){
        this._appliedItemIds.push(itemId);
        this._appliedEffectIndex.push(stackIdx);
        this.notifyStateChange();
        this.updateObjectProperties();
    };



    /**
     *
     * @param itemId
     * @param stackIdx
     * removes single ItemId, same item with other stackIdx can still be included.
     */
    proto.removeItemId = function(itemId,stackIdx){
        var positions = this._appliedItemIds.indexOf(itemId);
        if (positions instanceof Array){
            var helpArray = this._appliedEffectIndex[positions];
            var subPosition = this._appliedEffectIndex.indexOf(stackIdx);
            var finalPosition = positions[subPosition];
        }
        else{
            var finalPosition = positions;
        }
        this._appliedItemIds.splice(finalPosition, 1);
        this._appliedEffectIndex.splice(finalPosition, 1);
        this.notifyStateChange();
        this.updateObjectProperties();
    };

    /**
     *
     * @param itemId
     * removes all itemIds that are the same.
     */
    proto.removeItem= function(itemId){
        var positions = this._appliedItemIds.indexOf(itemId);
        this._appliedItemIds.splice(positions, 1);
        this._appliedEffectIndex.splice(positions, 1);
        this.notifyStateChange();
        this.updateObjectProperties();
    };

    proto.updateObjectProperties = function () {

        this.parent.setInitTypeVars();

        // create change Object
        var toBeAdded = {};
        var BlockNames = Object.keys(this.parent._blocks);
        for (var i=0;i<BlockNames.length;i++) {
            toBeAdded[BlockNames[i]] = {};
        }

        // fill change Object
        // loop over items
        for (var i=0; i< this._appliedItemIds.length; i++){
            // get item from id
            var item = this.parent.gameData.layers.get(this.parent.mapId).mapData.items.get(this._appliedItemIds[i]);
            // sanity Check

            if (item._blocks.Feature._processedStack.effects[this._appliedEffectIndex[i]].currentTargetObjectIds.indexOf(this._appliedItemIds[i])){

                // get block values
                var variables = item._blocks.Feature._processedStack.effects[this._appliedEffectIndex[i]].variables;
                var blocks = item._blocks.Feature._processedStack.effects[this._appliedEffectIndex[i]].blocks;
                var operators = item._blocks.Feature._processedStack.effects[this._appliedEffectIndex[i]].operators;
                var changes = item._blocks.Feature._processedStack.effects[this._appliedEffectIndex[i]].changes;

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
                            var baseline = this.parent.objType._blocks[block][variable];
                            var times = (baseline*change)-baseline;
                            toBeAdded[block][variable]= Number(times);
                        }
                        else {
                            var baseline = this.parent.objType._blocks[block][variable];
                            var times = (baseline*change)-baseline;
                            toBeAdded[block][variable] += Number(times);
                        }
                    }
                }
            }
        };

        // apply change to Building Blocks
        for (var i=0;i<BlockNames.length;i++) {
            var currentBlock = toBeAdded[BlockNames[i]];
            var properties = Object.keys(currentBlock);
            for (var k=0;k<properties.length;k++) {
                var base= this.parent.objType._blocks[BlockNames[i]][properties[k]];
                this.parent._blocks[BlockNames[i]]._typeCache[properties[k]] = toBeAdded[BlockNames[i]][properties[k]] + base;
            }
        }

        this.setState(false);
        this.parent.notifyChange();
    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    FeatureManager.prototype.finalizeBlockClass('FeatureManager');
    exports.FeatureManager = FeatureManager

})(typeof exports === 'undefined' ? window : exports);

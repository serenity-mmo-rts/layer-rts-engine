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
            {_appliedItemIds: []}
        ];
    };

    proto.addItemId = function(itemId){
        if (this._appliedItemIds.indexOf("itemId")<0){
            this._appliedItemIds.push(itemId);
        }
        this.notifyStateChange();
        this.updateObjectProperties();
    };

    proto.updateObjectProperties = function () {


        this.parent.setInitTypeVars();

        // create change Object
        var toBeAdded = {};
        var BlockNames = Object.keys(this.mapObj._blocks);
        for (var i=0;i<BlockNames.length;i++) {
            toBeAdded[BlockNames[i]] = {};
        }

        // fill change Object
        // loop over items
        for (var i=0; i< this._appliedItemIds.length; i++){
            // get item from id
            var item = this.mapObj.gameData.layers.get(this.mapObj.mapId).mapData.items.get(this._appliedItemIds[i]);
            // sanity Check
            if (item._blocks.Feature._currentTargetObjectIds.indexOf(this._appliedItemIds[i])){

                // get block values
                var variables = item._blocks.Feature._variables;
                var blocks = item._blocks.Feature._blocks;
                var operators = item._blocks.Feature._operators;
                var changes = item._blocks.Feature._changes;

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
                            var baseline = this.mapObj.objType._blocks[block][variable];
                            var times = (baseline*change)-baseline;
                            toBeAdded[block][variable]= Number(times);
                        }
                        else {
                            var baseline = this.mapObj.objType._blocks[block][variable];
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
                var base= this.mapObj.objType._blocks[BlockNames[i]][properties[k]];
                this.mapObj._blocks[BlockNames[i]]._typeCache[properties[k]] = toBeAdded[BlockNames[i]][properties[k]] + base;
            }
        }

        this.setState(false);

    }



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    FeatureManager.prototype.finalizeBlockClass('FeatureManager');
    exports.FeatureManager = FeatureManager

})(typeof exports === 'undefined' ? window : exports);

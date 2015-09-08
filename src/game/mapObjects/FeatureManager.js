var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
}


(function (exports) {

    var FeatureManager = function (mapObject,initObj){

        // state vars
        this._change =false;
        this._appliedItemIds = [];

        // not seialized
        this.mapObj = mapObject;
    };

    FeatureManager.prototype= {

        updateStateVars: function(){

        },

        setState: function(value){
            this._change = value;
        },

        getState: function(){
            return this._change;
        },

        addItemId: function(itemId){
            if (this._appliedItemIds.indexOf("itemId")<0){
                this._appliedItemIds.push(itemId);
            }

        },

        updateObjectProperties: function () {

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
            }

            // apply change to Building Blocks
            for (var i=0;i<BlockNames.length;i++) {
                var currentBlock = toBeAdded[BlockNames[i]];
                var properties = Object.keys(currentBlock);
                for (var k=0;k<properties.length;k++) {
                    var base= this.mapObj.objType._blocks[BlockNames[i]][properties[k]];
                    this.mapObj._blocks[BlockNames[i]][properties[k]]= toBeAdded[BlockNames[i]][properties[k]] + base;
                }
            }

            this.setState(false);

        },


        save: function () {
            var o = {
            a :  [
                this._change,
                this._appliedItemIds
            ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._change = o.a[0];
                this._appliedItemIds = o.a[1];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    };

    exports.FeatureManager = FeatureManager;

})(typeof exports === 'undefined' ? window : exports);


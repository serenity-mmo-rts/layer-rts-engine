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

        setState: function(value){
            this._change = value;
        },

        getState: function(){
            return this._change;
        },

        addItemId: function(itemId){
            this._appliedItemIds.push(itemId);
        },

        updateObjectProperties: function () {

            for (var i=0; i< this._appliedItemIds.length; i++){
                // get item from id
                var item = this.mapObj.gameData.layers.get(this.mapObj.mapId).mapData.items.get(this._appliedItemIds[i]);
                // sanity Check
                if (item._blocks.Feature._currentTargetObjectIds.indexOf(this._appliedItemIds[i])){

                    // load feature vars
                    var variables = item._blocks.Feature._variables;
                    var blocks = item._blocks.Feature._blocks;
                    var operators = item._blocks.Feature._operators;
                    var changes = item._blocks.Feature._changes;

                    // apply feature
                    for (var k=0; k< blocks.length; k++) {

                        var variable = variables[k];
                        var block = blocks[k];
                        var operator = operators[k];
                        var change = changes[k];

                        if (operator=="plus"){
                            this.mapObj._blocks[block][variable]+= change;
                        }
                        else{
                            var toAdd  = this.mapObj._blocks[block][variable]*change;
                            this.mapObj._blocks[block][variable]= toAdd;
                        }
                    }

                }

            }

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


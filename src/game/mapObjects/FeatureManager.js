var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
}


(function (exports) {

    var FeatureManager = function (mapObject,initObj){

        // serialized:
        this._appliedFeatures = [];
        this._change =false;

        // not seialized
        this._mapObj = mapObject;
        //this.updateObjectProperties();
    };

    FeatureManager.prototype= {

        addFeature: function(itemId,itemOrObj,variables,blocks,operators,changes){
            var blockValid = true;
            var varValid = true;
            // check if block and variable exit exist
            for (var i = 0; i<blocks.length; i++){
                if (itemOrObj==1) { // object
                    if (!this._mapObj._blocks.hasOwnProperty(blocks[i])) {
                        blockValid = false;
                        if (!this._mapObj._blocks.hasOwnProperty(blocks[i]).hasOwnProperty(variables[i])) {
                            var varValid = false;
                        }
                    }
                }
                else if(itemOrObj==2){
                    var item = this.gameData.itemTypes.get(itemId)
                    if (!item._blocks.hasOwnProperty(blocks[i])) {
                        blockValid = false;
                        if (!item._blocks.hasOwnProperty(blocks[i]).hasOwnProperty(variables[i])) {
                            var varValid = false;
                        }
                    }
                }
            }

            if (blockValid && varValid){
                this.change = true;
                var feature = {
                    itemId: itemId,
                    itemOrObj:itemOrObj,
                    variables: variables,
                    blocks: blocks,
                    operators: operators,
                    changes: changes
                };
                this._appliedFeatures.push(feature);
            }



        },

        updateObjectProperties: function () {

            for (var i=0; i< this._appliedFeatures.length; i++){
                var feature = this._appliedFeatures[i];

                for (var k=0; k< feature.blocks.length; k++) {
                    var itemId = feature.itemId[k];
                    var itemOrObj = feature.itemOrObj[k];
                    var variable = feature.variables[k];
                    var blockName = feature.blocks[k];
                    var operator = feature.operators[k];
                    var change = feature.changes[k];

                    if (operator=="plus"){
                        this._mapObj._blocks[blockName][variable]+= change;
                        }
                    else{
                        var toAdd  = this._mapObj._blocks[blockName][variable]*change;
                        this._mapObj._blocks[blockName][variable]= toAdd;
                    }
                }

            }

        },


        save: function () {



            var ItemIds = [];
            var vars= [];
            var blocks = [];
            var operators = [];
            var changes = [];
            var count = 0;

            for (var k = 0; k<this._appliedFeatures.length;k++){
                var feature = this._appliedFeatures[k];
                vars[count]= feature.variables;
                blocks[count] = feature.blocks;
                operators[count] = feature.operators;
                changes[count] = feature.changes;
                count++
            }

            var o = {
            a :  [
                vars,
                blocks,
                operators,
                changes
            ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                if (o.hasOwnProperty("a2"))
                {
                    this.userId = o.a2[0];
                    this.healthPoints= o.a2[1];
                    this.buildQueue = o.a2[2];

                    for (var i = 0; i<o.a2[3].length; i++){
                        this.addFeature(o.a2[3][i],o.a2[4][i],o.a2[5][i],o.a2[6][i],o.a2[7][i])
                    }

                }


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


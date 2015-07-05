var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
}


(function (exports) {



    var FeatureManager = function (gameData,initObj){

        // serialized:

        // only ids serialized
        this.deployedItems = [];// get example: LaserTrooper = this.items['userId']['Index'];
        this.appliedItems = {};

        // not serialized
        this.properties = {};
        this.change =false;

        this.updateObjectProperties();
    };

    FeatureManager.prototype= {

        getItems: function (){
            return this.deployedItems
        },

        addItem: function (item){
            this.deployedItems.push(item);
        },

        addFeature: function(id,property,change,operator,mode){
            this.change = true;
            if (this.appliedItems.hasOwnProperty(id)){

                var object = {
                    property:property,
                    change: change,
                    operator: operator,
                    mode: mode
                };
                this.appliedItems[id].push(object);

            }
            else{
                this.appliedItems[id] = [];
                var object = {
                    property:property,
                    change: change,
                    operator: operator,
                    mode: mode
                };
                this.appliedItems[id].push(object);

            }

        },

        removeItemFromQueue: function(idx){
            this.buildQueue.splice(idx,1);
        },


        updateObjectProperties: function () {
            this.properties = {};
            var initProp = {};
            var prop = {};
            var initProp = this.gameData.objectTypes.get(this.objTypeId)._buildingBlocks;

            for (var attr in initProp) {
                prop[attr] = initProp[attr];
                this.properties[attr] = initProp[attr];
            }
            for (var id in this.appliedItems){
                var item = this.appliedItems[id];
                for (var i = 0;i<item.length;i++){
                    var feat = item[i];
                    if (feat.operator ==1) { // times
                        if (feat.mode ==1) { // apply to baseline
                            var change = prop[feat.property] * feat.change;
                            this.properties[feat.property] += change;
                        }
                        else if (feat.mode==2){ // apply to stack
                            var change = this.properties[feat.property] * feat.change;
                            this.properties[feat.property] += change;
                        }
                    }
                    else if (feat.operator ==2) { // plus
                        this.properties[feat.property] += feat.change;
                    }
                }
            }
        },


        save: function () {


            var buildQueueIds = [];
            for (var i=0; i<this.buildQueue.length ; i++) {
                buildQueueIds.push(this.buildQueue[i]._id);
            }

            var appliedItemIds = [];
            var appliedItemProps= [];
            var appliedItemValues = [];
            var appliedItemOperators = [];
            var appliedItemModes = [];
            var count = 0;
            for (var id in this.appliedItems)  {

                for (var k = 0; k<this.appliedItems[id].length;k++){
                    var feature = this.appliedItems[id][k];
                    appliedItemIds[count] = id;
                    appliedItemProps[count]= feature.property;
                    appliedItemValues[count] = feature.change;
                    appliedItemOperators[count] = feature.operator;
                    appliedItemModes[count] = feature.mode;
                    count++
                }
            }

            var deployedItemIds= [];
            for (var i=0; i<this.deployedItems.length; i++) {
                deployedItemIds.push(this.deployedItems[i]._id);
            }

            var o = {
            a :  [this.userId,
                this.healthPoints,
                buildQueueIds,
                appliedItemIds,
                appliedItemProps,
                appliedItemValues,
                appliedItemOperators,
                appliedItemModes
            ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this._super(o);
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


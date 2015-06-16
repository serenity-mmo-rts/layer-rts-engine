var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
}


(function (exports) {



    var UserObject = function (gameData,initObj){

            // serialized:
            this.userId = 0;
            this.ownerIds = []; // String List of owner Ids
            this.healthPoints = 0;


            // only ids serialized
            this.deployedItems = [];// get example: LaserTrooper = this.items['userId']['Index'];
            this.appliedItems = {};
            this.buildQueue = [];

            // not serialized
            this.properties = {};
    };

    UserObject.prototype= {

        getMaxHealthPoints: function(){
            if (this.change){
                this.updateObjectProperties();
                this.change = false;
            }
            return this.properties._maxHealthPoints;
        },
        getHealthPoints: function(){
            this.healthPoints = this.properties._maxHealthPoints;
            if (this.change){
                this.updateObjectProperties();
                this.change = false;
                this.healthPoints = this.properties._maxHealthPoints;
            }
            return this.healthPoints;
        },

        getPoints: function(){
            if (this.change){
                this.updateObjectProperties();
                this.change = false;
            }
            return this.properties._points;
        },

        getItems: function (){
            return this.deployedItems
        },

            // member functions
       getLevel: function (points){
           var level = 0;
                    if (points >= 0 && points <10){
                        level= 1;
                    }
                    else if (points >= 10 && points <30){
                        level= 2;
                    }
                    else if(points >= 30 && points <50){
                        level= 3;
                    }
                    else if (points >= 50 && points <100){
                        level= 4;
                    }
                     else if (points >= 100 && points <200){
                        level= 5;
                    }

                return level
        },

        setPointers : function(){
            this._super();

            var buildQueueIds = this.buildQueue;
            this.buildQueue = [];
            for (var i=0; i<buildQueueIds.length ; i++) {
                this.buildQueue.push(this.gameData.layers.get(this.mapId).eventScheduler.events.get(buildQueueIds[i]));
            }
        },

        setHealthPoints: function(){
            this.healthPoints = this._maxHealthPoints;
        },


        addItemToQueue: function(item){
            this.buildQueue.push(item);
        },

        addItem: function (item){
            this.deployedItems.push(item);
        },

        removeItemFromQueue: function(idx){
            this.buildQueue.splice(idx,1);
        },

        checkQueue: function(currentTime) {

           // console.log("checkQueue with currentTime: "+(new Date(currentTime)).toUTCString());

           if (this.buildQueue.length>0){
               if(this.buildQueue[0]._state == eventStates.VALID) {
                    this.buildQueue[0].start(currentTime);
               }
           }

        },


        save: function () {
            var o = this._super();
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


            o.a2 =  [this.userId,
                     this.healthPoints,
                    buildQueueIds,
                    appliedItemIds,
                    appliedItemProps,
                    appliedItemValues,
                    appliedItemOperators,
                    appliedItemModes
                    ];
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

    exports.UserObject = UserObject;

})(typeof exports === 'undefined' ? window : exports);


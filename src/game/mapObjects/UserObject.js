var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
}


(function (exports) {



    var UserObject = MapObject.extend({

        init: function UserObject(gameData,initObj) {

            // serialized:
            this.userId = 0; // optional
            this.healthPoints = 0;
            this.ownerIds = []; // String List of owner Ids
            this.objectProperties = {};
            this.buildQueue = [];
            this.items = [];// get example: LaserTrooper = this.items['userId']['Index'];
            this.appliedFeatures = [];
            this.playerMoneyInOutPerSec =0;

            this.populationLoan = 0;
            this.populationCosts = 0;
            this.ressources = {};
            // this.ressources['user5467']['carbon'] =  {
            //    stored: 0,
            //    inOutPerSecEff : 0,
            //    inOutPerSecREq :0,
            //    capacity :0
            // }

            this.activities = [];
            // this.activities[activityID]=  {
            //    attractivity : 0,
            //    currentPopulation : 0,
            //    peopleInOutPerSec : 0,
            //    capacity : 0,
            //    occupationRate : 0
            //
            this._super( gameData, initObj );
        },

            // member functions
       getLevel: function (points){
                var level =0;
                switch(points){
                    case points > 0 && points <100:
                        level= 1;
                        break;
                    case points >= 100 && points <300:
                        level= 2;
                        break;
                    case points >= 300 && points <500:
                        level= 3;
                        break;
                    case points >= 500 && points <1000:
                        level= 4;
                        break;
                    case points >= 1000 && points <2000:
                        level= 5;
                        break;
                }
                return level
        },

        addItemToQueue: function(item){
            this.buildQueue.push(item);
        },

        removeItemFromQueue: function(idx){
            this.buildQueue.splice(idx,1);
        },

        checkQueue: function(currentTime) {

            console.log("checkQueue with currentTime: "+(new Date(currentTime)).toUTCString());

           if (this.buildQueue.length>0){
               if(this.buildQueue[0]._state == eventStates.VALID) {
                    this.buildQueue[0].start(currentTime);
               }
           }

        },

        setPointers : function(){
            this._super();
            var buildQueueIds = this.buildQueue;
            this.buildQueue = [];
            for (var i=0; i<buildQueueIds.length ; i++) {
                this.buildQueue.push(this.gameData.maps.get(this.mapId).eventScheduler.events.get(buildQueueIds[i]));
            }

        },


        updateObjectProperties: function () {

                var initProp = this.gameData.objectTypes.get(this.objTypeId)._initProperties;
                var newProp = initProp;
                for (var i =0;i<this.items[this.userId].length;i++){
                    var item = this.items[this.userId][i];
                    newProp = item.applyToObject(initProp,newProp);
                }
                this.objectProperties = newProp;
        },

        save: function () {
            var o = this._super();
            var buildQueueIds = [];
            for (var i=0; i<this.buildQueue.length ; i++) {
                buildQueueIds.push(this.buildQueue[i]._id);
            }

            o.a2 =  [this.userId,
                    buildQueueIds];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this._super(o);
                if (o.hasOwnProperty("a2"))
                {
                    this.userId = o.a2[0];
                    this.buildQueue = o.a2[1];
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

    });

    exports.UserObject = UserObject;

})(typeof exports === 'undefined' ? window : exports);


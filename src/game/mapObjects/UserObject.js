var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./MapObject').MapObject;

}


(function (exports) {

    var userObjectStates = {};
    userObjectStates.TEMP = 0;
    userObjectStates.WORKING = 1;
    userObjectStates.FINISHED = 2;


    var UserObject = MapObject.extend({

        init: function UserObject(gameData,initObj) {

            // serialized:
            this.userId = 0; // optional
            this.state = userObjectStates.TEMP;
            this.healthPoints = 0;
            this.ownerIds = []; // String List of owner Ids
            this.items = [];// get example: LaserTrooper = this.items['userId']['Index'];

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

            this.getPoints = function(){
                var totalPoints = this.gameData.objectTypes.get(this.objTypeId)._points;
                for (var i =0;i<this.items.length;i++){
                    var item = this.items['userId'][i];
                    var points = this.gameData.itemTypes.get(item._itemTypeId)._points[item._level];
                    totalPoints+=points;
                }
                return totalPoints;
            };

            // member functions
            this.getLevel = function(points){
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
            };

            this.getMaxHealthPoints = function(){
                var startHP = this.gameData.objectTypes.get(this.objTypeId)._maxHealthPoints;
                var itemHP=startHP;
                var newHP = 0;
                for (var i =0;i<this.items.length;i++){
                    var item = this.items['userId'][i];
                    newHP =item.applyToObject("_maxHealthPoints",itemHP);
                    itemHP += newHP;
                }
                var totalHP = itemHP;
                return totalHP;
            };

            this.getDefensePoints = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getOffensePoints = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getFreeItemSlots = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getFreeUpgradeSlots = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getFreeUnitSlots = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getRange = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getPlayerMoneyInOutPerSec = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getPopulationLoan = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };

            this.getPopulationPayments = function(){
                //do X
                var MaxHealthPoints = 1;
                return MaxHealthPoints;
            };



            // not serialized:
            this.gameData = gameData;

            // init:
            if (UserObject.arguments.length == 2) {
                this.load(initObj);
            }
        },

        save: function () {
            var o = this._super();
            o.a2 =  [this.userId,
                    this.state];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this._super(o);
                if (o.hasOwnProperty("a2"))
                {
                    this.userId = o.a2[0];
                    this.state = o.a2[1];
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

    exports.userObjectStates = userObjectStates;
    exports.UserObject = UserObject;

})(typeof exports === 'undefined' ? window : exports);


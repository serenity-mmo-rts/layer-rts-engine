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
            this.state = userObjectStates.FINISHED;

            // new member variables
            this.level= 0;
            this.range = 0;

            this.freeItemSlots = 0;
            this.freeUnitSlots = 0;
            this.freeUpgradeSlots = 0;

            this.totalHealthPoints = 0;
            this.totalDefensePoints = 0;
            this.totalOffensePoints = 0;

            this.ownerIds = []; // String List of owner Ids

            this.ressources = {}

            // this.ressources['user5467']['carbon'] =  {
            //    stored: 0,
            //    inOutPerSecEff : 0,
            //    inOutPerSecREq :0,
            //    capacity :0
            // }


            this.units = []; // get example: carbonAmount = this.units['user5467']['supertank'];
            this.items = [];
            this.upgrade = [];

            this.playerMoneyInOutPerSec = 0;
            this.populationLoan =0;
            this.populationPayments = 0;

            this.activities = [];

            // this.activities[activityID]=  {
            //    attractivity : 0,
            //    currentPopulation : 0,
            //    peopleInOutPerSec : 0,
            //    capacity : 0,
            //    occupationRate : 0
            //    }




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


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
            this._userId = 0;
            this._ownerIds = []; // String List of owner Ids
            this._healthPoints = this.setHealthPointsToMax();

            // not serialized
            this._properties = {};
    };


    UserObject.prototype= {

        getMaxHealthPoints: function(){
            return this._properties._maxHealthPoints;
        },

        getHealthPoints: function(){
            return this._healthPoints;
        },

        setHealthPointsToMax: function(){
            this._healthPoints = this.getMaxHealthPoints;
        },

        getPoints: function(){
            return this._properties._points;
        },


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


        save: function () {

            o.a =  [this.userId,
                     this.healthPoints,
                    ];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this.userId = o.a[0];
                this.healthPoints= o.a[1];
                this.buildQueue = o.a[2];

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


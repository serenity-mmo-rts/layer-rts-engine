var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
}


(function (exports) {



    var UserObject = function (mapObj, blockStateVars){

            // state:
            this._userId = 0;
            this._healthPoints = this.setHealthPointsToMax();

            // helper
            this.mapObject = mapObj;


            // call
            this.recalculateTypeVariables();
            this.load(blockStateVars);
            this.setPointers();
    };



    UserObject.prototype= {

        recalculateTypeVariables: function() {

            // define default type vars:
            this.maxHealthPoints = 0;
            this.points = 0;
        },

        getMaxHealthPoints: function(){
            return this.maxHealthPoints;
        },

        getHealthPoints: function(){
            return this._healthPoints;
        },

        setHealthPointsToMax: function(){
            this._healthPoints = this.getMaxHealthPoints;
            return this._healthPoints;
        },

        setHubConnection: function(hubId) {
            this._connectedToHub = hubId;
        },

        getPoints: function(){
            return this.points;
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

        setPointers : function(){
            this.objType = this.mapObject.objectType;
        },


        save: function () {

            var o = {
                    a:[this.userId,
                     this.healthPoints,
                    ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this.userId = o.a[0];
                this.healthPoints= o.a[1];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }

            this.setPointers();
        }

    };

    exports.UserObject = UserObject;

})(typeof exports === 'undefined' ? window : exports);


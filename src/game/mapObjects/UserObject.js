var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
}


(function (exports) {



    var UserObject = function (mapObj, blockStateVars){

            // helper
            this.mapObject = mapObj;


            // call
            this.initializeTypeVariables();
            this.load(blockStateVars);
            this.setPointers();
    };



    UserObject.prototype= {

        initializeTypeVariables: function() {
            // define default type vars:
            this.maxHealthPoints = 0;
            this.points = 0;
            this._userId = 0;
        },


        /**
         * This function defines the default type variables and returns them as an object.
         */
        defineTypeVars: function() {
            return {
                maxHealthPoints: 100,
                points: 0
            };
        },


        /**
         * This function defines the default state variables and returns them as an object.
         */
        defineStateVars: function() {
            return {
                userId: 0
            };
        },

        updateStateVars: function(){
            if (this._healthPoints==undefined){
                this.setHealthPointsToMax();
            }

        },

        getMaxHealthPoints: function(){
            return this.maxHealthPoints;
        },

        getHealthPoints: function(){
            return this._healthPoints;
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

        setHealthPointsToMax: function(){
            this._healthPoints = this.getMaxHealthPoints();
        },

        setHubConnection: function(hubId) {
            this._connectedToHub = hubId;
        },


        save: function () {

            var o = {
                    a:[this._userId,
                        this._healthPoints,
                        this._points
                    ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this._userId = o.a[0];
                this._healthPoints= o.a[1];
                this._points = o.a[2];
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


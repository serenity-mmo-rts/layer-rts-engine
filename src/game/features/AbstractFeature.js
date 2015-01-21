var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
}


(function (exports) {

    var featureStates = {};
    featureStates.INITIALIZED = 0;
    featureStates.INVALID = 1;
    featureStates.VALID = 2;
    featureStates.EXECUTING = 3;
    featureStates.FINISHED = 4;

    var AbstractFeature = Class.extend({

        _gameData: null,
        _id: null,
        _mapId: null,
        _state:null,
        _dueTime: null,
        _type: null,
        _mapObj: null,


        init: function(gameData, initObj) {
            this._gameData = gameData;
                // deserialize event from json object
                this.load(initObj);
        },

        applyToObject: function (initProp) {

            return initProp
        },


        canSelectObject: function(){

            return false;
        },

        canSelectItem: function(){

            return false;
        },

        canBeActivated: function(){

            return false;
        },


        isValid: function(key,initProp){
            var check  = false;
            if(initProp.hasOwnProperty(key)){
                check = true;
            }
            return check
        },


        save: function () {
            var o = {_id: this._id,
                _type: this._type,
                a: [this._mapId,
                    this._state,
                    this._dueTime,
                    this._mapObj]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._mapId = o.a[0];
                this._state = o.a[1];
                this._dueTime = o.a[2];
                this._mapObj = o.a[3];

            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        },


        updateFromServer: function (event) {
            //overwrite with method to bring this event up to date
        },

        applyToGame: function() {
            //overwrite
        },

        revert: function() {
            //overwrite
        }


    });



    exports.featureStates = featureStates;
    exports.AbstractFeature = AbstractFeature;

})(node ? exports : window);


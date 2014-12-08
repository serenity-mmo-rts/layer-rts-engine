var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var DefenseEnhancer = require('./AdditiveFeature');
    var ProductivityEnhancer = require('./MultiplierFeature');
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

        setInvalid: function () {
            this._state = featureStates.INVALID;
        },

        isValid: function () {
            //overwrite
        },

        execute: function (callback) {
            //overwrite
        },

        apply: function () {
            //overwrite
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

    exports.createGameFeature = function(gameData,initObj) {
        var feature = null;
        if (initObj._type == "MultiplierFeature") {
            if (node) {
               feature = new MultiplierFeature.MultiplierFeature(gameData,initObj);
            }
            else {
                feature = new MultiplierFeature(gameData,initObj);
            }
        }

        else if (initObj._type == "AdditiveFeature") {
            if (node) {
                feature = new AdditiveFeature.AdditiveFeature(gameData,initObj);
            }
            else {
                feature = new AdditiveFeature(gameData,initObj);
            }
        }
        return feature;
    };

    exports.featureStates = featureStates;
    exports.AbstractFeature = AbstractFeature;

})(node ? exports : window);


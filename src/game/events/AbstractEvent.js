var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var BuildObjectEvent = require('./BuildObjectEvent');
}

(function (exports) {

    var eventStates = {};
    eventStates.INITIALIZED = 0;
    eventStates.INVALID = 1;
    eventStates.VALID = 2;
    eventStates.EXECUTING = 3;
    eventStates.FINISHED = 4;

    var AbstractEvent = Class.extend({

        _gameData: null,
        _id: null,
        _mapId: null,
        _nextEvent: null,
        _dueTime: null,
        _state: null,
        _userId: null,

        init: function(gameData, initObj) {
            this._gameData = gameData;
            if (arguments.length == 1 || initObj==null ) {
                // create new event
                this._id = 'tmpId'+Math.random();
                this._state = eventStates.INITIALIZED;
                this._dueTime = 0;
            }
            else {
                // deserialize event from json object
                this.load(initObj);
            }
        },

        setInvalid: function () {
            this._state = eventStates.INVALID;
        },

        isValid: function () {
            //overwrite
        },

        execute: function (callback) {
            //overwrite
        },

        finish: function () {
            //overwrite
        },

        save: function () {
            var o = {_id: this._id,
                _type: this._type,
                a: [this._mapId,
                    this._nextEvent,
                    this._state]
            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._mapId = o.a[0];
                this._nextEvent = o.a[1];
                this._state = o.a[2];
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

    exports.createGameEvent = function(gameData,initObj) {
        var event = null;
        if (initObj._type == "BuildObjectEvent") {
            if (node) {
                event = new BuildObjectEvent.BuildObjectEvent(gameData,initObj);
            }
            else {
                event = new BuildObjectEvent(gameData,initObj);
            }
        }
        return event;
    };

    exports.eventStates = eventStates;
    exports.AbstractEvent = AbstractEvent;

})(node ? exports : window);

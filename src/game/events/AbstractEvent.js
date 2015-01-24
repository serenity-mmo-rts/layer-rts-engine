var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
}

(function (exports) {

    var eventStates = {};
    eventStates.INITIALIZED = 0;
    eventStates.INVALID = 1;
    eventStates.VALID = 2; //PENDING
    eventStates.EXECUTING = 3;
    eventStates.FINISHED = 4;

    var AbstractEvent = Class.extend({

        _gameData: null,
        _id: null,
        _type: "AbstractEvent",
        _mapId: null,
        _nextEvents: [],
        _startedTime: null,
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

        setValid: function(){
            this._state = eventStates.VALID;
        },

        isValid: function () {
            //overwrite
        },

        execute: function () {
            //overwrite
        },

        executeOnServer: function(callback) {
            //overwrite
        },

        updateFromServer: function (event) {
            this._id = event._id;
            this._startedTime = event._startedTime;
            this._dueTime = event._dueTime;
        },

        applyToGame: function() {
            //overwrite
        },

        start: function(curTime){
            this._state = eventStates.EXECUTING;
            this._startedTime = curTime;
        },

        updateDueTime: function(curTime) {
            //overwrite
        },

        finish: function () {
          //  if (this._nextEvents.length > 0) {
          //      this._nextEvents[0].start(this._dueTime);
          //  }
        },

        save: function () {
            var o = {_id: this._id,
                _type: this._type,
                _mapId: this._mapId,
                a: [this._nextEvent,
                    this._startedTime,
                    this._dueTime,
                    this._state,
                    this._userId]
            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._type = o._type;
                this._mapId = o._mapId;
                this._nextEvent = o.a[0];
                this._startedTime = o.a[1];
                this._dueTime = o.a[2];
                this._state = o.a[3];
                this._userId = o.a[4];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        },


        revert: function() {
            //overwrite
        }

    });

    exports.eventStates = eventStates;
    exports.AbstractEvent = AbstractEvent;

})(node ? exports : window);

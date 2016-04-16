var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {


    var AbstractEvent = Class.extend({

       // serialized
        _id: null,
        _userId: null,
        _mapId: null,
        _type: "AbstractEvent",
        _startedTime: null,
        _isFinished: false,

        // not serialized
        _gameData: null,

        init: function(gameData, initObj) {
            this._gameData = gameData;
            if (arguments.length == 1 || initObj==null ) {
                // create new event
                this._id = 'tmpId'+Math.random();
                if (!node){
                    this._userId = uc.userId;
                    this._mapId = uc.layerView.mapId;
                }
            }
            else {
                // deserialize event from json object
                this.load(initObj);
            }
        },

        isValid: function () {
            //overwrite
        },

        setFinished: function(){
            this._isFinished = true;
            this._gameData.layers.get(this._mapId).eventScheduler.finishEvent(this);
        },

        setState: function(){
            event.setValid();
        },

        executeOnClient: function () {
            //overwrite
        },

        executeOnServer: function() {
            //overwrite
        },

        executeOnOthers: function() {
            //overwrite
        },

        execute: function () {
            //overwrite
        },

        start: function(curTime){
            this._startedTime = curTime;
        },


        updateFromServer: function (event) {
            console.log("replace tmp event Id: "+this._id+" by new id from server: "+event._id);
            this._gameData.layers.get(this._mapId).eventScheduler.updateEventId(this._id,event._id);
            this._id = event._id;
            console.log("replace event execution time  "+this._startedTime+" by new execution time "+event._startedTime);
            this._startedTime = event._startedTime;
        },


        revert: function() {
            //overwrite
        },

        setPointers: function () {
            //overwrite
            this.map = this._gameData.layers.get(this._mapId);
        },

        save: function () {
            var o = {_id: this._id,
                    _userId: this._userId,
                    _mapId: this._mapId,
                    _type: this._type,
                    a: [
                        this._startedTime,
                        this._isFinished
                    ]};
        return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._userId = o._userId;
                this._mapId = o._mapId;
                this._type = o._type;
                this._startedTime = o.a[0];
                this._isFinished = o.a[1];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }
        }

    });

    exports.AbstractEvent = AbstractEvent;

})(node ? exports : window);

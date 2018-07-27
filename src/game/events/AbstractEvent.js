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
        oldId: null,
        userId: null,
        mapId: null,
        type: "AbstractEvent",
        startedTime: null,
        isFinished: false,

        // not serialized
        gameData: null,

        init: function(gameData, initObj) {
            this.gameData = gameData;
            if (arguments.length == 1 || initObj==null ) {
                // create new event
                this._id = 'tmpId'+Math.random();
                if (!node){
                    this.userId = uc.userId;
                    this.mapId = uc.layerView.mapId;
                }
            }
            else {
                // deserialize event from json object
                this.load(initObj);
            }
        },

        notifyServer: function() {
            return null;
        },

        isValid: function () {
            //overwrite
        },

        setFinished: function(){
            this.isFinished = true;
        },

        setState: function(){
        },

        executeOnClient: function () {

        },

        executeOnServer: function() {

        },

        executeOnOthers: function() {

        },

        execute: function () {
            //overwrite
        },

        /*
        start: function(curTime){
            this.startedTime = curTime;
        },
        */


        updateFromServer: function (event) {
            console.log("replace tmp event Id: "+this._id+" by new _id from server: "+event._id);
            this.gameData.layers.get(this.mapId).eventScheduler.updateEventId(this._id,event._id);
            this._id = event._id;
            console.log("replace event execution time  "+this.startedTime+" by new execution time "+event.startedTime);
            this.startedTime = event.startedTime;
        },


        revert: function() {
            //overwrite
        },

        setPointers: function () {
            //overwrite
            this.map = this.gameData.layers.get(this.mapId);
        },

        save: function () {
            var o = {_id: this._id,
                    userId: this.userId,
                    mapId: this.mapId,
                    type: this.type,
                    a: [
                        this.oldId,
                        this.startedTime,
                        this.isFinished
                    ]};
        return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.userId = o.userId;
                this.mapId = o.mapId;
                this.type = o.type;
                this.oldId = o.a[0];
                this.startedTime = o.a[1];
                this.isFinished = o.a[2];
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

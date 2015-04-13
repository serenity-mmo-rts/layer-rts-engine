var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../mapObjects/MapObject').MapObject;
    var mapObjectStates = require('../mapObjects/MapObject').mapObjectStates;
    var ItemModel =require('../ItemModel').ItemModel;
    var itemStates =require('../ItemModel').itemStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildItemEvent = AbstractEvent.extend({

        _type: "BuildItemEvent",
        _item: null,


        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },


        isValid: function () {
            return true;

        },

        setItem: function (item) {
            this._item = item;
            this._mapId = this._item._mapId;
        },

        execute: function () {
          //  this._item._state = itemStates.WORKING;
            this._item._id = 'tmpId'+Math.random();
            this._dueTime = Infinity;

            this._item._mapObj.addItemToQueue(this);
            this._item._mapObj.checkQueue(Date.now());
            console.log("I build a " + this._item._itemTypeId + " in map Object" +this._item._objectId);

            this._super();
        },

        executeOnServer: function () {

            var self = this;
            this._item._id = new mongodb.ObjectID();

            this._dueTime = Infinity;
            this._item._mapObj.addItemToQueue(this);
            this._item._mapObj.checkQueue(Date.now());

            dbConn.get('mapObjects', function (err, collMapObjects) {
                if (err) throw err;
                collMapObjects.save(self._item._mapObj.save(), function(err,docs) {
                    if (err) throw err;
                    console.log("updated map object in db with new buildQueue");
                });
            });

            this._super();
        },


        executeOnOthers: function() {

            this._item._mapObj.addItemToQueue(this);
            this._super();
        },

        updateFromServer: function (event) {
           this._super(event);
           console.log("replace tmp Item ID: "+this._item._id+" by new id from server: "+event._item._id);
           this._item._id = event._item._id;
        },

        start: function(startTime){
            this._super(startTime);
            this.setDueTime();
            this._item._mapObj.state = mapObjectStates.WORKING;

        },

        progress: function(){
           var totalTimeNeeded = this._dueTime -this._startedTime;
           var currentTime  = Date.now();
           var timeLeft =  this._dueTime-currentTime;
           var percent = (timeLeft/totalTimeNeeded)*100;
           return 100-percent
        },

        setDueTime: function(){
            var buildTime = this._gameData.itemTypes.get(this._item._itemTypeId)._initProperties._buildTime[this._item._level];
            this._dueTime = this._startedTime + buildTime;
        },

        finish: function () {
            this._item._mapObj.state = mapObjectStates.FINISHED;

            console.log("item: "+this._item._id+" production completed");
           // this._item.setState(itemStates.FINISHED);
            this._item._mapObj.removeItemFromQueue(0);
            this._item._mapObj.items.push(this._item);
            this._gameData.maps.get(this._mapId).addItem(this._item);
            this._item._mapObj.checkQueue(this._dueTime);

            if (node) {
                var self = this;
                dbConn.get('items', function (err, collItems) {
                    if (err) callback(err);
                    collItems.insert(self._item.save(), function(err,docs) {
                        if (err) throw(err);
                        console.log("a user build a " + self._item._itemTypeId + " in "+ self._item._objectId);
                    });
                });
                dbConn.get('mapObjects', function (err, collMapObjects) {
                    if (err) throw err;
                    collMapObjects.save(self._item._mapObj.save(), function(err,docs) {
                        if (err) throw err;
                        console.log("updated map object in db with new buildQueue");
                    });
                });
            }

            this._super();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._item.save()];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                var itemId = o.a2[0]._id;
                if(this._gameData.maps.get(this._mapId).items.get(itemId)) {
                    this._gameData.maps.get(this._mapId).items.get(this._item._id).load(o.a2[0]);
                    this._item = this._gameData.maps.get(this._mapId).items.get(this._item._id);
                }
                else {
                    this._item = new ItemModel(this._gameData,o.a2[0]);
                }
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
            this._gameData.maps.get(this._mapId).removeItem(this._Item);
            return true;
        }
    });

    exports.BuildItemEvent = BuildItemEvent;

})(node ? exports : window);

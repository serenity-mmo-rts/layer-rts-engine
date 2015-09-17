var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var Item =require('../Item').Item;
    var itemStates =require('../Item').itemStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildUpgradeEvent = AbstractEvent.extend({

        _type: "BuildUpgradeEvent",
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
            this._item._mapObj._blocks.UpgradeProduction.addItemToQueue(this);
            this._item._mapObj._blocks.UpgradeProduction.checkQueue(Date.now());
            console.log("I build a " + this._item._itemTypeId + " in map Object" +this._item._objectId);
            this._super();
        },

        executeOnServer: function () {

            var self = this;
            this._item._id = (new mongodb.ObjectID()).toHexString();
            this._item._blocks.Feature._itemId =  this._item._id;

            this._item._mapObj._blocks.UpgradeProduction.addItemToQueue(this);
            this._item._mapObj._blocks.UpgradeProduction.checkQueue(Date.now());

            dbConn.get('items', function (err, collItems) {
                if (err) callback(err);
                collItems.save(self._item.save(), function(err,docs) {
                    if (err) throw(err);
                    console.log("successfully saved item " + self._item._id + " to db");
                });
            });

            /*dbConn.get('mapObjects', function (err, collMapObjects) {
                if (err) throw err;
                collMapObjects.save(self._item._mapObj.save(), function(err,docs) {
                    if (err) throw err;
                    console.log("updated map object in db with new buildQueue");
                });
            });*/

            this._super();
        },


        executeOnOthers: function() {

            this._item._mapObj._blocks.UpgradeProduction.addItemToQueue(this);
            this._super();
        },

        updateFromServer: function (event) {
           this._super(event);
           console.log("replace tmp Item ID: "+this._item._id+" by new id from server: "+event._item._id);
           this._item._id = event._item._id;
           this._item._blocks.Feature._itemId = event._item._id;

        },

        start: function(startTime){
            this._super(startTime);
            //this._item._mapObj.state = mapObjectStates.WORKING;
           // this._item._mapObj.setState(mapObjectStates.WORKING);
           // HACK
            this._item._mapObj.setState(1);
            this.saveToDb();
        },

        progress: function(){
           var totalTimeNeeded = this._dueTime -this._startedTime;
           var currentTime  = Date.now();
           var timeLeft =  this._dueTime-currentTime;
           var percent = (timeLeft/totalTimeNeeded)*100;
           return 100-percent
        },

        updateDueTime: function(){
            if (this._startedTime) {
                var buildTime = this._gameData.itemTypes.get(this._item._itemTypeId)._buildTime[this._item._level];
                this.setDueTime(this._startedTime + buildTime);
            }
            else {
                this.setDueTime(0);
            }
        },


        finish: function () {


            console.log("item: "+this._item._id+" production completed");

            this._item._mapObj._blocks.UpgradeProduction.removeItemFromQueue(0);
            this._item.setLevel(1);

            this._item.setPointers();
            //this._item._mapObj.addItem(this._item);

            this._gameData.layers.get(this._mapId).mapData.addItem(this._item);
            this._item._blocks.Feature.checkStackExecution(false);
            this._item._mapObj._blocks.UpgradeProduction.checkQueue(this._dueTime);

            //this._item._mapObj.setState(mapObjectStates.FINISHED);
            // HACK
            this._item._mapObj.setState(2);
            this._item._mapObj.notifyChange();

            if (node) {
                var self = this;
                dbConn.get('items', function (err, collItems) {
                    if (err) callback(err);

                    //TODO: Check if we should use insert or save. The item is already saved to db within the event!
                    collItems.save(self._item.save(), function(err,docs) {
                        if (err) throw(err);
                        console.log("successfully saved item " + self._item._id + " to db");
                    });
                });

                // TODO: Probably the following is not needed, because the items are stored in their own list
                /*dbConn.get('mapObjects', function (err, collMapObjects) {
                    if (err) throw err;
                    collMapObjects.save(self._item._mapObj.save(), function(err,docs) {
                        if (err) throw err;
                        console.log("updated map object in db with new buildQueue");
                    });
                });*/
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
                if(this._gameData.layers.get(this._mapId).mapData.items.get(itemId)) {
                    this._gameData.layers.get(this._mapId).mapData.items.get(this._item._id).load(o.a2[0]);
                    this._item = this._gameData.layers.get(this._mapId).mapData.items.get(this._item._id);
                }
                else {
                    this._item = new Item(this._gameData,o.a2[0]);
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
            this._gameData.layers.get(this._mapId).removeItem(this._item);
            return true;
        }
    });

    exports.BuildUpgradeEvent = BuildUpgradeEvent;

})(node ? exports : window);

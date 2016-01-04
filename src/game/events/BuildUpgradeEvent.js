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

        //serialized:
        _itemTypeId: null,
        _newItemId: null,
        _parentObjectId: null,

        //not serialized
        _parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {
            return true;
        },

        setItemTypeId: function (itemTypeId) {
            this._itemTypeId = itemTypeId;
        },

        setParentObject: function(parentObject) {
            this._parentObjectId = parentObject._id;
            this._parentObject = parentObject;
            this.setMapId(parentObject.mapId);
        },

        execute: function () {

            this._newItemId = 'tmpId'+Math.random();

            this._parentObject._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._parentObject._blocks.UpgradeProduction.checkQueue(Date.now());
            console.log("I start building a " + this._itemTypeId + " in map Object" +this._parentObjectId);
            this._super();
        },

        executeOnServer: function () {
            var self = this;
            this._newItemId = (new mongodb.ObjectID()).toHexString()
            this._parentObject._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._parentObject._blocks.UpgradeProduction.checkQueue(Date.now());
            this._super();
        },

        executeOnOthers: function() {
            this._parentObject._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._super();
        },

        updateFromServer: function (event) {
            this._super(event);
            console.log("replace tmp Item ID: "+this._newItemId+" by new id from server: "+event._newItemId);
            this._newItemId = event._newItemId;
        },

        start: function(startTime){
            this._super(startTime);
            this._parentObject.setState(1);
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
                var buildTime = this._gameData.itemTypes.get(this._itemTypeId)._buildTime[0];
                this.setDueTime(this._startedTime + buildTime);
            }
            else {
                console.log('error: started time was not set...')
                this.setDueTime(0);
            }
        },


        finish: function () {

            console.log("item: "+this._newItemId+" production completed");

            var item = new Item(this._gameData, {_id: this._newItemId, _objectId: this._parentObjectId, _itemTypeId: this._itemTypeId, _mapId: this._mapId, _level: 1});

            this._gameData.layers.get(this._mapId).mapData.addItem(item);
            item.setPointers();
            item._blocks.Feature.checkStackExecution(false);

            this._parentObject.setState(2);
            this._parentObject._blocks.UpgradeProduction.removeItemFromQueue(0);
            this._parentObject._blocks.UpgradeProduction.checkQueue(this._dueTime);

            this._super();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._itemTypeId,
                this._newItemId,
                this._parentObjectId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemTypeId = o.a2[0];
                this._newItemId = o.a2[1];
                this._parentObjectId = o.a2[2];
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
            //this._gameData.layers.get(this._mapId).removeItem(this._item);
            //TODO
            return true;
        },

        setPointers: function() {
            this._super( );
            this._parentObject = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._parentObjectId);
        }

    });

    exports.BuildUpgradeEvent = BuildUpgradeEvent;

})(node ? exports : window);

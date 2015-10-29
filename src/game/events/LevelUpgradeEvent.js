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

    var LevelUpgradeEvent = AbstractEvent.extend({

        _type: "LevelUpgradeEvent",
        _item: null,
        _desiredLevel: 0,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setItem: function (item) {
            this._item = item;
            this._desiredLevel = this._item.getLevel() +1;
            this._mapId = this._item._mapId;
        },


        execute: function () {
            //  this._item._state = itemStates.WORKING;
            this._item._mapObj._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._item._mapObj._blocks.UpgradeProduction.checkQueue(Date.now());
            console.log("I upgraded a " + this._item._itemTypeId + " in map Object" +this._item._objectId);
            this._super();
        },

        executeOnServer: function () {

            var self = this

            this._item._mapObj._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._item._mapObj._blocks.UpgradeProduction.checkQueue(Date.now());



            this._super();
        },


        executeOnOthers: function() {

            this._item._mapObj._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._super();
        },

        updateFromServer: function (event) {
            this._super(event);
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
                var buildTime = this._gameData.itemTypes.get(this._item._itemTypeId)._buildTime[this._desiredLevel-1];
                this.setDueTime(this._startedTime + buildTime);
            }
            else {
                this.setDueTime(0);
            }
        },


        finish: function () {


            console.log("item: "+this._item._id+" upgrade completed");

            this._item._mapObj._blocks.UpgradeProduction.removeItemFromQueue(0);
            this._item.setLevel(this._desiredLevel);
            this._item._blocks.Feature.setExecutionIdx(0);
            this._item._blocks.Feature.checkStackExecution(false);

            this._item._mapObj._blocks.UpgradeProduction.checkQueue(this._dueTime);

            //this._item._mapObj.setState(mapObjectStates.FINISHED);
            // HACK
            this._item._mapObj.setState(2);
            this._item._mapObj.notifyChange();



            this._super();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._item._id,
                    this._desiredLevel
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                var itemId = o.a2[0];
                this._desiredLevel= o.a2[1];
                this._item = this._gameData.layers.get(this._mapId).mapData.items.get(itemId);

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

        }
    });

    exports.LevelUpgradeEvent = LevelUpgradeEvent;

})(node ? exports : window);
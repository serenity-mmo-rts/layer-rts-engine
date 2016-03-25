var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var Item =require('../Item').Item;
    var itemStates =require('../Item').itemStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildUpgradeEvent = AbstractEvent.extend({

        _type: "BuildUpgradeEvent",

        //serialized:
        _itemTypeId: null,
        _itemId: null,
        _parentObjectId: null,

        //not serialized
        _parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {
            return true;
        },

        setParameters: function (itemTypeId,parentObject) {
            this._itemTypeId = itemTypeId;
            this._parentObjectId = parentObject._id;
            this._parentObject = parentObject;
        },

        setPointers: function() {
            this._super( );
            this._parentObject = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._parentObjectId);
        },

        executeOnClient: function () {
            this._itemId = 'tmpId'+Math.random();
            this.start(Date.now() + ntp.offset());
            this.execute();
        },

        executeOnServer: function () {
            this._itemId = (new mongodb.ObjectID()).toHexString();
            this.start(Date.now());
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            this._parentObject._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._parentObject._blocks.UpgradeProduction.checkQueue(this._startedTime);
        },

        updateFromServer: function (event) {
            console.log("replace tmp Item ID: "+this._itemId+" by new id from server: "+event._itemId);
           // this._gameData.layers.get(this._mapId).mapData.items.updateId(this._itemId,event._itemId);
            this._itemId = event._itemId;
            this._super(event);
            this._parentObject._blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {
            return true;
        },



        save: function () {
            var o = this._super();
            o.a2 = [this._itemTypeId,
                this._itemId,
                this._parentObjectId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemTypeId = o.a2[0];
                this._itemId = o.a2[1];
                this._parentObjectId = o.a2[2];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    });

    exports.BuildUpgradeEvent = BuildUpgradeEvent;

})(node ? exports : window);

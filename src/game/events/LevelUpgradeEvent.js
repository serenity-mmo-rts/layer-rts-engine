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

    var LevelUpgradeEvent = AbstractEvent.extend({

        // serialized
        _type: "LevelUpgradeEvent",
        _itemId:null,
        _itemTypeId:null,
        _parentObjectId:null,

        // helper
        _item: null,
        _parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item) {
            this._item = item;
            this._parentObject = this._item._mapObj;
            this._parentObjectId = this._parentObject._id;
            this._itemId = this._item._id;
            this._itemTypeId = this._item._itemTypeId;
},

        setPointers: function(){
            this._super();
            this._item = this._gameData.layers.get(this._mapId).mapData.items.get(this._itemId);
            this._parentObject = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._parentObjectId);
        },

        executeOnClient: function () {
            this.start(Date.now() + ntp.offset());
            this.execute();
        },

        executeOnServer: function () {
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
            this._super(event);
            this._parentObject._blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._itemId,
                    this._parentObjectId,
                    this._itemTypeId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemId = o.a2[0];
                this._parentObjectId = o.a2[1];
                this._itemTypeId = o.a2[2];
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

    exports.LevelUpgradeEvent = LevelUpgradeEvent;

})(node ? exports : window);

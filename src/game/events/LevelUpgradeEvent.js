var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var Item =require('../Item').Item;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var LevelUpgradeEvent = AbstractEvent.extend({

        // serialized
        type: "LevelUpgradeEvent",
        itemId:null,
        itemTypeId:null,
        parentObjectId:null,

        // helper
        item: null,
        parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item) {
            this.item = item;
            this.parentObject = this.item.mapObj;
            this.parentObjectId = this.parentObject._id();
            this.itemId = this.item._id();
            this.itemTypeId = this.item.itemTypeId();
},

        setPointers: function(){
            this._super();
            this.item = this.gameData.layers.get(this.mapId).mapData.items.get(this.itemId);
            this.parentObject = this.gameData.layers.get(this.mapId).mapData.mapObjects.get(this.parentObjectId);
        },

        executeOnClient: function () {
            this.execute();
        },

        executeOnServer: function () {
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            this.setPointers();
            this.parentObject.blocks.UpgradeProduction.addEventToQueue(this);
        },

        updateFromServer: function (event) {
            this._super(event);
            this.parentObject.blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.itemId,
                    this.parentObjectId,
                    this.itemTypeId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.itemId = o.a2[0];
                this.parentObjectId = o.a2[1];
                this.itemTypeId = o.a2[2];
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

var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var Item =require('../Item').Item;
    var State = require('../AbstractBlock').State;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildUpgradeEvent = AbstractEvent.extend({

        type: "BuildUpgradeEvent",

        //serialized:
        itemTypeId: null,
        itemId: null,
        parentObjectId: null,

        //not serialized
        parentObject: null,

        init: function(parent, initObj){
            this._super( parent, initObj );
        },

        isValid: function () {
            return true;
        },

        setParameters: function (itemTypeId,parentObject) {
            this.itemTypeId = itemTypeId;
            this.parentObjectId = parentObject._id();
            this.parentObject = parentObject;
        },

        setPointers: function() {
            this._super();
            this.parentObject = this.map.mapData.mapObjects.get(this.parentObjectId);
        },

        executeOnClient: function () {
            this.itemId = 'tmpId'+Math.random();
            this.execute();
        },

        executeOnServer: function () {
            this.itemId = (new mongodb.ObjectID()).toHexString();
            this.execute();
        },

        executeOnOthers: function() {
            this.setPointers();
            this.execute();
        },

        execute: function () {
            this.item = new Item(this.map.mapData.items, {_id: this.itemId, objectId: this.parentObjectId, itemTypeId: this.itemTypeId, mapId: this.mapId});
            this.item.setPointers();

            this.isValid();
            this.item.embedded(true);
            this.gameData.layers.get(this.mapId).mapData.addItem(this.item);

            this.parentObject.blocks.UpgradeProduction.addEventToQueue(this);
        },

        updateFromServer: function (event) {
            this._super(event);
            console.log("replace tmp Item ID: "+this.itemId+" by new _id from server: "+event.itemId);
            this.itemId = event.itemId;

            this.gameData.layers.get(this.mapId).mapData.items.updateId(this.itemId,event.itemId);
            this.parentObject.blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {
            return true;
        },



        save: function () {
            var o = this._super();
            o.a2 = [this.itemTypeId,
                this.itemId,
                this.parentObjectId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.itemTypeId = o.a2[0];
                this.itemId = o.a2[1];
                this.parentObjectId = o.a2[2];
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

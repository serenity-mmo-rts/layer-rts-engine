var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var MapObject = require('../MapObject').MapObject;
    var itemStates =require('../Item').itemStates;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var MoveThroughLayerEvent = AbstractEvent.extend({

        // states
        _type: "MoveThroughLayerEvent",
        mapObjId: null,

        // helpers
        itemId: null,
        item: null,
        mapObj: null,
        targetMapId: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (mapObj) {
            this.mapObjId = mapObj._id();
            this.setPointers();
        },


        setPointers: function(){
            this._super();
            this.mapObj = this.map.mapData.mapObjects.get(this.mapObjId);
            this.itemId = this.mapObj.subItemId();
            this.item = this.map.mapData.items.get(this.itemId);
            this.targetMapId = this.map.parentMapId;
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

            this.mapObj.targetMapId(this.targetMapId);
            this.item.targetMapId(this.targetMapId);

            this.mapObj._blocks.UpgradeProduction.addEventToQueue(this);
            this.mapObj._blocks.UpgradeProduction.checkQueue(this._startedTime);
        },

        notifyServer: function() {
            var msgData = {
                targetMapId: this.targetMapId,
                event: "loadFromDb",
                objectIds: [this.mapObj._id()],
                itemIds: [this.item._id()]
            };
            return msgData;
        },

        updateFromServer: function (event) {
            this._super(event);
            this.mapObj._blocks.UpgradeProduction.updateDueTime(event._startedTime);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjId
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjId = o.a2[0];

                if (arguments.length>1 && flag==true){
                    this.setPointers();
                }

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

    exports.MoveThroughLayerEvent = MoveThroughLayerEvent;

})(node ? exports : window);

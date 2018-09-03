var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var MoveItemEvent = AbstractEvent.extend({

        // states
        type: "MoveItemEvent",
        originId: null,
        targetId: null,
        itemId: null,

        // helpers
        origin: null,
        target:null,
        item:null,
        range: null,

        init: function(parent, initObj){
            this._super( parent, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item) {
            this.item = item;
            this.itemId = this.item._id();
            this.originId = this.item.objectId();
        },


        setTarget: function (targetId) {
            this.targetId = targetId;
        },

        setPointers: function(){
            this._super();
            this.origin =  this.gameData.layers.get(this.mapId).mapData.mapObjects.get(this.originId);
            this.target  = this.gameData.layers.get(this.mapId).mapData.mapObjects.get(this.targetId);
            this.item = this.gameData.layers.get(this.mapId).mapData.items.get(this.itemId);
            if (!this.item){
                throw new Error("Item not in database, but should be there");
            }
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
            this.item.blocks.Movable.moveItemWithinLayer(this.startedTime,this.origin,this.target);
            this.setFinished();
        },

        updateFromServer: function (event) {
            this._super(event);
            this.item.blocks.Movable.updateDueTime(event);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.itemId,
                this.targetId,
                this.originId
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.itemId = o.a2[0];
                this.targetId = o.a2[1];
                this.originId = o.a2[2];

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

    exports.MoveItemEvent = MoveItemEvent;

})(node ? exports : window);

var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var itemStates =require('../Item').itemStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var MoveItemEvent = AbstractEvent.extend({

        // states
        _type: "MoveItemEvent",
        _originId: null,
        _targetId: null,
        _itemId: null,

        // helpers
        _origin: null,
        _target:null,
        _item:null,
        _range: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item) {
            this._item = item;
            this._itemId = this._item._id();
            this._originId = this._item._objectId();
        },


        setTarget: function (targetId) {
            this._targetId = targetId;
        },

        setPointers: function(){
            this._super();
            this._origin =  this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._originId);
            this._target  = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._targetId);
            this._item = this._gameData.layers.get(this._mapId).mapData.items.get(this._itemId);
            if (!this._item){
                throw new Error("Item not in database, but should be there");
            }
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
            this.setPointers();
            this._item._blocks.Movable.moveItem(this._startedTime,this._origin,this._target);
            this.setFinished();
        },

        updateFromServer: function (event) {
            this._super(event);
            this._item._blocks.Movable.updateDueTime(event);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._itemId,
                this._targetId,
                this._originId
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemId = o.a2[0];
                this._targetId = o.a2[1];
                this._originId = o.a2[2];

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

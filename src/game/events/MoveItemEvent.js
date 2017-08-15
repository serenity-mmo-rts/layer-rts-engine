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
        _originMapObj: null,
        _targetMapObj:null,
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
            this._itemId = this._item._id;
            this._origin = this._item._mapObj;
        },


        setTarget: function (targetId) {
            this._targetId = targetId;
            this._target  = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(targetId);
        },

        setPointers: function(){
            this._super();
            this._item = this._gameData.layers.get(this._mapId).mapData.items.get(this._itemId);
            this._origin = this._item._mapObj;
            this.setTarget(this._targetId);
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
                this._targetId
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemId = o.a2[0];
                this._targetId = o.a2[1];

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

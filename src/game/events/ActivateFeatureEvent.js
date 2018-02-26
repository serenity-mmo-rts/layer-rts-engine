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

    var ActivateFeatureEvent = AbstractEvent.extend({

        // states
        _type: "ActivateFeatureEvent",
        _targetId: null,
        _itemId: null,
        _targetType: null,

        // helpers
        _target:null,
        _item:null,
        _range: null,


        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item,operation) {
            this._itemId = item._id();
            this._item = item;
            this._range = operation.activatePerClick.range;
            this._targetType = operation.activatePerClick.targetType;
        },


        setTarget: function (targetId) {
            this._targetId = targetId;
            if (this._targetType =="self"){
                this._target = null;
            }
            else if (this._targetType =="object"){
                this._target  = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(targetId);
            }
            else if (this._targetType =="item"){
                this._target = this._gameData.layers.get(this._mapId).mapData.items.get(targetId);
            }
            else if (this._targetType =="coordinate"){
            }
        },

        setPointers: function(){
            this._super();
            this._item = this._gameData.layers.get(this._mapId).mapData.items.get(this._itemId);
            if (!this._item){
                throw new Error("Item not in database, but should be there");
            }
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
            this._item._blocks.Feature.activate(this._startedTime,this._target);
            this.setFinished();
        },

        updateFromServer: function (event) {
            this._super(event);
            this._item._blocks.Feature.activate(event._startedTime,this._target);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._itemId,
                    this._targetId,
                    this._targetType
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._itemId = o.a2[0];
                this._targetId = o.a2[1];
                this._targetType = o.a2[2];

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

    exports.ActivateFeatureEvent = ActivateFeatureEvent;

})(node ? exports : window);

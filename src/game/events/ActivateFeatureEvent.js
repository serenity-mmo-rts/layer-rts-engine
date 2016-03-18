var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var itemStates =require('../Item').itemStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var ActivateFeatureEvent = AbstractEvent.extend({

        // states
        _type: "ActivateFeatureEvent",
        _target: null,
        _item: null,
        _targetType: null,

        // helpers
        _range: null,
        _mapObj: null,
        _mapId: null,



        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setItem: function (item) {
            this._item = item;
            this._mapId = this._item._mapId;
            this._mapObj = this._item._mapObj;
        },

        setActivationParameters: function (operation) {
            this._range = operation.activatePerClick.range;
            this._targetType = operation.activatePerClick.targetType;
        },

        setTarget: function (targetId) {

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

        execute: function () {
            this.start(Date.now() + ntp.offset());
            this._item._blocks.Feature.activate(this._startedTime,this._target);
            this._super();
        },

        executeOnServer: function () {
            this.start(Date.now());
            this._item._blocks.Feature.activate(this._startedTime,this._target);
            this._super();
        },


        executeOnOthers: function() {
            this._item._blocks.Feature.activate(this._startedTime,this._target);
            this._super();
        },

        updateFromServer: function (event) {
            this._super(event);
        },

        start: function(startTime){
            this._super(startTime);
            //this._mapObj.setState(mapObjectStates.WORKING);
            this.saveToDb();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._item._id,
                    this._target._id,
                    this._targetType
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                var itemId = o.a2[0];
                this._item = this._gameData.layers.get(this._mapId).mapData.items.get(itemId);
                var targetId = o.a2[1];
                this._targetType = o.a2[2];
                this.setTarget(targetId);

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

    exports.ActivateFeatureEvent = ActivateFeatureEvent;

})(node ? exports : window);

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

        _type: "ActivateFeatureEvent",


        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setItem: function (item) {
            this._item = item;
            this._mapId = this._item._mapId;
        },


        execute: function () {
            this.start(Date.now() + ntp.offset());
            this._item._blocks.Feature.activate(this._startedTime);
            this._super();
        },

        executeOnServer: function () {
            this.start(Date.now());
            this._item._blocks.Feature.activate(this._startedTime);
            this._super();
        },


        executeOnOthers: function() {
            this._item._blocks.Feature.activate(this._startedTime);
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
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                var itemId = o.a2[0];
                this._item = this._gameData.layers.get(this._mapId).mapData.items.get(itemId);

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

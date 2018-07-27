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
        type: "ActivateFeatureEvent",
        targetId: null,
        itemId: null,
        targetType: null,

        // helpers
        target:null,
        item:null,
        range: null,


        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item,operation) {
            this.itemId = item._id();
            this.item = item;
            this.range = operation.activatePerClick.range;
            this.targetType = operation.activatePerClick.targetType;
        },


        setTarget: function (targetId) {
            this.targetId = targetId;
            if (this.targetType =="self"){
                this.target = null;
            }
            else if (this.targetType =="object"){
                this.target  = this.gameData.layers.get(this.mapId).mapData.mapObjects.get(targetId);
            }
            else if (this.targetType =="item"){
                this.target = this.gameData.layers.get(this.mapId).mapData.items.get(targetId);
            }
            else if (this.targetType =="coordinate"){
            }
        },

        setPointers: function(){
            this._super();
            this.item = this.gameData.layers.get(this.mapId).mapData.items.get(this.itemId);
            if (!this.item){
                throw new Error("Item not in database, but should be there");
            }
            this.setTarget(this.targetId);
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
            this.item.blocks.Feature.activate(this.startedTime,this.target);
            this.setFinished();
        },

        updateFromServer: function (event) {
            this._super(event);
            this.item.blocks.Feature.activate(event.startedTime,this.target);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.itemId,
                    this.targetId,
                    this.targetType
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.itemId = o.a2[0];
                this.targetId = o.a2[1];
                this.targetType = o.a2[2];

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

var node = !(typeof exports === 'undefined');
if (node) {
    var MapObject = require('../MapObject').MapObject;
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var State = require('../AbstractBlock').State;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var DisplaceObjectEvent = AbstractEvent.extend({

        // states
        type: "DisplaceObjectEvent",
        mapObjId: null,

        // helpers
        mapObj: null,

        init: function(parent, initObj){
            this._super( parent, initObj );
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
            this.mapObj.blocks.UpgradeProduction.addEventToQueue(this);
        },


        save: function () {
            var o = this._super();
            o.a2 = [
                this.mapObjId
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjId = o.a2[0];

                if (arguments.length>0 && flag==true){
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

    exports.DisplaceObjectEvent = DisplaceObjectEvent;

})(node ? exports : window);

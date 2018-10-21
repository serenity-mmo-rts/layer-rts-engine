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

    var LoadEntitiesEvent = AbstractEvent.extend({

        // states
        type: "LoadEntitiesEvent",
        items: [],
        mapObjects: [],
        events: [],

        // helpers

        init: function(parent, initObj){
            this._super( parent, initObj );
        },


        isValid: function () {
            return true;
        },

        setPointers: function(){
            this._super();
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
            for (var i = 0, len=this.mapObjects.length; i<len; i++){
                this.map.mapData.addObject(this.mapObjects[i]);
                this.mapObjects[i].embedded(true);
            }
            for (var i = 0, len=this.items.length; i<len; i++){
                this.map.mapData.addItem(this.items[i]);
                this.items[i].embedded(true);
            }
            for (var i = 0, len=this.events.length; i<len; i++){
                this.map.eventScheduler.addEvent(this.events[i]);
            }

            for (var i = 0, len=this.mapObjects.length; i<len; i++){
                this.mapObjects[i].setPointers();
            }
            for (var i = 0, len=this.items.length; i<len; i++){
                this.items[i].setPointers();
            }
            for (var i = 0, len=this.events.length; i<len; i++){
                this.events[i].setPointers();
            }

        },

        revert: function() {

        },

        save: function () {
            var o = this._super();

            var mapObjects = [];
            for (var i = 0, len=this.mapObjects.length; i<len; i++){
                mapObjects.push(this.mapObjects[i].save());
            }

            var items = [];
            for (var i = 0, len=this.items.length; i<len; i++){
                items.push(this.items[i].save());
            }

            var events = [];
            for (var i = 0, len=this.events.length; i<len; i++){
                events.push(this.events[i].save());
            }

            o.a2 = [
                mapObjects,
                items,
                events
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            this.mapObjects = [];
            this.items = [];
            this.events = [];
            if (o.hasOwnProperty("a2")) {

                var mapObjects = o.a2[0];
                for (var i = 0, len=mapObjects.length; i<len; i++){
                    this.mapObjects.push(new MapObject(this.map.mapData.mapObjects, mapObjects[i]));
                }

                var items = o.a2[1];
                for (var i = 0, len=items.length; i<len; i++){
                    this.items.push(new Item(this.map.mapData.items, items[i]));
                }

                var events = o.a2[2];
                for (var i = 0, len=events.length; i<len; i++){
                    this.events.push(this.map.createEvent(this.map.eventScheduler.events, events[i]));
                }

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

    exports.LoadEntitiesEvent = LoadEntitiesEvent;

})(node ? exports : window);

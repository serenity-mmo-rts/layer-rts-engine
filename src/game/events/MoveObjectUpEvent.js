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

    var MoveObjectUpEvent = AbstractEvent.extend({

        // states
        type: "MoveObjectUpEvent",
        mapObjId: null,

        // helpers
        itemId: null,
        item: null,
        mapObj: null,
        targetMapId: null,

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
            if (this.mapObj) {
                // only load if we have the data, because it could be that the object has already moved out of the layer and the event is still there.
                this.itemId = this.mapObj.subItemId();
                this.item = this.map.mapData.items.get(this.itemId);
                this.targetMapId = this.map.parentMapId();
                this.targetMapObjectId = this.map.parentObjId();
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
            this.mapObj.inactiveMapId(this.targetMapId);
            this.item.objectId(this.targetMapObjectId);
            this.item.mapId(this.targetMapId);
            this.item.inactiveMapId(this.map._id());
            this.item.setState(State.BLOCKED);
            //this.mapObj.setState(State.HIDDEN);
            this.mapObj.blocks.UpgradeProduction.addEventToQueue(this);
        },

        getSubItemsAndObject: function(itemInput, objectInput) {
            var itemList = [];
            var objList= [];
            itemList.push(itemInput._id());
            objList.push(objectInput._id());

            var itemsInObj = objectInput.getItems();
            for (var itemid in itemsInObj) {
                var item = itemsInObj[itemid];
                itemList.push(item._id());
                if (item.subObjectId()) {
                    objList.push(item.subObjectId());
                    var mapObj = this.map.mapData.mapObjects.get(item.subObjectId());
                    var subList = this.getSubItemsAndObject(item, mapObj);

                    itemList.splice(0,0,subList.itemList);
                    objList.splice(0,0,subList.objList);

                }
            }

            return {itemList: itemList, objList: objList};


        },

        notifyServer: function() {

            // put both object and item in array that will be transferred to other server
            var movingEntities =  this.getSubItemsAndObject(this.item,this.mapObj);
            var msgData = {
                targetMapId: this.targetMapId,
                event: "loadFromDb",
                objectIds: movingEntities["objList"],
                itemIds: movingEntities["itemList"],
                eventIds: [this._id]
            };

            /*
            var msgData = {
                targetMapId: this.targetMapId,
                event: "executeEvent",
                eventId: this._id
            };
            */

            return msgData;
        },


        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [
                this.mapObj.save(),
                this.item.save()
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObj = new MapObject(this.map.mapData.mapObjects, o.a2[0]);
                this.mapObjId = this.mapObj._id();
                this.item = new Item(this.map.mapData.items, o.a2[1]);
                this.itemId = this.item._id();

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

    exports.MoveObjectUpEvent = MoveObjectUpEvent;

})(node ? exports : window);

var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var MapObject = require('../MapObject').MapObject;
    var State = require('../AbstractBlock').State;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var MoveItemDownEvent = AbstractEvent.extend({

        // states
        type: "MoveThroughLayerEvent",
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
            // for rendering
            this.mapObj.setState(State.CONSTRUCTION);
        },

        execute: function () {
            this.mapObj.inactiveMapId(this.targetMapId);
            this.item.objectId(this.targetMapObjectId);
            this.item.mapId(this.targetMapId);
            this.item.inactiveMapId(this.map._id());
            this.item.setState(State.BLOCKED);
            this.mapObj.setState(State.HIDDEN);
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
            // for rendering
            this.mapObj.setState(State.CONSTRUCTION);

            var msgData = {
                targetMapId: this.targetMapId,
                event: "loadFromDb",
                objectIds: movingEntities["objList"],
                itemIds: movingEntities["itemList"]
            };
            return msgData;
        },


        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjId
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjId = o.a2[0];

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

    exports.MoveItemDownEvent = MoveItemDownEvent;

})(node ? exports : window);

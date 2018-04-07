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

    var MoveThroughLayerEvent = AbstractEvent.extend({

        // states
        type: "MoveThroughLayerEvent",
        mapObjId: null,

        // helpers
        itemId: null,
        item: null,
        mapObj: null,
        targetMapId: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (mapObj) {
            this.mapObjId = mapObj.id();
            this.setPointers();
        },


        setPointers: function(){
            this._super();
            this.mapObj = this.map.mapData.mapObjects.get(this.mapObjId);
            this.itemId = this.mapObj.subItemId();
            this.item = this.map.mapData.items.get(this.itemId);
            this.targetMapId = this.map.parentMapId;
            this.targetMapObjectId = this.map.parentObjId;
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
            // for rendering
            this.mapObj.setState(State.CONSTRUCTION);
        },

        execute: function () {

            this.mapObj.targetMapId(this.targetMapId);
            this.mapObj.setState(State.HIDDEN);
            this.item.objectId(this.targetMapObjectId);
            this.item.targetMapId(this.targetMapId);
            this.item.setState(State.BLOCKED);
            this.mapObj.blocks.UpgradeProduction.addEventToQueue(this);
        },

        getSubItemsAndObject: function(itemInput, objectInput) {
            var itemList = [];
            var objList= [];
            itemList.push(itemInput.id());
            objList.push(objectInput.id());

            var itemsInObj = objectInput.getItems();
            for (var itemid in itemsInObj) {
                var item = itemsInObj[itemid];
                itemList.push(item.id());
                if (item.subObjectId()) {
                    objList.push(item.subObjectId());
                    var mapObj = this.map.mapData.mapObjects.get(item.subObjectId());
                    var subList = this.getSubItems(item, mapObj);

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

        updateFromServer: function (event) {
            this._super(event);
            this.mapObj.blocks.UpgradeProduction.updateDueTime(event.startedTime);
        },

        revert: function() {

        },

        save: function () {
            var o = this.super();
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

    exports.MoveThroughLayerEvent = MoveThroughLayerEvent;

})(node ? exports : window);

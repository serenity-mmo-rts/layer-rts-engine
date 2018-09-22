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
        type: "MoveItemDownEvent",
        itemId: null,
        targetMapId: null,


        // helpers
        item: null,
        mapObjId: null,
        mapObj: null,


        init: function(parent, initObj){
            this._super( parent, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (item) {
            this.itemId = item._id();
            this.setPointers();
            this.targetMapId = this.map.mapData.mapObjects.get(this.item.objectId()).sublayerId();
        },


        setPointers: function(){
            this._super();
            this.item = this.map.mapData.items.get(this.itemId);
            if (this.item) {
                // only load if we have the data, because it could be that the object has already moved out of the layer and the event is still there.
                this.mapObjId = this.item.subObjectId();
                this.mapObj = this.map.mapData.mapObjects.get(this.mapObjId);
            }
            else{
                throw new Error ("Item not in database");
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
            this.item.mapId(this.map._id());
            this.mapObj.inactiveMapId(this.map._id());
            this.item.inactiveMapId(this.targetMapId);
            this.mapObj.mapId(this.targetMapId);
            this.item.setState(State.HIDDEN);
            this.mapObj.setState(State.HIDDEN);
            this.mapObj.needsTobePlaced(true);
            this.map.mapData.removeObject(this.mapObj);
            this.map.mapData.removeItem(this.item);
            // TODO this doesnt workitem is not found on execution on new game event in client
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
            o.a2 = [this.itemId,
                    this.targetMapId
            ];
            return o;
        },

        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.itemId = o.a2[0];
                this.targetMapId = o.a2[1];

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

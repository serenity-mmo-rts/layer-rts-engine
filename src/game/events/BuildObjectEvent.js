var node = !(typeof exports === 'undefined');
if (node) {
    //var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var State = require('../AbstractBlock').State;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildObjectEvent = AbstractEvent.extend({

        // serialized
        type: "BuildObjectEvent",
        mapObjId: null,
        x: null,
        y: null,
        mapObjTypeId: null,
        connectedFrom: null,
        connectedTo: null,
        itemId: null,
        sublayerId: null,

        //not serialized
        mapObj: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {

            var mapData = this.gameData.layers.get(this.mapId).mapData;

            //check if mapObject is defined
            if (this.mapObj == undefined) {
                return false;
            }

            //check if correct layer
            if (this.mapId != this.mapObj.mapId()){
                return false;
            }

            if (this.mapObj.blocks.hasOwnProperty("Connection")) {

                var sourceHub = mapData.mapObjects.get(this.mapObj.blocks.Connection.connectedFrom());
                var targetObj = mapData.mapObjects.get(this.mapObj.blocks.Connection.connectedTo());
                this.mapObj.blocks.Connection.setConnectionPoints();

                //check if both are on the same layer:
                if (sourceHub == undefined || targetObj == undefined){
                    return false;
                }

                //check if it is really a hub node
                if (!sourceHub.blocks.hasOwnProperty("HubNode")){
                    return false;
                }

                //check if target object has hubConnectivity
                if (!targetObj.blocks.hasOwnProperty("HubConnectivity")){
                    return false;
                }

                //check if both are within the range given by the hub:
                var dx = (targetObj.x() - sourceHub.x());
                var dy = (targetObj.y() - sourceHub.y());
                var connLength = Math.sqrt(dx*dx + dy*dy);
                if (sourceHub.blocks.HubNode.getMaxRange() < connLength) {
                    return false;
                }

                //set center coordinate of connection and orientation of connection correctly:
                this.x = sourceHub.x() + dx/2;
                this.y = sourceHub.y() + dy/2;
                this.mapObj.x(this.x);
                this.mapObj.y(this.y);
                this.mapObj.ori(-Math.atan2(dy, dx));
                this.mapObj.width(connLength);
                this.mapObj.height(this.mapObj.objType.initHeight);
                this.mapObj.notifyChange();

                //check if there is a port free in the hub node
                if (!sourceHub.blocks.HubConnectivity.getFreePorts() > 0){
                    return false;
                }

                //check if there is a port free in the mapObj
                if (!targetObj.blocks.HubConnectivity.getFreePorts() > 0){
                    return false;
                }

                //don't allow self connection
                if (sourceHub.id() == targetObj.id()){
                    return false;
                }

            }

            var collidingItems = this.gameData.layers.get(this.mapId).mapData.collisionDetection(this.mapObj);

            if (this.mapObj.blocks.hasOwnProperty("Connection")) {
                    // check if there is any object colliding that is not the source or target object
                    var arrayLength = collidingItems.length;
                    for (var i = 0; i < arrayLength; i++) {
                        if (collidingItems[i].id() != targetObj.id() &&
                            collidingItems[i].id() != sourceHub.id()) {

                            if(collidingItems[i].blocks.hasOwnProperty("Connection")) {
                                // only fail if the colliding item is not any other connection to either the source or target object:
                                if (collidingItems[i].blocks.Connection.connectedFrom() != targetObj.id() &&
                                    collidingItems[i].blocks.Connection.connectedFrom() != sourceHub.id() &&
                                    collidingItems[i].blocks.Connection.connectedTo() != targetObj.id() &&
                                    collidingItems[i].blocks.Connection.connectedTo() != sourceHub.id()) {
                                    return false;
                                }
                            }
                            else{
                                return false;
                            }

                        }
                    }
                    // seems ok, because no collision with any object besides source and target
                    return true;
            }

            if (collidingItems.length > 0) {
                return false;
            }
            else {
                return true;
            }
        },

        setCoordinates: function (coordinate) {
            this.x = coordinate.x;
            this.y = coordinate.y;
        },

        setTargetConnection: function (connectionTo) {
            this.connectedTo = connectionTo;
        },

        setParameters: function (mapObj,connectionFrom) {
            this.mapObjTypeId = mapObj.objTypeId();
            this.mapObj = mapObj;
            if (arguments.length==2){
                this.connectedFrom = connectionFrom;
            }
        },

        setPointers: function () {
            this._super();
            this.mapObj = new MapObject(this.gameData, {id: this.mapObjId, mapId: this.mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this.userId, state: State.TEMP});
            if (this.mapObj.blocks.hasOwnProperty("Connection")){
                this.mapObj.blocks.Connection.connectedFrom(this.connectedFrom);
                this.mapObj.blocks.Connection.connectedTo(this.connectedTo);
            }
        },

        executeOnClient: function () {
            this.mapObjId  = 'tmpObjId'+Math.random();
            if (this.mapObj.blocks.hasOwnProperty("Unit")) {
                this.itemId = 'tmpItemId' + Math.random();
            }
            if (this.mapObj.blocks.hasOwnProperty("Sublayer")) {
                this.sublayerId = 'tmpSublayerId' + Math.random();
            }
            this.execute();
        },

        executeOnServer: function () {
            this.mapObjId = (new mongodb.ObjectID()).toHexString();
            if (this.mapObj.blocks.hasOwnProperty("Unit")) {
                this.itemId = (new mongodb.ObjectID()).toHexString();
            }
            if (this.mapObj.blocks.hasOwnProperty("Sublayer")) {
                this.sublayerId = (new mongodb.ObjectID()).toHexString();
            }
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {

            this.mapObj = null;
            this.mapObj = new MapObject(this.gameData, {id: this.mapObjId, mapId: this.mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this.userId, state: State.TEMP, sublayerId: this.sublayerId});
            this.mapObj.setPointers();

            if (this.mapObj.blocks.hasOwnProperty("Sublayer")){ // in case map object is Sublayer Object add layer below
                if (node) {
                    this.gameData.layers.get(this.mapId).createSublayer(this.x, this.y, this.sublayerId, this.mapObjId);
                }
            }

            if (this.mapObj.blocks.hasOwnProperty("Connection")){  // in case map object is a connection add start and end points
                this.mapObj.blocks.Connection.connectedFrom(this.connectedFrom);
                this.mapObj.blocks.Connection.connectedTo(this.connectedTo);
            }

            this.isValid();
            this.mapObj.embedded(true);
            this.gameData.layers.get(this.mapId).mapData.addObject(this.mapObj);

            if (this.mapObj.blocks.hasOwnProperty("Unit")){ // in case map object is a Unit add corresponding item
                var itemTypeId = this.mapObj.blocks.Unit.itemTypeId;
                this.item = new Item(this.gameData, {id: this.itemId, objectId: null, itemTypeId: itemTypeId, mapId: this.mapId, state: State.HIDDEN});
                this.item.subObjectId(this.mapObjId);
                this.item.setPointers();
                this.item.embedded(true);
                this.gameData.layers.get(this.mapId).mapData.addItem(this.item);
                this.mapObj.subItemId(this.itemId);
            }

            this.mapObj.blocks.UpgradeProduction.addEventToQueue(this);

        },

        revert: function() {
            this.gameData.layers.get(this.mapId).mapData.removeObject(this.mapObj);
            return true;
        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjId,
                    this.x,
                    this.y,
                    this.mapObjTypeId,
                    this.connectedFrom,
                    this.connectedTo,
                    this.itemId,
                    this.sublayerId
                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjId= o.a2[0];
                this.x= o.a2[1];
                this.y= o.a2[2];
                this.mapObjTypeId= o.a2[3];
                this.connectedFrom = o.a2[4];
                this.connectedTo = o.a2[5];
                this.itemId = o.a2[6];
                this.sublayerId = o.a2[7];
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

    exports.BuildObjectEvent = BuildObjectEvent;

})(node ? exports : window);

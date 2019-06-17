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
        hubSystemId: null,

        //not serialized
        mapObj: null,

        init: function(parent, initObj){
            this._super( parent, initObj );
        },

        isValid: function () {

            var mapData = this.map.mapData;

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
                //this.mapObj.blocks.Connection.setConnectionPoints();

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
                if (sourceHub._id() == targetObj._id()){
                    return false;
                }

            }

            var collidingItems = this.map.mapData.collisionDetection(this.mapObj);

            if (this.mapObj.blocks.hasOwnProperty("Connection")) {
                    // check if there is any object colliding that is not the source or target object
                    var arrayLength = collidingItems.length;
                    for (var i = 0; i < arrayLength; i++) {
                        if (collidingItems[i]._id() != targetObj._id() &&
                            collidingItems[i]._id() != sourceHub._id()) {

                            if(collidingItems[i].blocks.hasOwnProperty("Connection")) {
                                // only fail if the colliding item is not any other connection to either the source or target object:
                                if (collidingItems[i].blocks.Connection.connectedFrom() != targetObj._id() &&
                                    collidingItems[i].blocks.Connection.connectedFrom() != sourceHub._id() &&
                                    collidingItems[i].blocks.Connection.connectedTo() != targetObj._id() &&
                                    collidingItems[i].blocks.Connection.connectedTo() != sourceHub._id()) {
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
            this.mapObj = new MapObject(this.map.mapData.mapObjects, {_id: this.mapObjId, mapId: this.mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this.userId, state: State.TEMP});
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
            if (this.mapObj.blocks.hasOwnProperty("HubNode")){
                this.hubSystemId = 'tmpHubId' + Math.random();
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
            if (this.mapObj.blocks.hasOwnProperty("HubNode")){
                this.hubSystemId = (new mongodb.ObjectID()).toHexString();
            }
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {

            this.mapObj = null;
            this.mapObj = new MapObject(this.map.mapData.mapObjects, {_id: this.mapObjId, mapId: this.mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this.userId, state: State.TEMP, sublayerId: this.sublayerId});
            this.mapObj.setPointers();

            if (this.mapObj.blocks.hasOwnProperty("Connection")){  // in case map object is a connection add start and end points
                this.mapObj.blocks.Connection.connectedFrom(this.connectedFrom);
                this.mapObj.blocks.Connection.connectedTo(this.connectedTo);
            }

            this.isValid();

            if (this.mapObj.blocks.hasOwnProperty("Sublayer")){ // in case map object is Sublayer Object add layer below
                if (node) {
                    this.map.createSublayer(this.x, this.y, this.sublayerId, this.mapObjId);
                }
            }

            if (this.mapObj.blocks.hasOwnProperty("HubNode")){
                this.map.blocks.HubSystemManager.createNewHubSystem(this.hubSystemId);
                this.mapObj.blocks.HubConnectivity.changeHubSystemId(this.hubSystemId);
            }

            this.map.mapData.addObject(this.mapObj);
            this.mapObj.embedded(true);

            if (this.mapObj.blocks.hasOwnProperty("Connection")){  // in case map object is a connection add start and end points
                var hub = this.map.mapData.mapObjects.get(this.connectedFrom);
                var obj = this.map.mapData.mapObjects.get(this.connectedTo);
                hub.blocks.HubConnectivity.connectionIds.push(this.mapObjId);
                obj.blocks.HubConnectivity.connectionIds.push(this.mapObjId);
                // TODO: first check which hub system contains less mapObjects... then add smaller parts to larger...?
                obj.blocks.HubConnectivity.changeHubSystemId(hub.blocks.HubConnectivity.hubSystemId());
            }

            if (this.mapObj.blocks.hasOwnProperty("Unit")){ // in case map object is a Unit add corresponding item
                var itemTypeId = this.mapObj.blocks.Unit.itemTypeId;
                this.item = new Item(this.map.mapData.items, {_id: this.itemId, objectId: null, x: this.x, y: this.y, itemTypeId: itemTypeId, inactiveMapId: this.mapId, mapId: null, state: State.HIDDEN});
                this.item.subObjectId(this.mapObjId);
                this.item.setPointers();
                this.map.mapData.addItem(this.item);
                this.item.embedded(true);
                this.mapObj.subItemId(this.itemId);
            }

            this.mapObj.blocks.UpgradeProduction.addEventToQueue(this);

        },

        revert: function() {
            this.map.mapData.removeObject(this.mapObj);
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
                this.sublayerId,
                this.hubSystemId
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
                this.hubSystemId = o.a2[8];
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

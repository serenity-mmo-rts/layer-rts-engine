var node = !(typeof exports === 'undefined');
if (node) {
   // var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');

}

(function (exports) {

    var BuildObjectEvent = AbstractEvent.extend({

        // serialized
        _type: "BuildObjectEvent",
        mapObjId: null,
        x: null,
        y: null,
        mapObjTypeId: null,
        connectedFrom: null,
        connectedTo: null,

        //not serialized
        _mapObj: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {

            var mapData = this._gameData.layers.get(this._mapId).mapData;

            //check if mapObject is defined
            if (this._mapObj == undefined) {
                return false;
            }

            //check if correct layer
            if (this._mapId != this._mapObj.mapId){
                return false;
            }

            if (this._mapObj._blocks.hasOwnProperty("Connection")) {

                var sourceHub = mapData.mapObjects.get(this._mapObj._blocks.Connection.connectedFrom);
                var targetObj = mapData.mapObjects.get(this._mapObj._blocks.Connection.connectedTo);

                //check if both are on the same layer:
                if (sourceHub == undefined || targetObj == undefined){
                    return false;
                }

                //check if it is really a hub node
                if (!sourceHub._blocks.hasOwnProperty("HubNode")){
                    return false;
                }

                //check if target object has hubConnectivity
                if (!targetObj._blocks.hasOwnProperty("HubConnectivity")){
                    return false;
                }

                //check if both are within the range given by the hub:
                var dx = (targetObj.x - sourceHub.x);
                var dy = (targetObj.y - sourceHub.y);
                var connLength = Math.sqrt(dx*dx + dy*dy);
                if (sourceHub._blocks.HubNode.getMaxRange() < connLength) {
                    return false;
                }

                //set center coordinate of connection and orientation of connection correctly:
                this._mapObj.x = sourceHub.x + dx/2;
                this._mapObj.y = sourceHub.y + dy/2;
                this._mapObj.ori = -Math.atan2(dy, dx);
                this._mapObj.width = connLength;
                this._mapObj.height = this._mapObj.objType._initHeight;
                this._mapObj.notifyChange();

                //check if there is a port free in the hub node
                if (!sourceHub._blocks.HubConnectivity.getFreePorts() > 0){
                    return false;
                }

                //check if there is a port free in the mapObj
                if (!targetObj._blocks.HubConnectivity.getFreePorts() > 0){
                    return false;
                }

                //don't allow self connection
                if (sourceHub._id == targetObj._id){
                    return false;
                }

            }

            var collidingItems = this._gameData.layers.get(this._mapId).mapData.collisionDetection(this._mapObj);

            if (this._mapObj._blocks.hasOwnProperty("Connection")) {
                    // check if there is any object colliding that is not the source or target object
                    var arrayLength = collidingItems.length;
                    for (var i = 0; i < arrayLength; i++) {
                        if (collidingItems[i]._id != targetObj._id &&
                            collidingItems[i]._id != sourceHub._id) {

                            if(collidingItems[i]._blocks.hasOwnProperty("Connection")) {
                                // only fail if the colliding item is not any other connection to either the source or target object:
                                if (collidingItems[i]._blocks.Connection.connectedFrom != targetObj._id &&
                                    collidingItems[i]._blocks.Connection.connectedFrom != sourceHub._id &&
                                    collidingItems[i]._blocks.Connection.connectedTo != targetObj._id &&
                                    collidingItems[i]._blocks.Connection.connectedTo != sourceHub._id) {
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
            this.mapObjTypeId = mapObj.objTypeId;
            this._mapObj = mapObj;
            if (arguments.length==2){
                this.connectedFrom = connectionFrom;
            }
        },

        setPointers: function () {
            this._mapObj = new MapObject(this._gameData, {_id: this.mapObjId, mapId: this._mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this._userId, state: mapObjectStates.WORKING});
            if (this._mapObj._blocks.hasOwnProperty("Connection")){
                this._mapObj._blocks.Connection.connectedFrom = this.connectedFrom;
            }
        },

        executeOnClient: function () {
            this.start(Date.now() + ntp.offset());
            this.mapObjId  = 'tmpId'+Math.random();
            this.execute();
        },

        executeOnServer: function () {
            this.start(Date.now());
            this.mapObjId = (new mongodb.ObjectID()).toHexString();
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            this._mapObj = null;
            this._mapObj = new MapObject(this._gameData, {_id: this.mapObjId, mapId: this._mapId, x: this.x, y: this.y, objTypeId: this.mapObjTypeId, userId: this._userId, state: mapObjectStates.WORKING});

            if (this._mapObj._blocks.hasOwnProperty("Connection")){
                this._mapObj._blocks.Connection.connectedFrom = this.connectedFrom;
                this._mapObj._blocks.Connection.connectedTo = this.connectedTo;
            }

            this._gameData.layers.get(this._mapId).mapData.addObject(this._mapObj);
            this._mapObj.setPointers();
            this._mapObj._blocks.UpgradeProduction.addItemEventToQueue(this);
            this._mapObj._blocks.UpgradeProduction.checkQueue(this._startedTime);
        },


        updateFromServer: function (event) {
            console.log("replace tmp Object ID: "+this.mapObjId+" by new id from server: "+event.mapObjId);
            this._gameData.layers.get(this._mapId).mapData.mapObjects.updateId(this.mapObjId,event.mapObjId);
            this._mapObj._id = event.mapObjId;
            this.mapObjId = event.mapObjId;
            this._super(event);
            this._mapObj._blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {
            this._gameData.layers.get(this._mapId).mapData.removeObject(this._mapObj);
            return true;
        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjId,
                    this.x,
                    this.y,
                    this.mapObjTypeId,
                    this.connectedFrom,
                    this.connectedTo
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

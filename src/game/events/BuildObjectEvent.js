var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var BuildObjectEvent = AbstractEvent.extend({

        _type: "BuildObjectEvent",
        _mapObj : null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        setMapObject: function (mapObj) {
            this._mapObj = mapObj;
            this._mapId = this._mapObj.mapId;
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

                var sourceHub = mapData.mapObjects.get(this._mapObj._blocks.Connection._connectedFrom);
                var targetObj = mapData.mapObjects.get(this._mapObj._blocks.Connection._connectedTo);

                //check if both are on the same layer:
                if (sourceHub == undefined || targetObj == undefined){
                    return false;
                }

                //check if it is really a hub node
                if (!targetObj._blocks.hasOwnProperty("HubNode")){
                    return false;
                }

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

                //check if both are within the range given by the hub:
                var x = (sourceHub.x - targetObj.x);
                var y = (sourceHub.y - targetObj.y);
                if (sourceHub._blocks.HubNode.getMaxRange() < Math.sqrt(x*x + y*y)) {
                    return false;
                }

            }

            var collidingItems = this._gameData.layers.get(this._mapId).mapData.collisionDetection(this._mapObj);
            if (collidingItems.length > 0) {
                return false;
            }
            else {
                return true;
            }
        },

        execute: function () {

            this._mapObj.state = mapObjectStates.WORKING;
            this._mapObj._id = 'tmpId'+Math.random();
            this.start(Date.now() + ntp.offset() );

            // make sure that the object is in gameData:
            this._gameData.layers.get(this._mapId).mapData.addObject(this._mapObj);

            console.log("I build a " + this._mapObj.objTypeId + " at coordinates ("+ this._mapObj.x+","+this._mapObj.y+")");
            this._super();
        },

        executeOnServer: function () {
            var self = this;
            this._mapObj.state = mapObjectStates.WORKING;
            this._mapObj._id = (new mongodb.ObjectID()).toHexString();
            this.start(Date.now());

            // make sure that the object is in gameData:
            this._gameData.layers.get(this._mapId).mapData.addObject(this._mapObj);

            dbConn.get('mapObjects', function (err, collMapObjects) {
                if (err) throw err;
                collMapObjects.insert(self._mapObj.save(), function(err,docs) {
                    if (err) throw err;
                });
            });

            this._super();

        },

        executeOnOthers: function() {
            // make sure that the object is in gameData:
            this._gameData.layers.get(this._mapId).addObject(this._mapObj);
            this._super();
        },

        updateFromServer: function (event) {
            this._super(event);
            // update ID:
            console.log("replace tmp Object ID: "+this._mapObj._id+" by new id from server: "+event._mapObj._id);
            this._gameData.layers.get(this._mapId).mapData.mapObjects.updateId(this._mapObj._id,event._mapObj._id);
            this._mapObj.notifyChange();
        },


        start: function(startTime){
            this._super(startTime);
            this._mapObj.state = mapObjectStates.WORKING;
            this.saveToDb();
        },

        updateDueTime: function(){
            if (this._startedTime) {
                var buildTime = this._gameData.objectTypes.get(this._mapObj.objTypeId)._buildTime;
                this.setDueTime(this._startedTime + buildTime);
            }
            else {
                this.setDueTime(0);
            }
        },

        finish: function () {
            var self = this;
            this._mapObj.setState(mapObjectStates.FINISHED);
            this._mapObj.notifyChange();
            if (node) {
                dbConn.get('mapObjects', function (err, collMapObjects) {
                    if (err) throw err;
                    collMapObjects.save(self._mapObj.save(), function(err,docs) {
                        if (err) throw err;
                        console.log("updated map object in db");
                    });
                });
            }
            this._super();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._mapObj.save()];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                var mapObjId = o.a2[0]._id;
                if(this._gameData.layers.get(this._mapId).mapData.mapObjects.get(mapObjId)) {
                    this._gameData.layers.get(this._mapId).mapData.mapObjects.get(mapObjId).load(o.a2[0]);
                    this._mapObj = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(mapObjId);
                }
                else {
                    this._mapObj = new MapObject(this._gameData,o.a2[0]);
                }
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        },

        revert: function() {
            this._gameData.layers.get(this._mapId).removeObject(this._mapObj);
            return true;
        }
    });

    exports.BuildObjectEvent = BuildObjectEvent;

})(node ? exports : window);

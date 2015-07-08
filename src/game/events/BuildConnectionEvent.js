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

    var BuildConnectionEvent = AbstractEvent.extend({

        _type: "BuildConnectionEvent",
        _hubObj : null,
        _mapObj : null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        setHubObject: function (hubObj) {
            this._hubObj = hubObj;
            this._mapId = this._hubObj.mapId;
        },

        setMapObjectById: function (objId) {
            this._mapObj = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(objId);
        },

        isValid: function () {
            //check if mapObject is defined
            if (this._mapObj == undefined) {
                return false;
            }

            //check if both are on the same layer:
            if (this._hubObj.mapId != this._mapObj.mapId){
                return false;
            }

            //check if the other object has a hubConnectivity
            if (!this._mapObj._blocks.hasOwnProperty("HubConnectivity")){
                return false;
            }

            //check if it is really a hub node
            if (!this._hubObj._blocks.hasOwnProperty("HubNode")){
                return false;
            }

            //check if there is a port free in the hub node
            if (!this._hubObj._blocks.HubConnectivity.getFreePorts() > 0){
                return false;
            }

            //check if there is a port free in the mapObj
            if (!this._mapObj._blocks.HubConnectivity.getFreePorts() > 0){
                return false;
            }

            //check if the connection is already there
            if (this._hubObj._blocks.HubConnectivity._connectedObjIds.hasOwnProperty(this._mapObj._id)){
                return false;
            }

            //don't allow self connection
            if (this._hubObj._id == this._mapObj._id){
                return false;
            }

            //check if both are within the range given by the hub:
            if (this._hubObj._blocks.HubNode.getMaxRange() < this.getDistance()) {
                return false;
            }

            //all checks passed:
            return true;

        },

        getDistance: function() {
            var x = (this._hubObj.x - this._mapObj.x);
            var y = (this._hubObj.y - this._mapObj.y);
            return Math.sqrt(x*x + y*y);
        },

        execute: function () {

            this.start( Date.now() + ntp.offset() );

            this.applyToGame();

            console.log("I am building a connection from hub " + this._hubObj._id + " to mapObject " + this._mapObj._id);
            this._super();
        },

        executeOnServer: function () {
            var self = this;
            this.start(Date.now());

            this.applyToGame();

            dbConn.get('mapObjects', function (err, collMapObjects) {
                if (err) throw err;
                collMapObjects.save(self._mapObj.save(), function(err,docs) {
                    if (err) throw err;
                });
                collMapObjects.save(self._hubObj.save(), function(err,docs) {
                    if (err) throw err;
                });
            });

            this._super();

        },

        executeOnOthers: function() {
            // make sure that the object is in gameData:
            this.applyToGame();
            this._super();
        },

        applyToGame: function() {
            // change gameData:
            this._hubObj._blocks.HubConnectivity._connectedObjIds[this._mapObj._id] = false;
            this._mapObj._blocks.HubConnectivity._connectedObjIds[this._hubObj._id] = false;
        },

        /**
         * not needed here....
         * @param startTime
         */
        //updateFromServer: function (event) {
        //    this._super(event);
        //},


        start: function(startTime){
            this._super(startTime);
            this._hubObj.state = mapObjectStates.UPDATING;
            this.saveToDb();
        },

        updateDueTime: function(){
            if (this._startedTime) {
                var buildTime = this.getDistance() * this._hubObj._blocks.HubNode.getConnBuildTimePerDist();
                this.setDueTime(this._startedTime + buildTime);
            }
            else {
                this.setDueTime(0);
            }
        },

        finish: function () {
            var self = this;

            this._hubObj._blocks.HubConnectivity._connectedObjIds[this._mapObj._id] = true;
            this._mapObj._blocks.HubConnectivity._connectedObjIds[this._hubObj._id] = true;

            this._hubObj.setState(mapObjectStates.FINISHED);
            this._hubObj.notifyChange();
            if (node) {
                dbConn.get('mapObjects', function (err, collMapObjects) {
                    if (err) throw err;
                    collMapObjects.save(self._mapObj.save(), function(err,docs) {
                        if (err) throw err;
                    });
                    collMapObjects.save(self._hubObj.save(), function(err,docs) {
                        if (err) throw err;
                    });
                });
            }
            this._super();
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._mapObj._id,
                this._hubObj._id];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._mapObj = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(o.a2[0]);
                this._hubObj = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(o.a2[1]);
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

            delete this._hubObj._blocks.HubConnectivity._connectedObjIds[this._mapObj._id];
            delete this._mapObj._blocks.HubConnectivity._connectedObjIds[this._hubObj._id];

            return true;
        }
    });

    exports.BuildConnectionEvent = BuildConnectionEvent;

})(node ? exports : window);

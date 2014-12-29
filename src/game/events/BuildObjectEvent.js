var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../mapObjects/MapObject').MapObject;
    var mapObjectStates = require('../mapObjects/MapObject').mapObjectStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
    var createMapObject = require('../mapObjects/createMapObject').createMapObject;
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
            var collidingItems = this._gameData.maps.get(this._mapId).collisionDetection(this._mapObj);
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
            this.applyToGame();
            console.log("I build a " + this._mapObj.objTypeId + " at coordinates ("+ this._mapObj.x+","+this._mapObj.y+")");
        },

        executeOnServer: function (callback) {
            var self = this;
            this._mapObj._id = new mongodb.ObjectID();
            dbConn.get('mapObjects', function (err, collMapObjects) {
                if (err) callback(err);
                collMapObjects.insert(self._mapObj.save(), function(err,docs) {
                    if (err) callback(err);
                    self.applyToGame();
                    console.log("a user build a " + self._mapObj.objTypeId + " at coordinates ("+ self._mapObj.x+","+self._mapObj.y+")");
                    callback(null);
                });
            });
        },

        updateFromServer: function (event) {
            // update ID:
            console.log("replace tmp Object ID: "+this._mapObj._id+" by new id from server: "+event._mapObj._id);
            this._gameData.maps.get(this._mapId).mapObjects.updateId(this._mapObj._id,event._mapObj._id);
            this._mapObj.notifyChange();

            // Update other properties:
            this._id = event._id;
            this._dueTime = event._dueTime;
        },

        applyToGame: function() {

            var buildTime = this._gameData.objectTypes.get(this._mapObj.objTypeId)._buildTime;
            this._dueTime = Date.now() + buildTime;

            // make sure that the object is in gameData:
            this._gameData.maps.get(this._mapId).addObject(this._mapObj);
        },

        finish: function () {
            this._mapObj.setState(mapObjectStates.FINISHED);
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
                if(this._gameData.maps.get(this._mapId).mapObjects.get(mapObjId)) {
                    this._gameData.maps.get(this._mapId).mapObjects.get(mapObjId).load(o.a2[0]);
                    this._mapObj = this._gameData.maps.get(this._mapId).mapObjects.get(mapObjId);
                }
                else {
                    this._mapObj = createMapObject(this._gameData,o.a2[0]);
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
            this._gameData.maps.get(this._mapId).removeObject(this._mapObj);
            return true;
        }
    });

    exports.BuildObjectEvent = BuildObjectEvent;

})(node ? exports : window);

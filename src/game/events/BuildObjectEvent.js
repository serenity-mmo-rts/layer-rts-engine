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
            var collidingItems = this._gameData.maps.get(this._mapId).collisionDetection(this._mapObj);
            if (collidingItems.length > 0) {
                return false;
            }
            else {
                return true;
            }
        },

        execute: function (callback) {
            var self = this;

            function reallyExecute(err) {
                self._gameData.maps.get(self._mapId).addObject(self._mapObj);
                console.log("a user build a " + self._mapObj.objTypeId + " at coordinates ("+ self._mapObj.x+","+self._mapObj.y+")");
                if (callback) {
                    callback(err);
                }
            }

            this._mapObj.state = mapObjectStates.FINISHED;
            if (node) {
                this._mapObj._id = new mongodb.ObjectID();
                dbConn.get('mapObjects', function (err, collMapObjects) {
                    if (err) throw err;
                    collMapObjects.insert(self._mapObj.save(), function(err,docs) {
                        reallyExecute(err);
                    });
                });
            }
            else {
                this._mapObj._id = 'tmpId'+Math.random();
                reallyExecute(null);
            }
        },

        finish: function () {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._mapObj.save()];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._mapObj = new MapObject(this._gameData,o.a2[0]);
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        },

        updateFromServer: function (event) {

            var tmpMapObj = this._mapObj;
            tmpMapObj.load(event._mapObj);
            this.load(event);
            this._mapObj = tmpMapObj;

            this.applyToGame();
        },

        applyToGame: function() {
            // make sure that the object is in gameData:
            this._gameData.maps.get(this._mapId).addObject(this._mapObj);
        }
    });

    exports.BuildObjectEvent = BuildObjectEvent;

})(node ? exports : window);

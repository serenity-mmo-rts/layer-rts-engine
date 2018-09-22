
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

    var PlaceObjectEvent = AbstractEvent.extend({

        // serialized
        type: "PlaceObjectEvent",
        mapObjId: null,
        x: 0,
        y: 0,

        //not serialized
        mapObj: null,

        init: function(parent, initObj){
            this._super( parent, initObj );
        },

        isValid: function () {


            //check if mapObject is defined
            if (this.mapObj == undefined) {
                return false;
            }

            //check if correct layer
            if (this.mapId != this.mapObj.mapId()){
                return false;
            }

            var collidingItems = this.gameData.layers.get(this.mapId).mapData.collisionDetection(this.mapObj);

            if (collidingItems.length > 0) {
                return false
            }
            else {
                return true;
            }

        },

        setCoordinates: function (coordinate) {
            this.x = coordinate.x;
            this.y = coordinate.y;
        },


        setParameters: function (mapObj) {
            this.mapObjId = mapObj._id;
            this.setPointers();
        },

        setPointers: function () {
            this._super();
            this.mapObj =  this.map.mapData.mapObjects.get(this.mapObjId);
            this.mapObjTypeId = this.mapObj.objTypeId();
            this.mapObj.x(this.x);
            this.mapObj.y(this.y);
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
            this.mapObj.needsTobePlaced(false);
            this.mapObj.state(State.NORMAL);
            this.mapObj.setPointers();
            this.mapObj.embedded(true);

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjId,
                this.x,
                this.y
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjId= o.a2[0];
                this.x= o.a2[1];
                this.y= o.a2[2];
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

    exports.PlaceObjectEvent = PlaceObjectEvent;

})(node ? exports : window);

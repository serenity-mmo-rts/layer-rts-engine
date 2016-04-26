var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var Item =require('../Item').Item;
    var MapObject = require('../MapObject').MapObject;
    var itemStates =require('../Item').itemStates;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var MoveThroughLayerEvent = AbstractEvent.extend({

        // states
        _type: "MoveThroughLayerEvent",
        mapObjIdStay: null,
        mapObjIdTmp: null,

        // helpers
        mapObj: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },


        isValid: function () {
            return true;
        },

        setParameters: function (mapObj) {
            this.mapObjIdStay = mapObj._id;
            this.setPointers();
        },


        setPointers: function(){
            this._super();
            this.mapObj = this.map.mapData.mapObjects.get(this.mapObjIdStay);
        },

        executeOnClient: function () {
            this.mapObjIdTmp  = 'tmpObjId'+Math.random();
            this.start(Date.now() + ntp.offset());
            this.execute();
        },

        executeOnServer: function () {
            this.mapObjIdTmp = (new mongodb.ObjectID()).toHexString();
            this.start(Date.now());
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            var parentMapId =  this._gameData.layers.get(this._mapId).parentMapId;
            var parentObjId =  this._gameData.layers.get(this._mapId).parentObjId;

            // create temporary map object in lower layer for rendering moving
            this.mapObjTmp = new MapObject(this._gameData, {_id: this.mapObjIdTmp, mapId: this._mapId, x: this._mapObj.x, y: this._mapObj.y, objTypeId: this._mapObj.objTypeId, userId: this._userId, state: mapObjectStates.TEMP});
            this._gameData.layers.get(this._mapId).mapData.addObject(this.mapObjTmp);
            this.mapObjTmp.setPointers();

            // get item corresponding to map Object
            var subItemId = this._mapObj.getSubItem();
            var item = this.gameData.layers.get(this.mapId).mapData.items.get(subItemId);

            // change Map Ids
            this._mapObj.mapId = parentMapId;
            item._mapId = parentMapId;

            // remove item and object from current layer
            this._gameData.layers.get(this._mapId).mapData.removeObject(this.mapObj);
            this._gameData.layers.get(this._mapId).mapData.removeItem(item);

            // add item and object to  parent layer
            this._gameData.layers.get(parentMapId).mapData.addObject(this.mapObj);
            this._gameData.layers.get(parentMapId).mapData.addItem(item);


            this.item._blocks.SubObject.addMovementProps(this._mapObj);
            this.item._blocks.SubObject.lockItem(this._startedTime);

            this.mapObjTmp._blocks.UpgradeProduction.addEventToQueue(this);
            this.mapObjTmp._blocks.UpgradeProduction.checkQueue(this._startedTime);
        },

        updateFromServer: function (event) {
            this._super(event);
            this._mapObj._blocks.Unit.updateDueTime(event._startedTime);
        },

        revert: function() {

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.mapObjIdStay,
            ];
            return o;
        },


        load: function (o,flag) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.mapObjIdStay = o.a2[0];

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

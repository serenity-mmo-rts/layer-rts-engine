var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var MapObject = require('./MapObject').MapObject;
    var createMapObject = require('./mapObjects/createMapObject');
    var EventScheduler = require('./events/EventScheduler').EventScheduler;
    var ItemModel = require('./Item').ItemModel;
}

(function (exports) {
    var MapData = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.width = 0;
        this.height = 0;
        this.mapTypeId = null;
        this.parentMapId = null;

        // not serialized:
        this.mapObjects = new GameList(gameData,MapObject,false,createMapObject);
        this.items = new GameList(gameData,ItemModel,false,false);
        this.eventScheduler = new EventScheduler(gameData);
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null;
        this.itemChangedCallback = null;

        // init:
        if (MapData.arguments.length == 2) {
            this.load(initObj);
        }

    }

    MapData.prototype = {

        save: function () {
            var o = {_id: this._id,
                a: [this.width,
                    this.height,
                    this.mapTypeId,
                    this.parentMapId]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.width = o.a[0];
                this.height = o.a[1];
                this.mapTypeId = o.a[2];
                this.parentMapId = o.a[3];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }
            this.rebuildQuadTree();
        }
    }

    exports.MapData = MapData;

})(node ? exports : window);

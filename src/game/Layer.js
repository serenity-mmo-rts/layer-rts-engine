var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var EventScheduler = require('./layer/EventScheduler').EventScheduler;
    var MapData = require('./layer/MapData').MapData;
}

(function (exports) {
    var Layer = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.width = 0;
        this.height = 0;
        this.mapTypeId = null;
        this.parentMapId = null;

        // not serialized:
        this.eventScheduler = new EventScheduler(gameData);
        this.mapData = new MapData(gameData);
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null;
        this.itemChangedCallback = null;

        // init:
        if (Layer.arguments.length == 2) {
            this.load(initObj);
        }

    }

    Layer.prototype = {

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
            this.mapData.rebuildQuadTree();
        }
    }

    exports.Layer = Layer;

})(node ? exports : window);

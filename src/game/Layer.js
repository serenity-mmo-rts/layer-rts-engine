var node = !(typeof exports === 'undefined');

if (node) {
    var GameList = require('./GameList').GameList;
    var TimeScheduler = require('./layer/TimeScheduler').TimeScheduler;
    var EventScheduler = require('./layer/EventScheduler').EventScheduler;
    var MapData = require('./layer/MapData').MapData;
}

(function (exports) {
    var Layer = function (gameData, initObj) {
        // serialized:
        this._id = 0;
        this.parentObjId = null;
        this.width = 0;
        this.height = 0;
        this.mapTypeId = null;
        this.parentMapId = null;

        // not serialized:
        this.timeScheduler = new TimeScheduler(gameData);
        this.eventScheduler = new EventScheduler(gameData);
        this.mapData = new MapData(gameData, this);
        this.gameData = gameData;

        // init:
        if (Layer.arguments.length == 2) {
            this.load(initObj);
        }

    };

    var proto = Layer.prototype;



    proto.save = function () {
        var o = {
            _id: this._id,
            a: [this.parentObjId,
                this.width,
                this.height,
                this.mapTypeId,
                this.parentMapId]
        };
        return o;
    };

    proto.load = function (o) {
        if (o.hasOwnProperty("a")) {
            this._id = o._id;
            this.parentObjId = o.a[0];
            this.width = o.a[1];
            this.height = o.a[2];
            this.mapTypeId = o.a[3];
            this.parentMapId = o.a[4];
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
    };

    proto.createSublayer = function (x, y, sublayerId, parentObjId) {

        var newCityMap = new Layer(this._gameData, {
            _id: sublayerId,
            parentObjId: parentObjId,
            width: 10000,
            height: 10000,
            mapTypeId: "cityMapType01",
            parentMapId: this._id,
            gameData: this._gameData
        });

        this.gameData.layers.add(newCityMap);
    };

    exports.Layer = Layer;

})(typeof exports === 'undefined' ? window : exports);
//})(node ? exports : window);

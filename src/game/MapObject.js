(function (exports) {

    var mapObjectStates = {};
    mapObjectStates.TEMP = 0;
    mapObjectStates.WORKING = 1;
    mapObjectStates.FINISHED = 2;


    function MapObject(gameData,initObj) {
        // serialized:
        this._id = 0;
        this.mapId = null;
        this.objTypeId = null;
        this.x = null;
        this.y = null;
        this.width = null; // optional
        this.height = null; // optional
        this.userId = 0; // optional
        this.state = mapObjectStates.FINISHED;

        // new member variables
        this.level= 0;
        this.healthPoints = 0;
        this.units = [];
        this.items = [];
        this.features = [];
        this.resources = [];
        this.owners = [];
        this.name = null;
        //

        // not serialized:
        this.gameData = gameData;

        // init:
        if (MapObject.arguments.length == 2) {
            this.load(initObj);
        }
    }

    MapObject.prototype = {
        save: function () {
            var o = {_id: this._id,
                mapId: this.mapId,
                a: [this.objTypeId,
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                    this.userId,
                    this.state]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.mapId = o.mapId;
                this.objTypeId = o.a[0];
                this.x = o.a[1];
                this.y = o.a[2];
                this.width = o.a[3];
                this.height = o.a[4];
                this.userId = o.a[5];
                this.state = o.a[6];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }
    }

    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

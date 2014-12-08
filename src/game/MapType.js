(function (exports) {

    var MapType = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this._name = null;
        this._scale = null;
        this._ratioWidthHeight = 2;
        this._bgColor = null;
        this._groundImage = null;
        this._groundImageScaling = null;
        this._buildCategories = [];  // = [ {name: 'Productions'; objectTypeIds: [1, 5, 7, 2]},  ]

        // not serialized:
        this._gameData = gameData;

        // init:
        if (MapType.arguments.length == 2) {
            this.load(initObj);
        }
    }

    MapType.prototype = {

        save: function () {
            var o = {_id: this._id,
                a: [this._name,
                    this._scale,
                    this._ratioWidthHeight,
                    this._bgColor,
                    this._groundImage,
                    this._groundImageScaling,
                    this._buildCategories]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._name = o.a[0];
                this._scale = o.a[1];
                this._ratioWidthHeight = o.a[2];
                this._bgColor = o.a[3];
                this._groundImage = o.a[4];
                this._groundImageScaling = o.a[5];
                this._buildCategories = o.a[6];
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

    exports.MapType = MapType;

})(typeof exports === 'undefined' ? window : exports);

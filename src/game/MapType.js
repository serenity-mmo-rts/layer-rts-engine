(function (exports) {

    var MapType = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.name = null;
        this.scale = null;
        this.ratioWidthHeight = 2;
        this.bgColor = null;
        this.groundImage = null;
        this.groundImageScaling = null;
        this.buildCategories = [];  // = [ {name: 'Productions'; objectTypeIds: [1, 5, 7, 2]},  ]

        // not serialized:
        this.gameData = gameData;

        // init:
        if (MapType.arguments.length == 2) {
            this.load(initObj);
        }
    }

    MapType.prototype = {

        save: function () {
            var o = {_id: this._id,
                a: [this.name,
                    this.scale,
                    this.ratioWidthHeight,
                    this.bgColor,
                    this.groundImage,
                    this.groundImageScaling,
                    this.buildCategories]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.name = o.a[0];
                this.scale = o.a[1];
                this.ratioWidthHeight = o.a[2];
                this.bgColor = o.a[3];
                this.groundImage = o.a[4];
                this.groundImageScaling = o.a[5];
                this.buildCategories = o.a[6];
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

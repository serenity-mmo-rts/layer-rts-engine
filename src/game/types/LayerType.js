(function (exports) {



    var LayerType = function (arg1,initObj) {
        // serialized:
        this._id = 0;
        this.blocks = {};
        this.name = null;
        this.scale = null;
        this.ratioWidthHeight = 2;
        this.bgColor = null;
        this.groundImage = null;
        this.groundImageScaling = null;
        this.groundDragScaling = 1;
        this.buildCategories = [];  // = [ {name: 'Productions'; objectTypeIds: [1, 5, 7, 2]},  ]


        if (arg1.constructor.name === "GameData"){
            this.gameData = arg1;
        }
        else {
            this.parent = arg1;
            this.gameData = this.parent.getGameData();
        }

        // init:
        if (LayerType.arguments.length == 2) {
            this.load(initObj);
        }
    }

    LayerType.prototype = {

        save: function () {
            var o = {_id: this._id,
                a: [this.blocks,
                    this.name,
                    this.scale,
                    this.ratioWidthHeight,
                    this.bgColor,
                    this.groundImage,
                    this.groundImageScaling,
                    this.groundDragScaling,
                    this.buildCategories]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.blocks = o.a[0];
                this.name = o.a[1];
                this.scale = o.a[2];
                this.ratioWidthHeight = o.a[3];
                this.bgColor = o.a[4];
                this.groundImage = o.a[5];
                this.groundImageScaling = o.a[6];
                this.groundDragScaling = o.a[7];
                this.buildCategories = o.a[8];
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

    exports.LayerType = LayerType;

})(typeof exports === 'undefined' ? window : exports);

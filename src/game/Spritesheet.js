(function (exports) {

    var Spritesheet = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.images = null;
        this.frames = null;
        this.animations = null;

        // not serialized:
        this.gameData = gameData;

        // init:
        if (Spritesheet.arguments.length == 2) {
            this.load(initObj);
        }
    }

    Spritesheet.prototype = {


        save: function () {
            var o = {_id: this._id,
                a: [this.images,
                    this.frames,
                    this.animations]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.images = o.a[0];
                this.frames = o.a[1];
                this.animations = o.a[2];
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

    exports.Spritesheet = Spritesheet;

})(typeof exports === 'undefined' ? window : exports);


(function (exports) {

    var RessourceType = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.allowOnMapTypeId = null;
        this.name = null;
        this.spriteFrameIcon = null;
        this.buildMenuTooltip = null;

        // not serialized:
        this.gameData = gameData;

        // init:
        if (RessourceType.arguments.length == 2) {
            this.load(initObj);
        }
    }

    RessourceType.prototype = {


        save: function () {
            var o = {_id: this._id,
                a: [this.allowOnMapTypeId,
                    this.name,
                    this.spriteFrameIcon,
                    this.buildMenuTooltip]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.allowOnMapTypeId = o.a[0];
                this.name = o.a[1];
                this.spriteFrameIcon = o.a[2];
                this.buildMenuTooltip = o.a[3];
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

    exports.RessourceType = RessourceType;

})(typeof exports === 'undefined' ? window : exports);

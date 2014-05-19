(function (exports) {

    var ObjectType = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.initWidth = null;
        this.initHeight = null;
        this.allowOnMapTypeId = null;
        this.hasChildMapTypeId = null;
        this.name = null;
        this.spritesheetId = null;
        this.spriteFrame = null;
        this.spriteFrameIcon = null;
        this.buildMenuTooltip = null;

        // not serialized:
        this.gameData = gameData;

        // init:
        if (ObjectType.arguments.length == 2) {
            this.load(initObj);
        }
    }

    ObjectType.prototype = {


        getArea: function () {
            return this.width * this.height;
        },

        save: function () {
            var o = {_id: this._id,
                a: [this.initWidth,
                    this.initHeight,
                    this.allowOnMapTypeId,
                    this.hasChildMapTypeId,
                    this.name,
                    this.spritesheetId,
                    this.spriteFrame,
                    this.spriteFrameIcon,
                    this.buildMenuTooltip]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.initWidth = o.a[0];
                this.initHeight = o.a[1];
                this.allowOnMapTypeId = o.a[2];
                this.hasChildMapTypeId = o.a[3];
                this.name = o.a[4];
                this.spritesheetId = o.a[5];
                this.spriteFrame = o.a[6];
                this.spriteFrameIcon = o.a[7];
                this.buildMenuTooltip = o.a[8];
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

    exports.ObjectType = ObjectType;

})(typeof exports === 'undefined' ? window : exports);

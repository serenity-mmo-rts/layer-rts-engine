var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
}

(function (exports) {

    var AbstractType = Class.extend({

        // general
        _id: 0,
        name : null,
       //rendering
        iconSpritesheetId : null,
        iconSpriteFrame : null,
        buildMenuTooltip : null,
        buildTime : null,

        parent: null,


        /*
         constructor(gameData,initObj)
         or
         constructor(parent,initObj)
         */
        init: function(arg1, initObj) {

            if (arg1.constructor.name === "GameData"){
                this.gameData = arg1;
            }
            else {
                this.parent = arg1;
                this.gameData = this.parent.getGameData();
            }

            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {_id: this._id,
                type: this.type,
                a: [this.name,
                    this.iconSpritesheetId,
                    this.iconSpriteFrame,
                    this.buildMenuTooltip,
                    this.buildTime
                    ]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.name = o.a[0];
                this.iconSpritesheetId = o.a[1];
                this.iconSpriteFrame = o.a[2];
                this.buildMenuTooltip  = o.a[3];
                this.buildTime = o.a[4];

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
        }

    });


    exports.AbstractType = AbstractType;

})(node ? exports : window);


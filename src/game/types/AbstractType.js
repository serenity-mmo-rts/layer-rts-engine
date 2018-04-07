var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
}

(function (exports) {

    var AbstractType = Class.extend({

        // general
        id: 0,
        name : null,
       //rendering
        iconSpritesheetId : null,
        iconSpriteFrame : null,
        buildMenuTooltip : null,
        buildTime : null,


        init: function(gameData, initObj) {
            this.gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {id: this.id,
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
                this.id = o.id;
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
            if (typeof this.id != 'string') {
                this.id = this.id.toHexString();
            }
        }

    });


    exports.AbstractType = AbstractType;

})(node ? exports : window);


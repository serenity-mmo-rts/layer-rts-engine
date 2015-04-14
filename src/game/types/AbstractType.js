var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
}

(function (exports) {

    var AbstractType = Class.extend({

        // general
        _id: 0,
        _name : null,
       //rendering
        _iconSpritesheetId : null,
        _iconSpriteFrame : null,
        _buildMenuTooltip : null,
        _buildTime : null,


        init: function(gameData, initObj) {
            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {_id: this._id,
                _type: this._type,
                a: [this._name,
                    this._iconSpritesheetId,
                    this._iconSpriteFrame,
                    this._buildMenuTooltip,
                    this._buildTime
                    ]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._name = o.a[0];
                this._iconSpritesheetId = o.a[1];
                this._iconSpriteFrame = o.a[2];
                this._buildMenuTooltip  = o.a[3];
                this._buildTime = o.a[4];

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


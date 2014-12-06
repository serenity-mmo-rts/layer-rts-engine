var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var ObjectType = require('./ObjectType');
    var RessourceType = require('./RessourceType');
    var TechnologyType = require('./TechnologyType');
    var ItemType = require('./ItemType');
    var UnitType = require('./UnitType');
    var UpgradeType = require('./UpgradeType');

}

(function (exports) {

    var AbstractType = Class.extend({

        // general
        _id: 0,
        _name : null,
       //rendering
        _spritesheetId : null,
        _spriteFrameIcon : null,
        _buildMenuTooltip : null,


        init: function(gameData, initObj) {
            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {_id: this._id,
                _type: this._type,
                a: [this._name,
                    this._spritesheetId,
                    this._spriteFrameIcon,
                    this._buildMenuTooltip]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._name = o.a[0];
                this._spritesheetId = o.a[1];
                this._spriteFrameIcon = o.a[2];
                this._buildMenuTooltip  = o.a[3];

            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    });


    exports.AbstractType = AbstractType;

})(node ? exports : window);


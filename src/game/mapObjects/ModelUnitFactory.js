var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;



}

(function (exports) {

    var ModelUnitFactory = UserObject.extend({

        init: function ModelUnitFactory(gameData,initObj) {
            this._super( gameData, initObj );
        },

        save: function () {
            var o = this._super();
            o.a3 = [this._type];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a2"))
            {
                this._super(o);
                if (o.hasOwnProperty("a3"))
                {
                    this.unitsInProduction = o.a3[0];
                }
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

    exports.ModelUnitFactory = ModelUnitFactory;

})(node ? exports : window);

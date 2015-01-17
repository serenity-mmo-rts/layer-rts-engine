var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;



}

(function (exports) {

    var ModelHub = UserObject.extend({

        init: function ModelHub(gameData,initObj) {
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
                    this.objectsConnected = o.a3[0];
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

    exports.ModelHub = ModelHub;

})(node ? exports : window);

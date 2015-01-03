var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;



}

(function (exports) {

    var ModelFactory = UserObject.extend({

        init: function ModelFactory(gameData,initObj) {
            this.productionSpeed = 0;
            // not serialized:
            this.gameData = gameData;

            // init:
            if (ModelFactory.arguments.length == 2) {
                this.load(initObj);
            }
        },

        save: function () {
            var o = this._super();
            o.a3 = [this.productionSpeed];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a2"))
            {
                this._super(o);
                if (o.hasOwnProperty("a3"))
                {
                    this.productionSpeed = o.a3[0];
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

    exports.ModelFactory = ModelFactory;

})(node ? exports : window);

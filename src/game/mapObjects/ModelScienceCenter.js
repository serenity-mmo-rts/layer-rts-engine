var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;



}

(function (exports) {

    var ModelScienceCenter = UserObject.extend({

        init: function ModelScienceCenter(gameData,initObj) {
            this.currentResearch = null;
            // not serialized:
            this.gameData = gameData;

            // init:
            if (ModelScienceCenter.arguments.length == 2) {
                this.load(initObj);
            }
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
                    this.currentResearch = o.a3[0];
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

    exports.ModelScienceCenter = ModelScienceCenter;

})(node ? exports : window);

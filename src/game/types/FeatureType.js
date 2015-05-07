var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
}

(function (exports) {

    var FeatureType = Class.extend({

        // general
        _id: 0,
        _name : null,
        _effect: null,



        init: function(gameData, initObj) {
            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {_id: this._id,
                a: [this._name,
                    this._effect
                ]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._name = o.a[0];
                this._effect = o.a[1];


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


    exports.FeatureType = FeatureType;

})(node ? exports : window);



var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType = require('./AbstractType').AbstractType;
}

(function (exports) {

    var RessourceType = AbstractType.extend({
        // serialized:
        _type: "RessourceType",

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            return o;
        },

        load: function (o) {
            this._super(o);
        }


    });

    exports.RessourceType = RessourceType;

})(typeof exports === 'undefined' ? window : exports);

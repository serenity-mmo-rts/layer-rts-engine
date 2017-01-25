var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var UserType = AbstractType.extend({

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

    exports.UserType= UserType;

})(typeof exports === 'undefined' ? window : exports);

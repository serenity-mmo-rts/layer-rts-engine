var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var UserType = AbstractType.extend({

        init: function(arg1, initObj){

            this._super( arg1, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [this.blocks
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.blocks = o.a2[0];
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

    exports.UserType= UserType;

})(typeof exports === 'undefined' ? window : exports);

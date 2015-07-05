var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {


    var ResourceProduction = function (initObj){


    };

    ResourceProduction.prototype= {



        save: function () {
            var o = {
                a: [this.productionSpeed
            ]};
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

    };

    exports.ResourceProduction = ResourceProduction;

})(typeof exports === 'undefined' ? window : exports);
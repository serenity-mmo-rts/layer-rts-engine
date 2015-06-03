var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../../Class').Class;
    var GameData = require('../../GameData').GameData;
    var GameList = require('../../GameList').GameList;
}

(function (exports) {


    var Environment = function (gameData,initObj){


    };

    Environment.prototype= {



        save: function () {

            o.a3 = [this.productionSpeed];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a2"))
            {

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

    exports.Environment = Environment;

})(typeof exports === 'undefined' ? window : exports);

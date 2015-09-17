var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    var Tower = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;


        //write protected instance properties (defined by object type and features):


        //serialized state:

    };

    Tower.prototype= {

        updateStateVars: function(){

        },


        save: function () {
            var o = {
                a : [

                ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {

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

    exports.Tower = Tower;

})(typeof exports === 'undefined' ? window : exports);

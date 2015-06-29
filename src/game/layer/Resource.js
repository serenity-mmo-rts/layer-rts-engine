
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}



(function (exports) {

    var Resource = function (mapObj,initObj){

        this._hubSystems = [];

    };

    Resource.prototype= {


        save: function () {

            var o = {};

            return o;
        },


        load: function (o) {


        }

    }

    exports.Resource = Resource;

})(typeof exports === 'undefined' ? window : exports);
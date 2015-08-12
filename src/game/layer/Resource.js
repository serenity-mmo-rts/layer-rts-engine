
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}



(function (exports) {

    var Resource = function (mapObj,initObj){


        // do not serialize:
        this.hubSystems = []; // stores all objects of each hub system

    };

    Resource.prototype= {

        addToHubSystem: function(sourceItemId,targetItemId){

        },

        save: function () {

            var o = {};

            return o;
        },


        load: function (o) {


        }

    }

    exports.Resource = Resource;

})(typeof exports === 'undefined' ? window : exports);
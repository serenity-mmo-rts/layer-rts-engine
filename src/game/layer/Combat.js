
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}



(function (exports) {

    var Combat = function (mapObj,initObj){

    };

    Combat.prototype= {

        _isAttackPossible: function(sourceItemId,targetItemId){

        },

        save: function () {

            var o = {};

            return o;
        },


        load: function (o) {


        }

    }

    exports.Combat = Combat;

})(typeof exports === 'undefined' ? window : exports);
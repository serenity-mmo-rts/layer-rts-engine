var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    var HubNode = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;


        //write protected instance properties (defined by object type and features):
        this._maxRange = 1000;
        this._connBuildTimePerDist = 1;

        //serialized state:

    };

    HubNode.prototype= {

        getMaxRange: function(){
            return this._maxRange;
        },

        getConnBuildTimePerDist: function(){
            return this._connBuildTimePerDist;
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

    exports.HubNode = HubNode

})(typeof exports === 'undefined' ? window : exports);

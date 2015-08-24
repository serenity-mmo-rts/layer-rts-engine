var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    /**
     * This building block implements connectivity to other map objects. is implemented by hubs and other map objects that connect to hubs
     * @param mapObj
     * @param initObj
     * @constructor
     */
    var Connection = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;

        //write protected instance properties (defined by object type and changed by applied features):


        //serialized state:
        this._connectedFrom = null;    // id encoded. this has to be a hub
        this._connectedTo = null;    // id encoded. can be any other object or hub

    };

    Connection.prototype= {

        getObjectsConnected: function(){
            return [this._connectedFrom, this._connectedTo ];
        },

        save: function () {
            var o = {
                a : [
                    this._connectedFrom,
                    this._connectedTo
                ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this._connectedFrom = o.a[0];
                this._connectedTo = o.a[1];
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

    exports.Connection = Connection

})(typeof exports === 'undefined' ? window : exports);
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
    var HubConnectivity = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;
        this._connectedObjIds = {}; // key=objId, value=false if in production or true if connected


        //write protected instance properties (defined by object type and changed by applied features):
        this._numPorts = null;

        //serialized state:


    };

    HubConnectivity.prototype= {

        updateStateVars: function(){

        },

        getObjectsConnected: function(){
            return this._connectedObjIds;
        },

        getFreePorts: function(){
            return this._numPorts - Object.keys(this._connectedObjIds).length;
        },

        save: function () {
            var o = {
                a : [
                    //this._connectedObjIds
                ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                //this._connectedObjIds = o.a[0];
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

    exports.HubConnectivity = HubConnectivity

})(typeof exports === 'undefined' ? window : exports);

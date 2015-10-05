var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    /**
     * This building block implements the energy management
     * @param mapObj
     * @param initObj
     * @constructor
     */
    var EnergyManager = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;

        //write protected instance properties (defined by object type and changed by applied features):


        //serialized state:

    };

    EnergyManager.prototype= {

        updateStateVars: function(){

        },


        /**
         * This function defines the default type variables and returns them as an object.
         */
        defineTypeVars: function() {
            return {
                requiredPerSec: 0
            };
        },


        /**
         * This function defines the default state variables and returns them as an object.
         */
        defineStateVars: function() {
            return {
                availablePerSec: 0
            };
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

    exports.EnergyManager = EnergyManager

})(typeof exports === 'undefined' ? window : exports);

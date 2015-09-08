var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {


    var ResourceProduction = function (mapObj,initObj){

        //helper member variables:
        this._mapObj = mapObj;

        //write protected instance properties (defined by object type and features):
        this.resInIds = [1, 2];
        this.resInPerSec = [2, 3];
        this.resOutIds = [3];
        this.resOutPerSec = [1];
        this.capacityScaling = 1; //might be changed by features to increase the throughput of the factory

        //serialized state:
        this.productivityCap = 1; //can be set by user to artificially limit productivity or set to 0 to disable production completely

    };

    ResourceProduction.prototype= {

        updateStateVars: function(){

        },


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
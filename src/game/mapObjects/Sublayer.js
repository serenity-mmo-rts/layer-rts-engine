var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    var Sublayer = function (mapObj,initObj){
        this._mapObj = mapObj;

        this._subLayerMapId = null;

        this.load(initObj);

    };

    Sublayer.prototype= {

       save: function () {
           var o = {
            a: [this._subLayerMapId
            ]};
            return o;
        },

        load: function (o) {

            if (o.hasOwnProperty("a"))
            {
                this._subLayerMapId = o.a[0];
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

    exports.Sublayer = Sublayer;

})(typeof exports === 'undefined' ? window : exports);


var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../../Class').Class;
    var GameData = require('../../GameData').GameData;
    var GameList = require('../../GameList').GameList;
}

(function (exports) {



    var Sublayer = function (initObj){
        this.publicArea = null;
        this.sublayerMapId = null;
    };

    Sublayer.prototype= {


        save: function () {
            var o = this._super();
            o.a3 = [this._type, this.sublayerMapId];
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a2"))
            {
                this._super(o);
                if (o.hasOwnProperty("a3"))
                {
                    this.publicArea = o.a3[0];
                    this.sublayerMapId = o.a3[1];
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

    exports.Sublayer = Sublayer;

})(typeof exports === 'undefined' ? window : exports);


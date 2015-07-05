var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}

(function (exports) {

    var HubNode = function (initObj){
        this.objectsConnected = null;
        this.freeSlots = null;
    };

    HubNode.prototype= {


        getObjectsConnected: function(){
            return this.objectsConnected;
        },

        getFreeSlots: function(){
            return this.freeSlots;
        },

        save: function () {
            var o = {
            a : [
                this.objectsConnected,
                this.freeSlots
            ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a2"))
            {
                this._super(o);
                if (o.hasOwnProperty("a3"))
                {
                    this.objectsConnected = o.a3[0];
                    this.freeSlots = o.a3[0];
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

    exports.HubNode = HubNode

})(typeof exports === 'undefined' ? window : exports);

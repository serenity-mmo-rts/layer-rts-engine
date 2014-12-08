
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../mapObjects/MapObject').MapObject;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var AdditiveFeature = AbstractFeature.extend({


        _type: "AdditiveFeature",
        _key: null,
        _value: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        execute: function (key,_value) {

            this._mapObj[this._key] += this._value;
        },


        save: function () {
            var o = this._super();
            o.a2 = [this._key,this._value];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._key = o.a2[0];
                this._value = o.a2[1];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }


    });

    exports.AdditiveFeature = AdditiveFeature;

})(node ? exports : window);

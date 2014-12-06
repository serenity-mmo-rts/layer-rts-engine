var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var ModelHub= MapObject.extend({

        _type: "ModelHub",
        _mapObj : null
    });

    exports.ModelHub= ModelHub;

})(node ? exports : window);


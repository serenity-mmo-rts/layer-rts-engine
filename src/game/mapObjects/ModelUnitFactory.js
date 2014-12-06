var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var mongodb = require('../../server/node_modules/mongodb');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    var ModelUnitFactory = MapObject.extend({

        _type: "ModelUnitFactory",
        _mapObj : null
    });

    exports.ModelUnitFactory = ModelUnitFactory;

})(node ? exports : window);

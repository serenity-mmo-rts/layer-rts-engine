var node = !(typeof exports === 'undefined');
if (node) {

    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;



}

(function (exports) {

    var ModelUnitFactory = UserObject.extend({

        _type: "ModelUnitFactory",
        _mapObj : null
    });

    exports.ModelUnitFactory = ModelUnitFactory;

})(node ? exports : window);

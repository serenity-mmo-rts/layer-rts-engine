
var node = !(typeof exports === 'undefined');
if (node) {
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;

}

(function (exports) {

    var ModelFactory = UserObject.extend({

        _type: "ModelFactory",
        _mapObj : null
    });

    exports.ModelFactory = ModelFactory;

})(node ? exports : window);

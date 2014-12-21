var node = !(typeof exports === 'undefined');
if (node) {
    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;

}

(function (exports) {

    var ModelHub= UserObject.extend({

        _type: "ModelHub",
        _mapObj : null
    });

    exports.ModelHub= ModelHub;

})(node ? exports : window);


var node = !(typeof exports === 'undefined');
if (node) {

    var UserObject = require('./UserObject').UserObject;
    var GameData = require('../GameData').GameData;


}

(function (exports) {

    var ModelScienceCenter = UserObject.extend({

        _type: "ModelScienceCenter",
        _mapObj : null
    });

    exports.ModelFactory= ModelScienceCenter ;

})(node ? exports : window);

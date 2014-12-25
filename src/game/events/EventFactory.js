var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var BuildObjectEvent = require('./BuildObjectEvent').BuildObjectEvent;
}

(function (exports) {

    exports.EventFactory = function(gameData,initObj) {
        var event = null;
        if (initObj._type == "BuildObjectEvent") {
            event = new BuildObjectEvent(gameData,initObj);
        }
        return event;
    };

})(node ? exports : window);

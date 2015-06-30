var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var BuildObjectEvent = require('./BuildObjectEvent').BuildObjectEvent;
    var BuildItemEvent = require('./BuildUpgradeEvent').BuildItemEvent;
}

(function (exports) {

    exports.EventFactory = function(gameData,initObj) {
        var event = null;
        if (initObj._type == "BuildObjectEvent") {
            event = new BuildObjectEvent(gameData,initObj);
        }
        else if (initObj._type == "BuildItemEvent") {
            event = new BuildItemEvent(gameData,initObj);
        }
        return event;
    };

})(node ? exports : window);

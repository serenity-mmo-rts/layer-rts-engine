var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var BuildObjectEvent = require('./BuildObjectEvent').BuildObjectEvent;
    var BuildUpgradeEvent = require('./BuildUpgradeEvent').BuildUpgradeEvent;
    var BuildConnectionEvent = require('./BuildConnectionEvent').BuildConnectionEvent;
    var LevelUpgradeEvent = require('./LevelUpgradeEvent').LevelUpgradeEvent;
}

(function (exports) {

    exports.EventFactory = function(gameData,initObj) {
        var event = null;
        if (initObj._type == "BuildObjectEvent") {
            event = new BuildObjectEvent(gameData,initObj);
        }
        else if (initObj._type == "BuildUpgradeEvent") {
            event = new BuildUpgradeEvent(gameData,initObj);
        }
        else if (initObj._type == "BuildConnectionEvent") {
            event = new BuildConnectionEvent(gameData,initObj);
        }
        else if (initObj._type == "LevelUpgradeEvent") {
            event = new LevelUpgradeEvent(gameData,initObj);
        }
        return event;
    };

})(node ? exports : window);

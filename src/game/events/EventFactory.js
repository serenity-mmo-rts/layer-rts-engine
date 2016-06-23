var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var BuildObjectEvent = require('./BuildObjectEvent').BuildObjectEvent;
    var BuildUpgradeEvent = require('./BuildUpgradeEvent').BuildUpgradeEvent;
    var LevelUpgradeEvent = require('./LevelUpgradeEvent').LevelUpgradeEvent;
    var ActivateFeatureEvent = require('./ActivateFeatureEvent').ActivateFeatureEvent;
    var MoveThroughLayerEvent = require('./MoveThroughLayerEvent').MoveThroughLayerEvent;
    var ResearchEvent = require('./ResearchEvent').ResearchEvent;
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
        else if (initObj._type == "LevelUpgradeEvent") {
            event = new LevelUpgradeEvent(gameData,initObj);
        }
        else if (initObj._type == "ActivateFeatureEvent") {
            event = new ActivateFeatureEvent(gameData,initObj);
        }
        else if (initObj._type == "MoveThroughLayerEvent") {
            event = new MoveThroughLayerEvent(gameData,initObj);
        }
        else if (initObj._type == "ResearchEvent") {
            event = new ResearchEvent(gameData,initObj);
        }
        return event;
    };

})(node ? exports : window);

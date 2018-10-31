var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var LoadEntitiesEvent = require('./LoadEntitiesEvent').LoadEntitiesEvent;
    var BuildObjectEvent = require('./BuildObjectEvent').BuildObjectEvent;
    var BuildUpgradeEvent = require('./BuildUpgradeEvent').BuildUpgradeEvent;
    var LevelUpgradeEvent = require('./LevelUpgradeEvent').LevelUpgradeEvent;
    var ActivateFeatureEvent = require('./ActivateFeatureEvent').ActivateFeatureEvent;
    var MoveObjectUpEvent = require('./MoveObjectUpEvent').MoveObjectUpEvent;
    var MoveItemDownEvent = require('./MoveItemDownEvent').MoveItemDownEvent;
    var PlaceObjectEvent = require('./PlaceObjectEvent').PlaceObjectEvent;
    var DisplaceObjectEvent = require('./DisplaceObjectEvent').DisplaceObjectEvent;
    var ResearchEvent = require('./ResearchEvent').ResearchEvent;
    var MoveItemEvent = require('./MoveItemEvent').MoveItemEvent;
}

(function (exports) {

    exports.EventFactory = function(parent,initObj) {
        var event = null;
        if (initObj.type == "LoadEntitiesEvent") {
            event = new LoadEntitiesEvent(parent,initObj);
        }
        else if (initObj.type == "BuildObjectEvent") {
            event = new BuildObjectEvent(parent,initObj);
        }
        else if (initObj.type == "BuildUpgradeEvent") {
            event = new BuildUpgradeEvent(parent,initObj);
        }
        else if (initObj.type == "LevelUpgradeEvent") {
            event = new LevelUpgradeEvent(parent,initObj);
        }
        else if (initObj.type == "ActivateFeatureEvent") {
            event = new ActivateFeatureEvent(parent,initObj);
        }
        else if (initObj.type == "MoveObjectUpEvent") {
            event = new MoveObjectUpEvent(parent, initObj);
        }
        else if (initObj.type == "MoveItemDownEvent") {
            event = new MoveItemDownEvent(parent,initObj);
        }
        else if (initObj.type == "PlaceObjectEvent") {
            event = new PlaceObjectEvent(parent,initObj);
        }
        else if (initObj.type == "DisplaceObjectEvent") {
            event = new DisplaceObjectEvent(parent,initObj);
        }
        else if (initObj.type == "MoveItemEvent") {
            event = new MoveItemEvent(parent,initObj);
        }
        else if (initObj.type == "ResearchEvent") {
            event = new ResearchEvent(parent,initObj);
        }
        return event;
    };

})(node ? exports : window);

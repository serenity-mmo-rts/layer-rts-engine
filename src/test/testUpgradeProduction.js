var assert = require("assert");
var BuildUpgradeEvent = require("../game/events/BuildUpgradeEvent").BuildUpgradeEvent;

describe('UpgradeProduction', function() {

    var gameData;

    beforeEach(function() {
        gameData = require('../server/initGameData').gameData;
    });

    it('check if upgrade production can build one item', function() {

        var mapId = "cityMap02";
        var currentTime = 10;
        var event = new BuildUpgradeEvent(gameData);
        event.setParameters("targetSelectionItem", gameData.layers.get(mapId).mapData.mapObjects.get("furnitureFactory02"));
        event.startedTime = currentTime;
        event.mapId = mapId;

        // check if event is valid:
        var valid = event.isValid();
        assert.equal(valid, true);

        var layer = gameData.layers.get(mapId);
        layer.currentTime = currentTime;
        layer.eventScheduler.addEvent(event);

        // execute locally:
        event.executeOnClient();

        gameData.layers.get("cityMap02").timeScheduler.finishAllTillTime(10000);


    });

});
var assert = require("assert");
var BuildObjectEvent = require("../../game/events/BuildObjectEvent").BuildObjectEvent;
var State = require("../../game/AbstractBlock").State;
var MapObject = require("../../game/MapObject").MapObject;
var initGameData = require('../../server/initGameData');

describe('BuildObjectEvent', function() {

    var gameData;

    beforeEach(function() {
        gameData = initGameData.initGameData();
    });

    it('check if we can build a map object', function() {

        var mapId = "cityMap02";
        var currentTime = 10;
        var event = new BuildObjectEvent(gameData.layers.get(mapId).eventScheduler.events);

        var object = new MapObject(gameData.layers.get(mapId).mapData.mapObjects, {
            id: 'testObject',
            mapId: mapId,
            x: 200,
            y: 200,
            objTypeId: "plantation1",
            userId: "me",
            state: State.TEMP
        });
        event.setParameters(object);
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
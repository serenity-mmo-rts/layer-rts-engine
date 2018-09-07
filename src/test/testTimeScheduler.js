var assert = require("assert");
var initGameData = require('../server/initGameData');

describe('TimeScheduler', function() {

    var gameData;

    beforeEach(function() {
        gameData = initGameData.initGameData();
    });

    it('check if a single time callback is working', function() {

        gameData.layers.get("solarMap01").timeScheduler.addCallback(
            function (curDueTime,curId) {
                assert.equal(curDueTime, 3);
            }, 3);

        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(4);

    });


    it('time callbacks should execute in correct order', function() {

        var dueTimes = [5, 8, 1, Infinity, 2, 6];
        var expectedCallOrder = [2, 4, 0, 5, 1]; // these values are the array indices in the dueTimes array

        function addCallback(i,myDueTime){
            var myCallbackId;
            myCallbackId = gameData.layers.get("solarMap01").timeScheduler.addCallback(function (curDueTime,curId) {
                assert.equal(myDueTime, curDueTime);
                assert.equal(myCallbackId, curId);
                var expectedCall = expectedCallOrder.shift();
                assert.equal(expectedCall, i);
                return Infinity;
            }, myDueTime);
        }

        // first add all callbacks:
        for (var i=0; i<dueTimes.length; i++) {
            addCallback(i,dueTimes[i]);
        }

        // now finish them:
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 5);
        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(4);
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 3);
        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(10);
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 0);

    });



    it('test remove callback and changing dueTime', function() {
        var lastCalledCallback = 0;
        var cbId1 = gameData.layers.get("solarMap01").timeScheduler.addCallback(
            function (curDueTime,curId) {
                assert.equal(curDueTime, 7);
                lastCalledCallback = 1;
            }, 7);
        var cbId2 = gameData.layers.get("solarMap01").timeScheduler.addCallback(
            function (curDueTime,curId) {
                assert.equal(curDueTime, 3);
                lastCalledCallback = 2;
            }, 3);
        var cbId3 = gameData.layers.get("solarMap01").timeScheduler.addCallback(
            function (curDueTime,curId) {
                lastCalledCallback = 3;
                if (curDueTime<4) {
                    // in the first call we return a new dueTime
                    assert.equal(curDueTime, 1);
                    return 4; // new dueTime
                }
                else {
                    // in the second call we deactivate this callback
                    assert.equal(curDueTime, 4);
                    return Infinity;
                }
            }, 1);

        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 3);
        gameData.layers.get("solarMap01").timeScheduler.removeCallback(cbId2);
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 2);

        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(3);
        assert.equal(lastCalledCallback,3);

        // callback due time was updated, so we should still have 2 callbacks active:
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 2);

        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(5);
        assert.equal(lastCalledCallback,3);
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 1);

        gameData.layers.get("solarMap01").timeScheduler.finishAllTillTime(10);
        assert.equal(lastCalledCallback,1);
        assert.equal(gameData.layers.get("solarMap01").timeScheduler.getNumActiveCallbacks(), 0);
    });

});
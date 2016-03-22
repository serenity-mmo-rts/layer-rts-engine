var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
    var BuildUpgradeEvent = require('../events/BuildUpgradeEvent').BuildUpgradeEvent;
    var LevelUpgradeEvent = require('../events/LevelUpgradeEvent').LevelUpgradeEvent;
    var Item = require('./../Item').Item;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var UpgradeProduction = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.helperVar = 22;
        this._mapId = this.parent.mapId;
        this._timeCallbackId = null;
        this.startedTime = null;
        this.dueTime = null;

        this.gameData = null;
        this.mapObjectId = null;
        this.mapId = null;
        this.layer= null;
        this.mapObject = null;

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    UpgradeProduction.prototype = Object.create(AbstractBlock.prototype);
    var proto = UpgradeProduction.prototype;
    proto.constructor = UpgradeProduction;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            numSlots: 0,
            itemTypeIds: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {buildQueue: []},
            {isRunning: false}
        ];
    };

    proto.levelUpgrade = function (item) {
        var evt = new LevelUpgradeEvent(game);
        evt.setItem(item);
        uc.addEvent(evt);
    };

    proto.setPointers = function () {
        this.gameData = this.parent.gameData;
        this.mapObjectId = this.parent._id;
        this.mapId = this.parent.mapId;
        this.layer= this.parent.gameData.layers.get(this.parent.mapId);
        this.mapObject = this.layer.mapData.mapObjects.get(this.parent.objectId);
        this.buildQueue = [];
        for (var i = 0; i < this.buildQueue.length; i++) {
            this.buildQueue.push(this.gameData.layers.get(this.mapId).eventScheduler.events.get(this.buildQueue[i]));
        }
    };


    proto.addItemEventToQueue = function (evt) {
        this.buildQueue.push(evt);
    };

    proto.removeItemFromQueue = function (idx) {
        this.buildQueue.splice(idx, 1);
    };

    proto.checkQueue = function (startedTime) {
        if (this.buildQueue.length > 0 && this.isRunning==false) {
            this.isRunning = true;
            var evt = this.buildQueue[0];
            var buildTime = this.gameData.itemTypes.get(evt._itemTypeId)._buildTime[0];
            this.startedTime = startedTime;
            this.dueTime = startedTime + buildTime;
            var self = this;
            var callback = function(dueTime,callbackId) {
                self.layer.timeScheduler.removeCallback(callbackId);
                var item = new Item(self.gameData, {_id: evt._newItemId, _objectId: self.mapObjectId, _itemTypeId: evt._itemTypeId, _mapId: evt._mapId, _level: 1});
                console.log("item: "+evt._newItemId+" production completed");
                self.layer.mapData.addItem(item);
                item.setPointers();
                item._blocks.Feature.startExecution(dueTime);
                self.parent.setState(2);
                self.removeItemFromQueue(0);
                self.isRunning = false;
                self.checkQueue(dueTime);
                return Infinity;
            };
            this._timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
            console.log("I start building a " + evt._itemTypeId + " in map Object" +this.mapObjectId);
        }
    };


    proto.progress= function(){
        var totalTimeNeeded = this.dueTime -this.startedTime;
        var currentTime  = Date.now();
        var timeLeft =  this.dueTime-currentTime;
        var percent = (timeLeft/totalTimeNeeded)*100;
        return 100-percent
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UpgradeProduction.prototype.finalizeBlockClass('UpgradeProduction');
    exports.UpgradeProduction = UpgradeProduction

})(typeof exports === 'undefined' ? window : exports);
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
            {buildQueue: []}
        ];
    };

    proto.levelUpgrade = function (item) {

        var evt = new LevelUpgradeEvent(game);
        evt.setItem(item);
        uc.addEvent(evt);

    };

    proto.startUpgrade = function (itemId) {
        var tempId = "tempID" + Math.random();
        var item = new Item(game, {_id: tempId, _objectId: this.parent._id, _itemTypeId: itemId, _mapId: this._mapId});
        var evt = new BuildUpgradeEvent(game);
        evt.setItem(item);
        uc.addEvent(evt);

    };

    proto.setPointers = function () {
        var buildQueueIds = this.buildQueue;
        this.buildQueue = [];
        for (var i = 0; i < buildQueueIds.length; i++) {
            this.buildQueue.push(this.gameData.layers.get(this.mapId).eventScheduler.events.get(buildQueueIds[i]));
        }
    };


    proto.addItemEventToQueue = function (evt) {
        this.buildQueue.push(evt);
    };

    proto.removeItemFromQueue = function (idx) {
        this.buildQueue.splice(idx, 1);
    };


    proto.checkQueue = function (currentTime) {
        if (this.buildQueue.length > 0) {
            if (this.buildQueue[0]._state == eventStates.VALID) {
                this.buildQueue[0].start(currentTime);
            }
        }

    }


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UpgradeProduction.prototype.finalizeBlockClass('UpgradeProduction');
    exports.UpgradeProduction = UpgradeProduction

})(typeof exports === 'undefined' ? window : exports);
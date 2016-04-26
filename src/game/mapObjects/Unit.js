var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var itemStates = require('../item').itemStates;
    var MoveThroughLayerEvent = require('../events/MoveThroughLayerEvent').MoveThroughLayerEvent;
    var Item = require('./../Item').Item;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var Unit = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.helperVar = 22;
        this._mapId = this.parent.mapId;
        this.timeCallbackId = null;
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
    Unit.prototype = Object.create(AbstractBlock.prototype);
    var proto = Unit.prototype;
    proto.constructor = Unit;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            itemTypeId: null,
            deployTime: null
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {isMoving: false},
            {eventId: null}
        ];
    };

    proto.setPointers = function () {
        this.gameData = this.parent.gameData;
        this.mapObjectId = this.parent._id;
        this.mapId = this.parent.mapId;
        this.layer= this.parent.gameData.layers.get(this.parent.mapId);
    };

    proto.updateDueTime= function(evt) {
        var movingTime = this.getTravelTime();
        this.startedTime = evt._startedTime;
        // notify time scheduler:
        console.log("replace user due time: "+this.dueTime+" by new due time from server: "+this.startedTime + buildTime);
        this.dueTime = this.startedTime + movingTime;
        this.gameData.layers.get(this.mapId).timeScheduler.setDueTime(this.timeCallbackId, this.dueTime);
    };

    proto.moveObjectToUpperLayer = function (startedTime) {
            this.isMoving = true;
            var movingTime = this.getTravelTime();
            this.startedTime = startedTime;
            this.dueTime = startedTime + movingTime;
            // TODO render dashed line from map Object to edge, render icon on top of that position
            var self = this;
            var callback = function(dueTime,callbackId) {
                self.layer.timeScheduler.removeCallback(callbackId);
                console.log("map Object moved to Upper Layer");

                // TODO delete dashed line, delete render icon from current Layer
                var subItemId = this.parent.getSubItem();
                var item = this.gameData.layers.get(this.mapId).mapData.items.get(subItemId);
                this.gameData.layers.get(this.mapId).mapData.removeObject(this.parent);
                this.gameData.layers.get(this.mapId).mapData.removeItem(item);
                self.isMoving = false;
                return Infinity;
            };
            this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
            console.log("Map Object" + this.parent._id+ "started moving");
    };

    proto.getTravelTime = function () {
        // TODO calculate travel time base on distance to edge
        return 40000;
    };


    proto.travelProgress= function(){
        var totalTimeNeeded = this.dueTime -this.startedTime;
        var currentTime  = Date.now();
        var timeLeft =  this.dueTime-currentTime;
        var percent = (timeLeft/totalTimeNeeded)*100;
        return 100-percent
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Unit.prototype.finalizeBlockClass('Unit');
    exports.Unit = Unit

})(typeof exports === 'undefined' ? window : exports);

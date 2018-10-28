var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var State = require('../AbstractBlock').State;
    var Item = require('./../Item').Item;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Unit = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.timeCallbackId = null;
        this.dueTime = null;
        this.item = null;
        this.layer = null;
        this.travelTime= null;
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
            deployTime:0
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {startedTime: null}
        ];
    };

    proto.setPointers  = function(){
        this.layer= this.getMap();
        this.item =  this.layer.mapData.items.get(this.parent.subItemId());
        if (this.parent.state()==State.BLOCKED && this.parent.activeOnLayer){
            this.unlockObject(this.item.blocks.Movable.startedTime());
        }
    };

    proto.removePointers  = function(){

    };

    proto.unlockObject = function (startedTime) {
        this.startedTime(startedTime);
        this.travelTime = this.item.blocks.Movable.movingDownTime;
        this.dueTime = this.startedTime + this.travelTime;
        var self = this;
        var callback = function(dueTime,callbackId) {
            // remmove started time and build queueid from moveThrough layer event
            self.item.blocks.Movable.startedTime(0);
            self.layer.timeScheduler.removeCallback(callbackId);
            console.log("Unit: "+self.parent._id()+" ready in Lower Layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);

    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Unit.prototype.finalizeBlockClass('Unit');
    exports.Unit = Unit

})(typeof exports === 'undefined' ? window : exports);

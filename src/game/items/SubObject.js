var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var State = require('../AbstractBlock').State;
    var ActivateFeatureEvent = require('../events/ActivateFeatureEvent').ActivateFeatureEvent;
    var TimeScheduler = require('../layer/TimeScheduler').TimeScheduler;
}

(function (exports) {

    /**
     * This is a constructor to create a new Feature Block.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var SubObject = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.mapObject = null;
        this.timeCallbackId = null;
        this.deployTime= null;
        this.travelTime= null;
    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    SubObject.prototype = Object.create(AbstractBlock.prototype);
    var proto = SubObject.prototype;
    proto.constructor = SubObject;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
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
        this.mapObject =  this.layer.mapData.mapObjects.get(this.parent.subObjectId());
        if (this.parent.state()==State.BLOCKED && this.parent.activeOnLayer){
            this.unlockItem(this.mapObject.blocks.UpgradeProduction.startedTime());
        }
    };

    proto.removePointers  = function(){

    };

    proto.unlockItem = function (startedTime) {
        this.startedTime(startedTime);
        this.deployTime = this.mapObject.blocks.Unit.deployTime;
        this.travelTime = this.parent.blocks.Movable.movingUpTime;
        this.dueTime = this.startedTime() + this.deployTime + this.travelTime;
        var self = this;
        var callback = function(dueTime,callbackId) {
            // remmove started time and build queueid from moveThrough layer event
            self.mapObject.blocks.UpgradeProduction.startedTime(0);
            self.mapObject.blocks.UpgradeProduction.buildQueueIds([]);
            self.layer.timeScheduler.removeCallback(callbackId);
            self.parent.setState(State.NORMAL);
            console.log("Unit: "+self.parent._id()+" ready in Upper Layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
        console.log("Unit" +this.parent._id() + "blocks space on upper layer");

    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SubObject.prototype.finalizeBlockClass('SubObject');
    exports.SubObject = SubObject;

})(typeof exports === 'undefined' ? window : exports);

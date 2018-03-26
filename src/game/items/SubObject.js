var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var State = require('./AbstractBlock').State;
    var ActivateFeatureEvent = require('../events/ActivateFeatureEvent').ActivateFeatureEvent;
    var TimeScheduler = require('../layer/TimeScheduler').TimeScheduler;
}

(function (exports) {

    /**
     * This is a constructor to create a new Feature Block.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var SubObject = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this._mapObject = null;
        this._timeCallbackId = null;

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
            {startedTime: null},
            {dueTime: null}
        ];
    };

    proto.setPointers  = function(){
        this.layer= this.getMap();
        this.mapObject = this.parent._mapObj;
        if (this.parent.state()==State.BLOCKED){
            this.addMovementProps();
            var date = new Date();
            this.unlockItem(date);
        }
    };

    proto.removePointers  = function(){

    };

    proto.addMovementProps = function () {
       this.deployTime = this.gameData.objectTypes.get(this.mapObject.objTypeId())._blocks.Unit.deployTime;
       this.travelTime = this.parent._blocks.Movable.movingUpTime;
    };

    proto.unlockItem = function (startedTime) {
        this.startedTime(startedTime);
        this.dueTime(this.startedTime + this.deployTime + this.travelTime);
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            self.parent.setState(State.NORMAL);
            console.log("Unit: "+self.parent._id+" ready in Upper Layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
        console.log("Unit" +this.parent._id + "blocks space on upper layer");

    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SubObject.prototype.finalizeBlockClass('SubObject');
    exports.SubObject = SubObject;

})(typeof exports === 'undefined' ? window : exports);

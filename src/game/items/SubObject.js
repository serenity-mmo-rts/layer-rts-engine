var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var itemStates =require('../Item').itemStates;
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
        this.startedTime = null;
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
        ];
    };

    proto.setPointers  = function(){
        this._itemId = this.parent._id;
        this._layer= this.parent.gameData.layers.get(this.parent._mapId);
        this._mapObject = this._layer.mapData.mapObjects.get(this.parent._objectId);
    };

    proto.removePointers  = function(){

    };

    proto.addMovementProps = function (mapObj) {
       this.deployTime = this.gameData.objectTypes.get(mapObj.objTypeId).Unit.deployTime;
       this.travelTime = mapObj._blocks.Unit.getTravelTime();
    };

    proto.lockItem = function (startedTime) {
        this.startedTime = startedTime;
        this.dueTime = this.startedTime + this.deployTime + this.travelTime;
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            self.parent.state = itemStates.FINISHED;
            self.parent.notifyStateChange();
            console.log("Unit: "+self.parent._id+" ready in Upper Layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
        console.log("Unit" +this.parent._id + "blocks space on upper layer");

    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SubObject.prototype.finalizeBlockClass('SubObject');
    exports.SubObject = SubObject;

})(typeof exports === 'undefined' ? window : exports);

var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    //var MoveItemEvent = require('../events/MoveItemEvent').MoveItemEvent;
    var TimeScheduler = require('../layer/TimeScheduler').TimeScheduler;
}

(function (exports) {

    /**
     * This is a constructor to create a new Feature Block.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var Movable = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this._mapObject = null;
        this._timeCallbackId = null;
        this.startedTime = null;
        this.dueTime = null;
        this.distance = null;
        this.travelingTime = null;
    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Movable.prototype = Object.create(AbstractBlock.prototype);
    var proto = Movable.prototype;
    proto.constructor = Movable;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            maxRange: 0,
            movementSpeed: 0
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
        this._layer= this.parent.gameData.layers.get(this.parent.mapId());
        this._mapObject = this.parent._mapObj;
    };

    proto.removePointers  = function(){

    };

    proto.updateDueTime= function(evt) {
        this.startedTime = evt._startedTime;
        // notify time scheduler:
        console.log("replace user due time: "+this.dueTime+" by new due time from server: "+this.startedTime + this.travelTime);
        // update Due Time
        this.dueTime = this.startedTime + this.travelTime;
        this.gameData.layers.get(this.mapId).timeScheduler.setDueTime(this._timeCallbackId, this.dueTime);
    };


    proto.moveItem  = function(startedTime,origin,target){

        // calcualte distance between origin and target, from there calculate due Time
        this.distance = Math.sqrt(Math.pow(target.x() - origin.x(),2)+ Math.pow(target.y() - origin.y(),2));
        this.travelTime= distance/this.movementSpeed;
        this.startedTime = startedTime;
        this.dueTime = startedTime + this.travelTime;
        var self = this;
        // remove Item from Object, remove feature and from object Context menu
        this.origin.removeItem(this._itemId);
        this.parent.removePointers();

        // create dashed line between origin and target
        // render  moving icon on that line,

        // in call back add item to other  Obejct context menu

            var callback = function(dueTime,callbackId) {
                self.layer.timeScheduler.removeCallback(callbackId);
                this.parent._objectId(target);
                this.parent.setPointers();
                console.log("item: "+evt._itemId+" production completed");
                return Infinity;
            };
            this._timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
            console.log("I start moving  a " + parent.itemTypeId + " from " +origin._id + " to " +target._id);

    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Movable.prototype.finalizeBlockClass('Movable');
    exports.Movable = Movable;

})(typeof exports === 'undefined' ? window : exports);

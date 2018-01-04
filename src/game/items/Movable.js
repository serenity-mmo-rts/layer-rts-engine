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
        this.timeCallbackId = null;
        this.distance = null;
        this.travelTime = null;

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
            {targetId: null},
            {originId: null},
            {isMoving: false},
            {startedTime: null},
            {dueTime: null}


        ];
    };

    proto.setPointers  = function(){
        this.mapObject = this.parent._mapObj;
        this.gameData= this.getGameData();
        this.layer = this.gameData.layers.get(this.parent.mapId());
    };

    proto.removePointers  = function(){

    };


    proto.getCurrentPositionOfItem =  function(currTime) {

        var neededTime = this.dueTime()-this.startedTime();
        var passedSinceStart = currTime -this.startedTime();
        var percentMoved = (passedSinceStart /neededTime);

        var origin = this.layer.mapData.mapObjects.get(this.originId());
        var target = this.layer.mapData.mapObjects.get(this.targetId());

        var offsetX =  target.x()-origin.x();
        var offsetY =  target.y()-origin.y();

        var position ={
            x : origin.x()+(percentMoved*offsetX),
            y : origin.y()+(percentMoved*offsetY)
        };


        return position;
    };


    proto.moveObjectUp  = function(startedTime){

        this.isMovingUp = true;
        var movingTime = 5000;
        this.startedTime(startedTime);
        this.dueTime(startedTime + movingTime);
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            self.isMovingUp = false;
            console.log("map Object moved to Upper Layer");
            var object = self.layer.mapData.mapObjects.get(self.parent._objectId());
            self.layer.mapData.removeObject(object);
            self.layer.mapData.removeItem(self.parent);
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
        console.log("Map Object" + this.parent._id()+ "started moving");
    };


    proto.moveItem  = function(startedTime,origin,target){

        // calcualte distance between origin and target, from there calculate due Time
        this.targetId(target._id());
        this.originId(origin._id());
        this.distance = Math.sqrt(Math.pow(target.x() - origin.x(),2)+ Math.pow(target.y() - origin.y(),2));
        this.travelTime= this.distance/this.movementSpeed;
        this.startedTime(startedTime);
        this.dueTime(this.startedTime() + this.travelTime);


    // in call back add item to other  Obejct context menu
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.isMoving(false);
            self.layer.timeScheduler.removeCallback(callbackId);
            self.parent.addToParentObject(self.targetId(),dueTime);
            console.log("moving of item :'"+self.parent.itemTypeId()+"' completed");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
        console.log("I start moving  a " + this.parent.itemTypeId() + " from " + this.originId() + " to " +this.targetId());

        var centerX= (origin.x()+ target.x())/2;
        var centerY= (origin.y()+ target.y())/2;
        var width = target.y() -origin.y();
        var height =  target.y() -origin.y();
        this.parent.applyItemToMap(centerX,centerY,width,height,0);
        this.isMoving(true);
    };

    proto.updateDueTime= function(evt) {
        this.startedTime(evt._startedTime);
        // notify time scheduler:
        console.log("replace user due time: "+this.dueTime()+" by new due time from server: "+this.startedTime() + this.travelTime);
        // update Due Time
        this.dueTime(this.startedTime() + this.travelTime);
        this.gameData.layers.get(this.parent.mapId()).timeScheduler.setDueTime(this.timeCallbackId, this.dueTime());
        // remove Item and feature from Object, remove item object Context menu
        this.parent.removeFromParentObject(this.dueTime());
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Movable.prototype.finalizeBlockClass('Movable');
    exports.Movable = Movable;

})(typeof exports === 'undefined' ? window : exports);

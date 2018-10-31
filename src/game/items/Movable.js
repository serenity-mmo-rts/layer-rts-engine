var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var State = require('../AbstractBlock').State;
    //var MoveItemEvent = require('../events/MoveItemEvent').MoveItemEvent;
    var TimeScheduler = require('../layer/TimeScheduler').TimeScheduler;
    ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {

    /**
     * This is a constructor to create a new Feature Block.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Movable = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.timeCallbackId = null;
        this.distance = null;
        this.travelTime = null;

        this.isMovingUp = ko.observable(false);

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
            movementSpeed: 0,
            movingUpTime: 0,
            movingDownTime: 0
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
        this.mapObject = this.parent.mapObj;
        this.gameData= this.getGameData();
        this.layer = this.getMap();
    };

    proto.removePointers  = function(){

    };

    proto.resetHelpers = function () {
        var self = this;
        if (this.isMoving()){
            if (this.dueTime()){
                if (this.timeCallbackId){
                    this.layer.timeScheduler.setDueTime(this.timeCallbackId,this.dueTime())
                }
                else{
                    this.timeCallbackId = this.layer.timeScheduler.addCallback(function(dueTime,callbackId){
                            self.finishMovingThoughLayer(dueTime,callbackId);
                        }
                        ,this.dueTime());
                }
            }
            else{
                if (this.timeCallbackId) {
                    this.layer.timeScheduler.removeCallback(this.timeCallbackId);
                    this.timeCallbackId = null;
                }
            }
        }
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


    proto.placeToParking  = function(startedTime){

        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            self.isMovingUp(false);
            var object = self.layer.mapData.mapObjects.get(self.parent.subObjectId());
            object.needsTobePlaced(true);
            console.log("map Object now in parking position");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,startedTime+this.movingUpTime);
        this.isMovingUp(true);
    };


    proto.moveObjectUp  = function(startedTime){

        //this.targetId(this.parent.inactiveMapId());
        //this.originId(this.parent.mapId());
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            self.isMovingUp(false);
            var object = self.layer.mapData.mapObjects.get(self.parent.subObjectId());
            self.layer.mapData.removeObjectAndUnembedd(object);
            self.layer.mapData.removeItemAndUnembedd(self.parent);
            console.log("map Object and Item deleted from lower layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,startedTime+this.movingUpTime);
        this.isMovingUp(true);
    };

    proto.moveObjectDown  = function(startedTime){

        //this.targetId(this.parent.inactiveMapId());
        //this.originId(this.parent.mapId());
        this.startedTime(startedTime);
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            var object = self.layer.mapData.mapObjects.get(self.parent.subObjectId());
            self.layer.mapData.removeObjectAndUnembedd(object);
            self.layer.mapData.removeItemAndUnembedd(self.parent);
            console.log("Item and object removed from upper layer");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.startedTime+this.movingDownTime);
        console.log("Item started to move down. Transferring into map Object");
    };

    proto.moveItemWithinLayer  = function(startedTime,origin,target){

        // calcualte distance between origin and target, from there calculate due Time
        this.targetId(target._id());
        this.originId(origin._id());
        this.distance = Math.sqrt(Math.pow(target.x() - origin.x(),2)+ Math.pow(target.y() - origin.y(),2));
        this.travelTime= this.distance/this.movementSpeed;
        this.startedTime(startedTime);
        this.dueTime(this.startedTime() + this.travelTime);
        var self = this;
        this.timeCallbackId = this.layer.timeScheduler.addCallback(function(dueTime,callbackId){
                self.finishMovingThoughLayer(dueTime,callbackId);
            }
            ,this.dueTime());
        var centerX= (origin.x()+ target.x())/2;
        var centerY= (origin.y()+ target.y())/2;
        var width = target.y() -origin.y();
        var height =  target.y() -origin.y();
        this.parent.applyItemToMap(centerX,centerY,width,height,0);
        this.parent.removeFromParentObject(this.dueTime());
        this.isMoving(true);
        console.log("I start moving  a " + this.parent.itemTypeId() + " from " + this.originId() + " to " +this.targetId());
    };

    proto.finishMovingThoughLayer = function(dueTime,callbackId){
        // in call back add item to other  Obejct context menu
        this.isMoving(false);
        this.layer.timeScheduler.removeCallback(callbackId);
        this.timeCallbackId = null;
        this.parent.addToParentObject(this.targetId(),dueTime);
        console.log("moving of item :'"+this.parent.itemTypeId()+"' completed");
        return Infinity;
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Movable.prototype.finalizeBlockClass('Movable');
    exports.Movable = Movable;

})(typeof exports === 'undefined' ? window : exports);

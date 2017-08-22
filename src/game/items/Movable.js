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
        this.itemId = this.parent._id();
        this.layer = this.parent.gameData.layers.get(this.parent.mapId());
        this.mapObject = this.parent._mapObj;
        this.gameData= this.parent.gameData;
        this.mapId= this.parent.mapId();
    };

    proto.removePointers  = function(){

    };



    proto.renderDashedLine =  function(x1, y1, x2, y2, dashLen) {
        this.moveTo(x1, y1);

        var dX = x2 - x1;
        var dY = y2 - y1;
        var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
        var dashX = dX / dashes;
        var dashY = dY / dashes;

        var q = 0;
        while (q++ < dashes) {
            x1 += dashX;
            y1 += dashY;
            this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
        }
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
    };

    proto.moveItem  = function(startedTime,origin,target){

        // calcualte distance between origin and target, from there calculate due Time
        this.distance = Math.sqrt(Math.pow(target.x() - origin.x(),2)+ Math.pow(target.y() - origin.y(),2));
        this.travelTime= this.distance/this.movementSpeed;
        this.startedTime = startedTime;
        this.dueTime = startedTime + this.travelTime;
        var self = this;
        // remove Item from Object, remove feature and from object Context menu
        origin.removeItem(this.itemId);
        this.parent.removePointers();


        // render  moving icon on that line,
        if (!node){
            var movingItem = new createjs.Sprite(uc.spritesheets[this.parent._itemType._iconSpritesheetId]);
            movingItem.gotoAndStop(this.parent._itemType._iconSpriteFrame);
            movingItem.x = uc.layerView.mapContainer.map.gameCoord2RenderX(origin.x(), origin.y());
            movingItem.y = uc.layerView.mapContainer.map.gameCoord2RenderY(origin.x(), origin.y());
            movingItem.originId = origin._id();
            movingItem.targetId = target._id();
            movingItem.name = this.parent._id();
            movingItem.id = this.parent._id();
            uc.layerView.mapContainer.map.mov_container.addChild(movingItem);
        }

        // create dashed line between origin and target
       // var shape = new createjs.Shape();
       // shape.graphics.setStrokeStyle(2).beginStroke("#ff0000").moveTo(origin.x(),origin.y()).lineTo(target.x(),target.y());
       // shape.graphics.dashedLineTo(100,100,200,300, 4);
      //  stage.addChild(shape);


    // in call back add item to other  Obejct context menu
        var self = this;
        var callback = function(dueTime,callbackId) {
            self.layer.timeScheduler.removeCallback(callbackId);
            var toRemoveChild = uc.layerView.mapContainer.map.mov_container.getChildByName(self.parent._id());
            uc.layerView.mapContainer.map.mov_container.removeChild(toRemoveChild);
            self.parent._objectId(target._id());
            self.parent.setPointers();
            if (self.parent._blocks.hasOwnProperty("Feature")){
                self.parent._blocks.Feature.startExecution(dueTime);
            }
            console.log("moving of item :''"+self.parent.itemTypeId()+"'' completed");
            return Infinity;
        };
        this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
        console.log("I start moving  a " + this.parent.itemTypeId() + " from " +origin._id() + " to " +target._id());

    };

    proto.updateDueTime= function(evt) {
        this.startedTime = evt._startedTime;
        // notify time scheduler:
        console.log("replace user due time: "+this.dueTime+" by new due time from server: "+this.startedTime + this.travelTime);
        // update Due Time
        this.dueTime = this.startedTime + this.travelTime;
        this.gameData.layers.get(this.mapId).timeScheduler.setDueTime(this.timeCallbackId, this.dueTime);
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Movable.prototype.finalizeBlockClass('Movable');
    exports.Movable = Movable;

})(typeof exports === 'undefined' ? window : exports);

var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
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




    proto.activatePerClick = function(target,range){

        this._processedStack.targetType = target;
        if (this._processedStack.isActivated){
            this._processedStack.canBeActivated = false;
        }
        else{
            this._processedStack.canBeActivated = true;
        }


        if (target == "self") {
            return [null, this._processedStack.isActivated];
        }

        else if (target == "object"){

            if (this._processedStack.target ==null){
                return [null, false];
            }
            else{
                return [this._processedStack.target, true];
            }
        }
        else if (target == "item"){


        }
        else if (target == "coordinate"){


        }

    };


    proto.wait = function(waitingTime){

        if (this._timeCallbackId !=null){ // re-enter with call back
            this._timeCallbackId = null;
            this._processedStack.lastActivationTime = this._processedStack.dueTime;
            this._processedStack.dueTime = null;
            return true;
        }
        else{ // enter first time, calculate dueTime and create callback

            this._processedStack.dueTime =  this._processedStack.lastActivationTime+waitingTime;

            var self = this;
            var callback = function(dueTime,callbackId){
                //TO DO check whether event is really due
                self._layer.timeScheduler.removeCallback(callbackId);
                self.checkStackExecution(false,self._processedStack.lastActivationTime);
                return Infinity
            };
            this._timeCallbackId = this._layer.timeScheduler.addCallback(callback,this._processedStack.dueTime);
            return false;
        }
    };





    proto.checkRange = function(currentTarget){
        if (this._properties._range > 0){
            if(this.validCoordinate(currentTarget)){
                var featureTargets = this._layer.mapData.getObjectsInRange(currentTarget,this._properties._range);
                return featureTargets;
            }
        }
    };


    proto.validCoordinate = function (currentTarget){
        // check whether user has mouse on map (current Target = coordinate)
    };

    proto.validMapObject = function (currentTarget){
        // check whether user has mouse over map Object (current Target = map Obj)
    };

    proto.validItem = function (currentTarget){
        // check whether use has mouse over Item (current Target = Item)
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SubObject.prototype.finalizeBlockClass('SubObject');
    exports.SubObject = SubObject;

})(typeof exports === 'undefined' ? window : exports);

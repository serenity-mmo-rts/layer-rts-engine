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
    var Feature = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this._mapObject = null;
        this._timeCallbackId = null;
    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Feature.prototype = Object.create(AbstractBlock.prototype);
    var proto = Feature.prototype;
    proto.constructor = Feature;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            _stack: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {_executeIndex:0},
            {_processedStack:{
                effects: [],
                isActivated: false,
                canBeActivated: false,
                lastActivationTime:null,
                dueTime:null,
                parentItem:null,
                isHidden: false,
                targetType: null,
                target: null
                }
            }
        ];
    };

    proto.setPointers  = function(){
        this._itemId = this.parent._id();
        console.log("parent Id=" + this.parent._id() );
        this._layer= this.parent.gameData.layers.get(this.parent.mapId());
        this._mapObject = this._layer.mapData.mapObjects.get(this.parent._objectId());
        this.addItemToFeatureManagers();
    };

    proto.removePointers  = function(){
        this.removeItemFromFeatureManagers();
    };

    /**
     * activates Feature per user click
     */
    proto.activate = function(startedTime,target) {
        if (arguments[1]!=null){
            this._processedStack().target(target);
        }
        this._processedStack().lastActivationTime(startedTime);
        this._processedStack().isActivated(true);
        this.checkStackExecution();
    };

    proto.startExecution = function(startedTime) {
        this._processedStack().lastActivationTime(startedTime);
        this.removeItemFromFeatureManagers();
        this.setInitStateVars();
        this.checkStackExecution();
    };


    proto.getCurrentOp = function() {
        return this._stack[this._executeIndex()];
    };

    /**
     *
     * @param active
     * @param startedTime
     */
    proto.checkStackExecution = function() {

        var formerOperation = null;
        var out = null;
        var process = true;

        // execute script iterative
        while (process == true && this._executeIndex() < this._stack.length) {
            var currentOperation = this.getCurrentOp();
            out  = this.processStack(formerOperation, currentOperation);
            formerOperation = out[0];
            process = out[1];
            this._executeIndex( this._executeIndex()+1 );
        }

        //  subtract 1 to get correct execution index
        this._executeIndex( this._executeIndex()-1 );

        // notify change
        this.notifyStateChange();
        this._mapObject.notifyChange();
    };

    /**
     *
     * @param formerOperation
     * @param currentOperation
     * @param flag
     * @returns {*[]}
     */
    proto.processStack = function(formerOperation,currentOperation){
        var name = Object.keys(currentOperation)[0];
        var process = true;
        var out = null;

        switch(name){
            case "getParentObj":
                out = this.getParentObj(formerOperation);
                break;
            case "getParentItem":
                out =  this.getParentItem(formerOperation);
                break;
            case "getObjInRange":
                out = this.getObjInRange(formerOperation,currentOperation[name]); //range
                break;
            case "getItemsInObject":
                out = this.getItemsInObject(formerOperation,currentOperation[1]);
                break;
            case "addToProp":
                this.addToProp(formerOperation,currentOperation[name].vars,currentOperation[name].blocks,currentOperation[name].operator,currentOperation[name].values); // property,change, mode (1= baseline)
                break;
            case "clear":
                this.clear(currentOperation.clear.effectIdx);
                break;
            case "wait":
                process = this.wait(currentOperation.wait.waitingTime);
                break;
            case "activatePerClick":
                var back = this.activatePerClick(currentOperation.activatePerClick.targetType,currentOperation.activatePerClick.range);
                out = back[0];
                process = back[1];
                break;
            case "goToExecutionIndex":
                process = this.goToExecutionIndex(currentOperation.goToExecutionIndex.index);
                break;
            case "deactivate":
                process = this.deactivate();
                break;
        }
        return [out, process]
    };


    proto.activatePerClick = function(target,range){

        this._processedStack().targetType(target);

        if (this._processedStack().isActivated()){
            this._processedStack().canBeActivated(false);
        }
        else{
            this._processedStack().canBeActivated(true);
        }


        if (target == "self") {
            return [null, this._processedStack().isActivated()];
        }

        else if (target == "object"){

            if (this._processedStack().target()){
                return [this._processedStack().target(), true];
            }
            else{
                return [null, false];
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
            this._processedStack().lastActivationTime(this._processedStack().dueTime());
            this._processedStack().dueTime(null);
            return true;
        }
        else{ // enter first time, calculate dueTime and create callback

            this._processedStack().dueTime(this._processedStack().lastActivationTime()+waitingTime);

            var self = this;
            var callback = function(dueTime,callbackId){
                //TO DO check whether event is really due
                self._layer.timeScheduler.removeCallback(callbackId);
                self.checkStackExecution(false,self._processedStack().lastActivationTime());
                return Infinity
            };
            this._timeCallbackId = this._layer.timeScheduler.addCallback(callback,this._processedStack().dueTime());
            return false;
        }
    };

    proto.clear = function(effectIdx){

        var objects = this._processedStack().effects()[effectIdx].currentTargetObjectIds;
        var items = this._processedStack().effects()[effectIdx].currentTargetItemIds;

        // delete feature from all objects and items that used it
        for (var i = 0; i<objects.length; i++) {
            var object = this._layer.mapData.mapObjects.get(objects[i]);
             object._blocks.FeatureManager.removeItemId(this._itemId,effectIdx);
        }

        for (var i = 0; i<items.length; i++) {
            var item = this._layer.mapData.items.get(items[i]);
            item._blocks.FeatureManager.removeItemId(this._itemId,effectIdx);
        }

        this._processedStack().effects().splice(effectIdx,1);

        return null;
    };

    proto.deactivate = function(){
        this._processedStack().isActivated(false);
        return true;
    };

    proto.goToExecutionIndex = function(idx){
        this.setExecutionIdx(idx-1);
        return true;
    };

    proto.setExecutionIdx = function(value){
        this._executeIndex(value);
    };

    proto.getParentItem = function(){
        this._processedStack().parentItem(this.parent);
        return this.parent;
    };

    proto.getParentObj = function(){

        return this.parent._mapObj;

    };

    proto.getObjInRange = function(MapObjOrCoordinate,range){
        if (MapObjOrCoordinate == null || MapObjOrCoordinate instanceof Boolean){
            var currentLocation= [this.parent._mapObj.x(),this.parent._mapObj.y()];
        }
        else {
            var currentLocation = [MapObjOrCoordinate.x(), MapObjOrCoordinate.y()];
        }
        return this._layer.mapData.getObjectsInRange(currentLocation,range,1);
    };

    proto.addToProp = function(itemsOrObjects,variable,block,operator,change){

        var changeObj = {
            variables:variable,
            blocks:block,
            operators:operator,
            changes:change,
            currentTargetObjectIds: [],
            currentTargetItemIds: []
        };
        this._processedStack().effects().push(changeObj);

        if (itemsOrObjects instanceof Array) {
            for (var i = 0; i < itemsOrObjects.length; i++) {
                var itemOrObject = itemsOrObjects[i];
                this.addTargets(itemOrObject, variable, block,changeObj);
            }
        }

        else{
            this.addTargets(itemsOrObjects, variable, block,changeObj);
        }
    };

    proto.addTargets= function(itemOrObject, variable, block,changeObj){
        var success = this.checkValidity(itemOrObject, variable, block);
        if (success) {
            if (itemOrObject.hasOwnProperty("objTypeId")){
                this.addObjTargets(itemOrObject,changeObj);
            }
            else{
                this.addItemTargets(itemOrObject,changeObj);
            }
        }
    };

    proto.checkValidity = function(itemOrObj,variables,blocks){
        var valid = true;
        // check if block and variable exist
        for (var i = 0; i<blocks.length; i++){
            if (itemOrObj._blocks.hasOwnProperty(blocks[i])) {
                if (!itemOrObj._blocks[blocks[i]]._typeCache.hasOwnProperty(variables[i])) {
                    valid = false;
                }
            }
            else{
                valid = false;
            }
        }
        return valid
    };

    proto.addObjTargets= function(object,changeObj){
        var targetId = object._id();
        var effectCounter = this._processedStack().effects().length-1;
        if (this._processedStack().effects()[effectCounter].currentTargetObjectIds.indexOf(targetId)<0){
            this._processedStack().effects()[effectCounter].currentTargetObjectIds.push(targetId);
            object._blocks.FeatureManager.addItemId(this._itemId,effectCounter);
        }
        object._blocks.FeatureManager.setState(true);
    };

    proto.addItemTargets= function(item,changeObj){
        var targetId = item._id();
        var effectCounter = this._processedStack().effects().length-1;
        if (this._processedStack().effects()[effectCounter].currentTargetItemIds.indexOf(targetId)<0) {
            this._processedStack().effects()[effectCounter].currentTargetItemIds.push(targetId);
            item._blocks.FeatureManager.addItemId(this._itemId,effectCounter);
        }
        item._blocks.FeatureManager.setState(true);
    };

    proto.getItemsInObject = function(object,itemTypeIds){
        if (itemTypeIds  == null){
            this._processedStack()[this._executeIndex()](object.getItems());
        }
        else{

        }
    };

    proto.removeItemFromFeatureManagers= function() {

        for (var i = 0; i<this._processedStack().effects().length;i++){
            var objectIds= this._processedStack().effects()[i].currentTargetObjectIds;
            var itemIds= this._processedStack().effects()[i].currentTargetItemIds;

                for (var k = 0; k<objectIds.length;k++){
                    var object=  this._layer.mapData.mapObjects.get(objectIds[k]);
                    object._blocks.FeatureManager.removeItem(this._itemId);
                }

                for (var k = 0; k<itemIds.length;k++){
                    var item =  this._layer.mapData.items.get(itemIds[k]);
                    item._blocks.FeatureManager.removeItem(this._itemId);
                }

        }
    };


    proto.addItemToFeatureManagers= function() {

        for (var i = 0; i<this._processedStack().effects().length;i++){
            var objectIds= this._processedStack().effects()[i].currentTargetObjectIds;
            var itemIds= this._processedStack().effects()[i].currentTargetItemIds;

            for (var k = 0; k<objectIds.length;k++){
                var object=  this._layer.mapData.mapObjects.get(objectIds[k]);
                object._blocks.FeatureManager.addItemId(this._itemId,k);
            }

            for (var k = 0; k<itemIds.length;k++){
                var item =  this._layer.mapData.items.get(itemIds[k]);
                item._blocks.FeatureManager.addItemId(this._itemId,k);
            }

        }
    };




    proto.checkSelect = function(currentTarget){
        if (this._properties._canSelect){
            if(this.validMapObject(currentTarget)){
                var featureTargets = this._layer.mapData.getMapObject(currentTarget);
            }
        }
        else {
            var coords = [this._layer.mapData.mapObjects.get(this._itemId._objectId).x,this._layer.mapData.mapObjects.get(this._itemId._objectId).y];
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
    Feature.prototype.finalizeBlockClass('Feature');
    exports.Feature = Feature;

})(typeof exports === 'undefined' ? window : exports);

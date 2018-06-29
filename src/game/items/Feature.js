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
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Feature = function (parent, type){

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.mapObject = null;
        this.timeCallbackId = null;
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
            stack: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {executeIndex: 0},
            {effects: []},
            {isActivated: false},
            {canBeActivated: false},
            {lastActivationTime: null},
            {dueTime: null},
            {isHidden: false},
            {targetType: null},
            {target: null}
        ];
    };

    proto.setPointers  = function(){
        console.log("parent Id=" + this.parent.id() );
        this.layer= this.parent.gameData.layers.get(this.parent.mapId());
        this.mapObject = this.layer.mapData.mapObjects.get(this.parent.objectId());
        this.addItemToFeatureManagers();
    };

    proto.removePointers  = function(){
        this.removeItemFromFeatureManagers(startedTime);
    };

    /**
     * activates Feature per user click
     */
    proto.activate = function(startedTime,target) {
        if (arguments[1]!=null){
            this.target(target);
        }
        this.lastActivationTime(startedTime);
        this.isActivated(true);
        this.checkStackExecution();
    };

    proto.restartExecution = function(startedTime) {

        this.executeIndex(0);
        this.effects([]);
        this.isActivated(false);
        this.canBeActivated(false);
        this.lastActivationTime(null);
        this.dueTime(null);
        this.isHidden(false);
        this.targetType(null);
        this.target(null);


        this.lastActivationTime(startedTime);
        this.removeItemFromFeatureManagers(startedTime);
        this.checkStackExecution();
    };

    proto.continueExecution = function(executionIndex) {
        this.setExecutionIdx(executionIndex);
        this.checkStackExecution();
    };

    proto.resetHelpers = function () {
        var self = this;
        if (this.dueTime()){
            if (this.timeCallbackId){
                this.layer.timeScheduler.setDueTime(this.timeCallbackId,this.dueTime())
            }
            else{
                this.timeCallbackId = this.layer.timeScheduler.addCallback(function(dueTime,callbackId){
                        self.finishedWait(dueTime,callbackId);
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


    };




    proto.getCurrentOp = function() {
        return this.stack[this.executeIndex()];
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
        while (process == true && this.executeIndex() < this.stack.length) {
            var currentOperation = this.getCurrentOp();
            out  = this.processStack(formerOperation, currentOperation);
            formerOperation = out[0];
            process = out[1];
            this.executeIndex( this.executeIndex()+1 );
        }

        //  subtract 1 to get correct execution index
        this.executeIndex( this.executeIndex()-1 );

        // notify change
        this.notifyStateChange();
        this.mapObject.notifyChange();
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

        this.targetType(target);

        if (this.isActivated()){
            this.canBeActivated(false);
        }
        else{
            this.canBeActivated(true);
        }


        if (target == "self") {
            return [null, this.isActivated()];
        }

        else if (target == "object"){

            if (this.target()){
                return [this.target(), true];
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
        this.dueTime(this.lastActivationTime()+waitingTime);
        var self = this;
        if (this.timeCallbackId) {
            throw new Error("there was already a callback set!")
        }
        console.log("Feature.wait("+waitingTime+") is adding a callback with dueTime="+this.dueTime()+". Now is time: "+Date.now());
        this.timeCallbackId = this.layer.timeScheduler.addCallback(function(dueTime,callbackId){
                self.finishedWait(dueTime,callbackId);
            }
            ,this.dueTime());
        return false;
    };

    proto.finishedWait = function(dueTime,callbackId){
        console.log("Feature.finishedWait(dueTime="+dueTime+") is called. Now is time: "+Date.now());
        this.layer.timeScheduler.removeCallback(callbackId);
        this.timeCallbackId = null;
        this.dueTime(null);
        this.lastActivationTime(dueTime);
        this.continueExecution(this.executeIndex()+1);
        return Infinity
    };

    proto.clear = function(effectIdx){

        var objects = this.effects()[effectIdx].currentTargetObjectIds;
        var items = this.effects()[effectIdx].currentTargetItemIds;

        this.effects.splice(effectIdx,1);

        // delete feature from all objects and items that used it
        for (var i = 0; i<objects.length; i++) {
            var object = this.layer.mapData.mapObjects.get(objects[i]);
             object.blocks.FeatureManager.removeItemId(this.parent.id(),effectIdx);
        }

        for (var i = 0; i<items.length; i++) {
            var item = this.layer.mapData.items.get(items[i]);
            item.blocks.FeatureManager.removeItemId(this.parent.id(),effectIdx);
        }

        return null;
    };

    proto.removeItemFromFeatureManagers= function(timeStamp) {
        this.lastActivationTime(timeStamp);

        for (var i = 0; i<this.effects().length;i++){
            this.clear(i);
        }
    };

    proto.deactivate = function(){
        this.isActivated(false);
        return true;
    };

    proto.goToExecutionIndex = function(idx){
        this.setExecutionIdx(idx-1);
        return true;
    };

    proto.setExecutionIdx = function(value){
        this.executeIndex(value);
    };

    proto.getParentItem = function(){
        return this.parent;
    };

    proto.getParentObj = function(){

        return this.parent.mapObj;

    };

    proto.getObjInRange = function(MapObjOrCoordinate,range){
        if (MapObjOrCoordinate == null || MapObjOrCoordinate instanceof Boolean){
            var currentLocation= [this.parent.mapObj.x(),this.parent.mapObj.y()];
        }
        else {
            var currentLocation = [MapObjOrCoordinate.x(), MapObjOrCoordinate.y()];
        }
        return this.layer.mapData.getObjectsInRange(currentLocation,range,1);
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
        this.effects.push(changeObj);

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
            if (itemOrObj.blocks.hasOwnProperty(blocks[i])) {
                if (!itemOrObj.blocks[blocks[i]].typeCache.hasOwnProperty(variables[i])) {
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
        var targetId = object.id();
        var effectCounter = this.effects().length-1;
        if (this.effects()[effectCounter].currentTargetObjectIds.indexOf(targetId)<0){
            this.effects()[effectCounter].currentTargetObjectIds.push(targetId);
            object.blocks.FeatureManager.addItemId(this.parent.id(),effectCounter);
        }
      //  object.blocks.FeatureManager.setState(true);
    };

    proto.addItemTargets= function(item,changeObj){
        var targetId = item.id();
        var effectCounter = this.effects().length-1;
        if (this.effects()[effectCounter].currentTargetItemIds.indexOf(targetId)<0) {
            this.effects()[effectCounter].currentTargetItemIds.push(targetId);
            item.blocks.FeatureManager.addIthis.temId(this.parent.id(),effectCounter);
        }
     //   item.blocks.FeatureManager.setState(true);
    };

    proto.getItemsInObject = function(object,itemTypeIds){
        if (itemTypeIds  == null){
            this.processedStack()[this.executeIndex()](object.getItems());
        }
        else{

        }
    };




    proto.addItemToFeatureManagers= function() {

        for (var i = 0; i<this.effects().length;i++){
            var objectIds= this.effects()[i].currentTargetObjectIds;
            var itemIds= this.effects()[i].currentTargetItemIds;

            for (var k = 0; k<objectIds.length;k++){
                var object=  this.layer.mapData.mapObjects.get(objectIds[k]);
                object.blocks.FeatureManager.addItemId(this.parent.id(),k);
            }

            for (var k = 0; k<itemIds.length;k++){
                var item =  this.layer.mapData.items.get(itemIds[k]);
                item.blocks.FeatureManager.addItemId(this.parent.id(),k);
            }

        }
    };




    proto.checkSelect = function(currentTarget){
        if (this.properties.canSelect){
            if(this.validMapObject(currentTarget)){
                var featureTargets = this.layer.mapData.getMapObject(currentTarget);
            }
        }
        else {
            var coords = [this.layer.mapData.mapObjects.get(this.parent.objectId).x,this.layer.mapData.mapObjects.get(this.parent.objectId).y];
        }
    };

    proto.checkRange = function(currentTarget){
        if (this.properties.range > 0){
            if(this.validCoordinate(currentTarget)){
                var featureTargets = this.layer.mapData.getObjectsInRange(currentTarget,this.properties.range);
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

var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
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
            {_executeIndex:null},
            {_processedStack:[]}
        ];
    };

    /**
     * processes the feature Script stack
     */
    proto.checkStackExecution = function(active) {

        var process = true;
        this._executeIndex = this.getExecutionIdx();
        if (this._executeIndex==0){
            var formerOperation = null;
        }

        // execute script iterative
        while (process == true && this._executeIndex < this._stack.length) {
            var currentOperation = this._stack[this._executeIndex];
            if (this._executeIndex>0){
                formerOperation = this._processedStack[this._executeIndex-1];
            }
            process = this.processStack(formerOperation, currentOperation,active);
            this._executeIndex += 1;
        }

        //  subtract 1 to get correct execution index
            this._executeIndex -= 1;

        // notify change
        this.notifyStateChange();

    };

    proto.getExecutionIdx = function(){
        if (this._executeIndex==null){
            return 0;
        }
        else{
            return this._executeIndex
        }
    };

    proto.setExecutionIdx = function(value){
        this._executeIndex=value;
    };

    proto.removeItemFromFeatureManagers= function() {

        for (var i = 0; i<this._processedStack.length;i++){
            var stack = this._processedStack[i];
            if (stack.hasOwnProperty("currentTargetObjectIds")){
                for (var k = 0; k<stack.currentTargetObjectIds.length;k++){
                    var object=  this._layer.mapData.mapObjects.get(stack.currentTargetObjectIds[k]);
                    object._blocks.FeatureManager.removeItem(this._itemId);
                }

                for (var k = 0; k<stack.currentTargetItemIds.length;k++){
                    var object=  this._layer.mapData.mapObjects.get(stack.currentTargetItemIds[k]);
                    object._blocks.FeatureManager.removeItem(this._itemId);
                }
            }
        }
    };


    proto.restartExecution = function() {
        this.removeItemFromFeatureManagers();
        this._processedStack = [];
        this.setExecutionIdx(0);
        this.checkStackExecution(false);
    };

    /**
     *
     * @param formerOperation
     * @param currentOperation
     * @param active
     * @returns {*[]}
     */
    proto.processStack = function(formerOperation,currentOperation,active){


        var name = Object.keys(currentOperation)[0];
        var process = true;

        switch(name){

            case "getParentItem":
                this.getParentItem(formerOperation);
                break;
            case "getParentObj":
                this.getParentObj(formerOperation);
                break;
            case "getObjInRange":
                this.getObjInRange(formerOperation,currentOperation[name]); //range
                break;
            case "AddToProp":
                this.addToProp(formerOperation,currentOperation[name].vars,currentOperation[name].blocks,currentOperation[name].operator,currentOperation[name].values); // property,change, mode (1= baseline)
                break;
            case "activatePerClick":
                process = this.activatePerClick(active);
                break;
            case "getItemsInObject":
                this.getItemsInObject(formerOperation,currentOperation[1]);
                break;
            case "Wait":
                this.Wait(currentOperation[0]);
                break;
            case "clear":
                this.clear(currentOperation[0]);
                break;
        }

        return process

    };



    proto.Wait = function(waitingTime){
        // create timed Event
        tutu=1;
    };

    proto.clear = function(StackIdx){

        var objects = this._processedStack[StackIdx].currentTargetObjectIds;
        var items = this._processedStack[StackIdx].currentTargetItemIds;

        // delete feature from all objects and items that used it
        for (var i = 0; i<objects.length; i++) {
            objects[i]._blocks.FeatureManager.removeItemId(this._itemId,StackIdx);
        }

        for (var i = 0; i<items.length; i++) {
            objects[i]._blocks.FeatureManager.removeItemId(this._itemId,StackIdx);
        }

        this._processedStack[StackIdx] = null;
    };

    proto.activatePerClick = function(active){
        this._processedStack[this._executeIndex] = active;
        return active;
    };

    proto.getParentItem = function(feature){
        if (feature==null || feature instanceof Boolean){
            this._processedStack[this._executeIndex] = this.parent;
        }
        else{
            this._processedStack[this._executeIndex] = feature.parent;
        }

    };

    proto.getParentObj = function(item){
        if (item==null || item instanceof Boolean){
            this._processedStack[this._executeIndex] = this.parent._mapObj;
        }
        else{
            this._processedStack[this._executeIndex] = item._mapObj;
        }

    };

    proto.getObjInRange = function(MapObjOrCoordinate,range){
        if (MapObjOrCoordinate == null || MapObjOrCoordinate instanceof Boolean){
            var currentLocation= [this.parent._mapObj.x,this.parent._mapObj.y];
        }
        else {
            var currentLocation = [MapObjOrCoordinate.x, MapObjOrCoordinate.y];
        }
        this._processedStack[this._executeIndex] = this._layer.mapData.getObjectsInRange(currentLocation,range,1);
    };

    proto.addToProp = function(itemsOrObjects,variable,block,operator,change){
        this._processedStack[this._executeIndex] = {
            variables:variable,
            blocks:block,
            operators:operator,
            changes:change,
            currentTargetObjectIds: [],
            currentTargetItemIds: []
        };

        if (itemsOrObjects instanceof Array) {
            for (var i = 0; i < itemsOrObjects.length; i++) {
                var itemOrObject = itemsOrObjects[i];
                this.addTargets(itemOrObject, variable, block);
            }
        }

        else{
            this.addTargets(itemsOrObjects, variable, block);
        }
    };

    proto.addTargets= function(itemOrObject, variable, block){
        var success = this.checkValidity(itemOrObject, variable, block);
        if (success) {
            if (itemOrObject.hasOwnProperty("objTypeId")){
                this.addObjTargets(itemOrObject);
            }
            else{
                this.addItemTargets(itemOrObject);
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

    proto.addObjTargets= function(object){
        var targetId = object._id;
        if (this._processedStack[this._executeIndex].currentTargetObjectIds.indexOf(targetId)<0){
            this._processedStack[this._executeIndex].currentTargetObjectIds.push(targetId);
            object._blocks.FeatureManager.addItemId(this._itemId,this._executeIndex);
        }
        object._blocks.FeatureManager.setState(true);
    };

    proto.addItemTargets= function(item){
        var targetId = item._id;
        if (this._processedStack[this._executeIndex].currentTargetItemIds.indexOf(targetId)<0) {
            this._processedStack[this._executeIndex].currentTargetItemIds.push(targetId);
            item._blocks.FeatureManager.addItemId(this._itemId,this._executeIndex);
        }
        item._blocks.FeatureManager.setState(true);
    };





    proto.getItemsInObject = function(object,itemTypeIds){
        if (itemTypeIds  == null){
            this._processedStack[this._executeIndex] = object.getItems();
        }
        else{

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


    proto.setPointers  = function(){
        this._itemId = this.parent._id;
        this._layer= this.parent.gameData.layers.get(this.parent._mapId);
        this._mapObject = this._layer.mapData.mapObjects.get(this.parent._objectId);
        this.checkStackExecution(false);
    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Feature.prototype.finalizeBlockClass('Feature');
    exports.Feature = Feature;

})(typeof exports === 'undefined' ? window : exports);

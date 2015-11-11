var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
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
        this.helperVar = 'test';

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
            {_currentTargetObjectIds: []},
            {_currentTargetItemIds: []},
            {_executeIndex: 0},
            {_variables: []},
            {_blocks: []},
            {_operators: []},
            {_changes: []}
        ];
    };

    proto.checkStackExecution = function(active){
        var process = true;
        this._executeIndex = this.getExecutionIdx();
        while (process == true && this._executeIndex<= this._stack.length){
            if (this._executeIndex ==0){
                var processedStack = null;
                var remainingStack = this._stack;
            }
            else{
                remainingStack  = [];
                for (var i = this._executeIndex; i < this._stack.length; i++) {
                    remainingStack.push(this._stack[i]);
                }
            }
            if (remainingStack.length >0){
                var currentOperation = remainingStack[0];
                var out =  this.processStack(processedStack,currentOperation,active);
                process = out[0];
                if (process) {
                    processedStack = out[1];
                    this._executeIndex +=1;
                }
            }
            else {
                process = false;
            }
        }

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


    proto.processStack = function(processedStack,currentOperation,active){
        var name = Object.keys(currentOperation)[0];
        switch(name){
            case "getParentItem":
                var newStack = this.getParentItem(processedStack);
                var allow = true;
                break;
            case "getParentObj":
                var newStack = this.getParentObj(processedStack);
                var allow = true;
                break;
            case "getObjInRange":
                var newStack = this.getObjInRange(processedStack,currentOperation[name]); //range
                var allow = true;
                break;
            case "AddToProp":
                this.addToProp(processedStack,currentOperation[name].vars,currentOperation[name].blocks,currentOperation[name].operator,currentOperation[name].values); // property,change, mode (1= baseline)
                var newStack = processedStack;
                var allow = true;
                break;
            case "activatePerClick":
                var allow = this.activatePerClick(active);
                var newStack = processedStack;
                break;
            case "getItemsInObject":
                var newStack = this.getItemsInObject(processedStack,currentOperation[1]);
                var allow = true;
                break;

            // execute on map, build mapObject on execute
        }
        var out = [allow, newStack];
        return out

    };


    proto.activatePerClick = function(active){
        var allow = false;
        if (active == true){
            allow = true;
        }
        return allow;
    };

    proto.getParentItem = function(feature){
        if (feature == null){
            return this.item;
        }
        else {
            return feature.item;
        }
    };

    proto.getParentObj = function(item){
        if (item == null){
            return this._mapObject;
        }
        else {
            return item.mapObject
        }
    };

    proto.getObjInRange = function(coordiante,range){
        if (coordiante == null){
            var currentLocation= [this._mapObject.x,this._mapObject.y];
        }
        else{
            var currentLocation= [coordiante.x,coordiante.y];
        }
        return this._layer.mapData.getObjectsInRange(currentLocation,range,1);

    };


    proto.addToProp = function(itemsOrObjects,variable,block,operator,change){

        if (itemsOrObjects instanceof Array) {
            for (var i = 0; i < itemsOrObjects.length; i++) {
                var itemOrObject = itemsOrObjects[i];

                var success = this.applyFeature(this._itemId, itemOrObject, variable, block, operator, change);
                var targetId = itemOrObject._id;
                if (success) {
                    if (itemOrObject.hasOwnProperty("objTypeId")) {
                        if (this._currentTargetObjectIds.indexOf(targetId)<0){
                            this._currentTargetObjectIds.push(targetId);
                            itemOrObject._blocks.FeatureManager.addItemId(this._itemId);
                        }
                    }
                    else {
                        if (this._currentTargetItemIds.indexOf(targetId)<0) {
                            this._currentTargetItemIds.push(targetId);
                            itemOrObject._blocks.FeatureManager.addItemId(this._itemId);
                        }
                    }
                    itemOrObject._blocks.FeatureManager.setState(true);
                }
            }
        }
        else{
            var success = this.applyFeature(this._itemId, itemsOrObjects, variable, block, operator, change);
            var targetId = itemsOrObjects._id;
            if (success) {
                if (itemsOrObjects.hasOwnProperty("objTypeId")) {
                    if (this._currentTargetObjectIds.indexOf(targetId)<0) {
                        this._currentTargetObjectIds.push(targetId);
                        itemsOrObjects._blocks.FeatureManager.addItemId(this._itemId);

                    }
                }
                else {
                    if (this._currentTargetItemIds.indexOf(targetId)<0) {
                        this._currentTargetItemIds.push(targetId);
                        itemsOrObjects._blocks.FeatureManager.addItemId(this._itemId);
                    }
                }
                itemsOrObjects._blocks.FeatureManager.setState(true);

            }

        }
    };

    proto.applyFeature = function(itemId,itemOrObj,variables,blocks,operators,changes){
        var blockValid = true;
        var varValid = true;
        // check if block and variable exit exist
        for (var i = 0; i<blocks.length; i++){

            if (!itemOrObj._blocks.hasOwnProperty(blocks[i])) {
                blockValid = false;
                if (!itemOrObj._blocks.hasOwnProperty(blocks[i]).hasOwnProperty(variables[i])) {
                    var varValid = false;
                }
            }
        }

        if (blockValid && varValid){
            this._variables= variables;
            this._blocks  = blocks;
            this._operators = operators;
            this._changes =changes;
            return true;
        }
        else{
            return false;
        }
    };


    proto.getItemsInObject = function(object,itemTypeIds){
        if (itemTypeIds  == null){
            return object.getItems()
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
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Feature.prototype.finalizeBlockClass('Feature');
    exports.Feature = Feature;

})(typeof exports === 'undefined' ? window : exports);

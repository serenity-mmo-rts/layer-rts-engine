var node = !(typeof exports === 'undefined');

if (node) {

}

(function (exports) {

    var Feature = function (item,stateVars){

        this._item = item;
        this._itemId = this._item._id;

     // serialized
        this._currentTargetObjectIds = [];
        this._currentTargetItemIds = [];
        this._remainingActivationTime= null;
        this._executeIndex =0;
        this._variables= [];
        this._blocks  =[];
        this._operators = [];
        this._changes =[];

        this.load(stateVars);

    };


    Feature.prototype ={

        setStack: function(){


        },


        checkStackExecution: function(active){
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

        },

        getExecutionIdx: function(){
            if (this._executeIndex==null){
                return 0;
            }
            else{
                return this._executeIndex
            }
        },


         processStack : function(processedStack,currentOperation,active){
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

        },


        activatePerClick: function(active){
            var allow = false;
                if (active == true){
                   allow = true;
                }
            return allow;
        },

        getParentItem: function(feature){
            if (feature == null){
                return this.item;
            }
           else {
                return feature.item;
            }
        },

        getParentObj: function(item){
            if (item == null){
                return this._mapObject;
            }
            else {
                return item.mapObject
            }
        },

        getObjInRange: function(coordiante,range){
            if (coordiante == null){
               var currentLocation= [this._mapObject.x,this._mapObject.y];
            }
            else{
               var currentLocation= [coordiante.x,coordiante.y];
            }
            return this._layer.mapData.getObjectsInRange(currentLocation,range,1);

        },


        addToProp: function(itemsOrObjects,variable,block,operator,change){


            if (itemsOrObjects instanceof Array) {
                for (var i = 0; i < itemsOrObjects.length; i++) {
                    var itemOrObject = itemsOrObjects[i];
                    var success = this.addFeature(this._itemId, itemOrObject, variable, block, operator, change);

                    if (success) {
                        if (itemOrObject.hasOwnProperty("objTypeId")) {
                            this._currentTargetObjectIds.push(itemOrObject._id);
                        }
                        else {
                            this._currentTargetItemIds.push(itemOrObject._id);
                        }
                        itemOrObject._blocks.FeatureManager.setState(true);
                        itemOrObject._blocks.FeatureManager.addItemId(this._itemId);
                    }
                }
            }
            else{
                var success = this.addFeature(this._itemId, itemsOrObjects, variable, block, operator, change);

                if (success) {
                    if (itemsOrObjects.hasOwnProperty("objTypeId")) {
                        this._currentTargetObjectIds.push(itemsOrObjects._id);
                    }
                    else {
                        this._currentTargetItemIds.push(itemOrObject._id);
                    }
                    itemsOrObjects._blocks.FeatureManager.setState(true);
                    itemsOrObjects._blocks.FeatureManager.addItemId(this._itemId);
                }

            }
        },

        addFeature: function(itemId,itemOrObj,variables,blocks,operators,changes){
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
        },


        getItemsInObject: function(object,itemTypeIds){
            if (itemTypeIds  == null){
                return object.getItems()
            }
            else{

            }
        },



        checkSelect: function(currentTarget){
            if (this._properties._canSelect){
                if(this.validMapObject(currentTarget)){
                    var featureTargets = this._layer.mapData.getMapObject(currentTarget);
                }
            }
            else {
                var coords = [this._layer.mapData.mapObjects.get(this._itemId._objectId).x,this._layer.mapData.mapObjects.get(this._itemId._objectId).y];
            }
        },

        checkRange: function(currentTarget){
            if (this._properties._range > 0){
                if(this.validCoordinate(currentTarget)){
                    var featureTargets = this._layer.mapData.getObjectsInRange(currentTarget,this._properties._range);
                    return featureTargets;
                }
            }
        },
  

        validCoordinate: function (currentTarget){
            // check whether user has mouse on map (current Target = coordinate)
        },

        validMapObject: function (currentTarget){
            // check whether user has mouse over map Object (current Target = map Obj)
        },

        validItem: function (currentTarget){
            // check whether use has mouse over Item (current Target = Item)
        },


        setPointers : function(){
            this._itemId = this._item._id;
            this._layer= this._item.gameData.layers.get(this._item._mapId);
            this._mapObject = this._layer.mapData.mapObjects.get(this._item._objectId);
            this._stack = this._item._itemType._blocks.Feature[this._item._level];
        },



        save: function () {

            var o = {
                a:[ this._item._id,
                    this._currentTargetObjectIds,
                    this._currentTargetItemIds,
                    this._executeIndex,
                    this._remainingActivationTime,
                    this._variables,
                    this._blocks,
                    this._operators,
                    this._changes
                ]
            };
            return o;
        },

        load: function (o) {

            if (o.hasOwnProperty("a")) {
                this._item._id = o.a[0];
                this._currentTargetObjectIds = o.a[1];
                this._currentTargetItemIds = o.a[2];
                this._executeIndex = o.a[3];
                this._remainingActivationTime = o.a[4];
                this._variables= o.a[5];
                this._blocks  = o.a[6];
                this._operators = o.a[7];
                this._changes = o.a[8];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }

            this.setPointers();

        }

    };

    exports.Feature = Feature;

})(typeof exports === 'undefined' ? window : exports);

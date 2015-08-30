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
            if (itemsOrObjects instanceof Array){
                for (var i = 0; i<itemsOrObjects.length; i++){
                    var itemOrObject = itemsOrObjects[i];
                    if (itemOrObject.hasOwnProperty("objTypeId")){
                        var type = 1;
                    }
                    else{
                        var type = 2;
                    }
                    itemOrObject._blocks.FeatureManager.addFeature(this._itemId,type,variable,block,operator,change);
                }
            }
            else{
                if (itemsOrObjects.hasOwnProperty("objTypeId")){
                    var type = 1;
                }
                else{
                    var type = 2;
                }
                itemsOrObjects._blocks.FeatureManager.addFeature(this._itemId,type,variable,block,operator,change);
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
                    this._remainingActivationTime
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

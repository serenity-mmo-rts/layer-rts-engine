var node = !(typeof exports === 'undefined');

if (node) {

}

(function (exports) {

    var FeatureModel = function (gameData,initObj){
        //this._currentTargetIds=null;
        this._remainingActivationTime= null;
        this._mapId = null;
        this._itemId = null;
        this._executeIndex =0;

        //this._properties= null;
        this.gameData = gameData;
        this._stack = [];
        this.load(initObj);
    }


    FeatureModel.prototype ={

        checkStackExecution: function(active){
            var process = true;
            this.setPointers();
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
                      // remainingStack.shift();
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

            switch(currentOperation[0]){
                case "getParentItem":
                    var newStack = this.getParentItem(processedStack);
                    var allow = true;
                    break;
                case "getParentObj":
                    var newStack = this.getParentObj(processedStack);
                    var allow = true;
                    break;
                case "getObjInRange":
                    var newStack = this.getObjInRange(processedStack,currentOperation[1]); //range
                    var allow = true;
                    break;
                case "AddToProp":
                    this.addToProp(processedStack,currentOperation[1],currentOperation[2],currentOperation[3],currentOperation[4]); // property,change, mode (1= baseline)
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
                return this.mapObject;
            }
            else {
                return item.mapObject
            }
        },

        getObjInRange: function(coordiante,range){
            if (coordiante == null){
               var currentLocation= [this.mapObject.x,this.mapObject.y];
            }
            else{
               var currentLocation= [coordiante.x,coordiante.y];
            }
            return this.map.getObjectsInRange(currentLocation,range,1);

        },

        addToProp: function(itemsOrObjects,property,change,operator,mode){
            if (itemsOrObjects instanceof Array){
                for (var i = 0; i<itemsOrObjects.length; i++){
                    var itemOrObject = itemsOrObjects[i];
                    itemOrObject.addFeature(this._itemId,property,change,operator,mode);
                }
            }
            else{
                itemsOrObjects.addFeature(this._itemId,property,change,operator,mode);
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
                    var featureTargets = this.map.getMapObject(currentTarget);
                }
            }
            else {
                var coords = [this.map.mapObjects.get(this._itemId._objectId).x,this.map.mapObjects.get(this._itemId._objectId).y];
            }
        },

        checkRange: function(currentTarget){
            if (this._properties._range > 0){
                if(this.validCoordinate(currentTarget)){
                    var featureTargets = this.map.getObjectsInRange(currentTarget,this._properties._range);
                    return featureTargets;
                }
            }
        },


        setPointers : function(){
            this.map= this.gameData.maps.get(this._mapId);
            this.item = this.map.items.get(this._itemId);
            this.mapObject = this.map.mapObjects.get(this.item._objectId);
            this.setStack();
        },

        setStack: function(){
            var level = this.item._level
            this._stack = this.gameData.itemTypes.get(this.item._itemTypeId)._features[level];
        },


        getMapObject : function(MapCoordinate){
            // get MapObj under Coordinate
        },

        getItem: function(MouseCoordinates){
            // get Item under Coordinate
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

        save: function () {

            var o = {
                _mapId: this._mapId,
                _itemId: this._itemId,
                a:[
                   this._executeIndex,
                   this._currentTargetIds,
                   this._remainingActivationTime
                ]
            };
            return o;
        },

        load: function (o) {
            this._mapId = o._mapId;
            this._itemId = o._itemId;

            if (o.hasOwnProperty("a")) {
                this._executeIndex = o.a[1];
                this._currentTargetIds = o.a[2];
                this._remainingActivationTime = o.a[3];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    }


    exports.FeatureModel = FeatureModel;

})(typeof exports === 'undefined' ? window : exports);

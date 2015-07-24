var node = !(typeof exports === 'undefined');

if (node) {

}

(function (exports) {

    var Feature = function (item,stateVars){

        this._item = item;

     // serialized
        this.itemId =  null;
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
                var coords = [this.map.mapData.mapObjects.get(this._itemId._objectId).x,this.map.mapData.mapObjects.get(this._itemId._objectId).y];
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


        setPointers : function(){
            this._itemId = this._item._id;
            this._map= this._item.gameData.layers.get(this._item._mapId);
            this._mapObject = this._map.mapData.mapObjects.get(this._item._objectId);
            this._stack = this._item._itemType._blocks.Feature.command[this._item._level];
        },



        save: function () {

            var o = { itemId : this._item._id,
                a:[
                   this._executeIndex,
                   this._currentTargetIds,
                   this._remainingActivationTime
                ]
            };
            return o;
        },

        load: function (o) {

            if (o.hasOwnProperty("a")) {
                this._executeIndex = o.a[0];
                this._currentTargetIds = o.a[1];
                this._remainingActivationTime = o.a[2];
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

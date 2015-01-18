var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
}

(function (exports) {


    var FeatureModel= Class.extend( {


        _gameData: null,
        _featureTypeId: null,
        _properties: null,

        _currentTargetIds:null,
        _remainingActivationTime: null,


        init: function(gameData, initObj){
          this._gameData = gameData;
            this.load(initObj);
        },

       getObjectsInRange : function(MapCoordinate,range){
           // find objects in game data with coordinate and range
       },

        getItemsInObject : function(MapObject){
            // get items in map object
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
            // check whether use has mouse over map Object (current Target = map Obj)
        },

        validItem: function (currentTarget){
            // check whether use has mouse over Item (current Target = Item)
        },


        selectFeatureTargets: function(currentTarget){ // current Target comes from UI
            var map = this.gameData.mapObjects.get(this._mapId);
            switch (this._properties._appliedOn){
                case "Object": // applied on object
                    // apply on selected object
                    if (this._properties._canSelect){
                        // apply on objects with range
                        if (this._properties._range > 0){
                            if(map.validCoordinate(currentTarget)){
                                var featureTargets = map.getObjectsInRange(currentTarget,this._properties._range);
                            }
                        }
                        // apply on selected object only
                        else{
                            if(map.validMapObject(currentTarget)){
                                var featureTargets = map.getMapObject(currentTarget);
                            }
                        }
                    }
                    // cannot select object (auto apply feature)
                    else{
                        //  auto-apply on current object with range
                        if (this._properties._range > 0){
                            var coords = [map.mapObjects.get(this._itemId._objectId).x,map.mapObjects.get(this._itemId._objectId).y];
                            var featureTargets = map.getObjectsInRange(coords,this._properties._range);
                        }
                        // auto-apply on current object
                        else{
                            var featureTargets = map.mapObjects.get(this._itemId._objectId);
                        }
                    }

                case "Item": // apply on items
                if (this._properties._canSelect){

                    // apply on items of object with selected range
                    if (this._properties._range > 0){
                        if(map.validCoordinate(currentTarget)){
                            var objects = this.getObjectsInRange(currentTarget,this._properties._range);
                            var featureTargets =[];
                            for (var i = 0;i<objects.length;i++){
                                featureTargets[i]= this.getItemsInObject(objects[i]);
                            }
                        }
                    }
                    // apply on single item (in current obj)
                    else{
                        if(map.validItem(currentTarget)){
                            var objects = this.getObjectsInRange(currentTarget,this._properties._range);
                            var featureTargets =[];
                            for (var i = 0;i<objects.length;i++){
                                featureTargets[i]= this.getItemsInObject(objects[i]);
                            }
                        }

                    }


                }
                // cannot select item
                else{

                    // auto-apply on all items in current object
                    if (this._properties._range ==0) {
                        var object = map.mapObjects.get(this._itemId._objectId);
                        var featureTargets =[];
                            featureTargets = map.mapObjects.getItemsInObject(object);
                    }

                    // auto-apply on items in objects in range of current object
                   else if (this._properties._range > 0){
                        var coords = [map.mapObjects.get(this._itemId._objectId).x,map.mapObjects.get(this._itemId._objectId).y];
                        var objects = map.getObjectsInRange(coords,this._properties._range);
                        var featureTargets =[];
                        for (var i = 0;i<objects.length;i++){
                            featureTargets[i]= map.mapObjects.getItemsInObject(objects[i]);
                        }

                    }
                }

                case "Map_Coordinate":
                    // apply on Map_Coordiante
                    if(this.validCoordinate(currentTarget)){
                        var featureTargets = currentTarget;
                    }


                case "User":
                    // apply on User
                    // var featureTargets = userId;
            }

            return featureTargets
        },



        applyToItem: function() {

            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                newProp = features[i].applyToItem(initProp,newProp)
            }
            return initProp
        },


        applyToObject: function(initProp,newProp){

            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                newProp = features[i].applyToObject(initProp,newProp)
            }
            return initProp

        },

        save: function () {

            var o = {
                a:[this._featureTypeId,
                   this._itemId,
                   this._mapId,
                   this._currentTargetIds,
                   this._remainingActivationTime
                ]
            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._featureTypeId = o.a[0];
                this._itemId = o.a[1];
                this._mapId = o.a[2];
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
            // load properties from type
            this._properties = this.gameData.featureTypes.get(this._featureTypeId);
        }

    });


    exports.FeatureModel = FeatureModel;

})(typeof exports === 'undefined' ? window : exports);

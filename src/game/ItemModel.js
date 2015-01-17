var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var FeatureModel = FeatureModel('./FeatureModel').FeatureModel;
}

(function (exports) {

    var itemStates = {};
    itemStates.INITIALIZED = 0;
    itemStates.INVALID = 1;
    itemStates.VALID = 2;
    itemStates.EXECUTING = 3;
    itemStates.FINISHED = 4;

    var ItemModel= Class.extend( {


        _gameData: null,
        _id: null,
        _objectId: null,
        _itemTypeId: null,
        _state:null,

        _level:null,
        _healthPoints: null,
        _armor: null,

        _initProperties: null,
        _features: null,


        //_appliedFeatures: null,
        //_targetCoordinates: null,
        //_targetItemIds : null,
        //_targetObjectIds : null,

        init: function(gameData, initObj){

            var maxLevel= this.gameData.itemTypes.get(this._itemTypeId)._maxLevel;
            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;

            for(var key in initProp) {
               this._initProperties[key] = initProp[key];
            }

            var featureTypeIds= this.gameData.itemTypes.get(this._itemTypeId)._featureTypeIds[this._level];

            for (var i = 0; i< featureTypeIds.length;i++){
                this._features.push(new FeatureModel(gameData,featureTypeIds[i]));
            }


            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },

        canSelectObject: function(){ // apply to different map Object
            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                if (features[i].canSelectObject()){
                    return true;
                }
            }
            return false;
        },

        canSelectCoordinates: function(){ // apply to coordinates
            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                if (features[i].canSelectCoordinates()){
                    return true;
                }
            }
            return false;
        },

        canSelectItem: function(){ // choose item in current object
            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                if (features[i].canSelectItem()){
                    return true;
                }
            }
            return false;

        },

        canBeActivated: function(){ // activiated in current object

            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                if (features[i].canBeActivated()){
                    return true;
                }
            }
            return false;
        },

        setTargetObject: function(objId){ // apply to different map Object
            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                if (features[i].canSelectObject()){
                    return true;
                }
            }
            return false;
        },

        applyToItem: function() {

            var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

            for (var i = 0;i<features.length;i++){
                newProp = features[i].applyToItem(initProp,newProp)
            }
            return initProp
        },


        setTargetItemId : function(Id){


        },

        setInvalid: function () {
            this._state = itemStates.INVALID;
        },

        isValid: function () {
            //overwrite
        },

        execute: function (callback) {
            //overwrite
        },

        applyToObject: function(initProp,newProp){

             var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures[this._level];

             for (var i = 0;i<features.length;i++){
                 newProp = features[i].applyToObject(initProp,newProp)
             }
            return initProp

        },

        save: function () {

           var o = {_id: this._id,
                      a:[this._objectId,
                         this._ItemTypeId,
                         this._level,
                         this._healthPoints,
                         this._armor
                        ]
                   };
        return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._objectId = o.a[0];
                this._ItemTypeId = o.a[1];
                this._level = o.a[2];
                this._healthPoints = o.a[3];
                this._armor = o.a[4];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    });


    exports.ItemModel = ItemModel;

})(typeof exports === 'undefined' ? window : exports);

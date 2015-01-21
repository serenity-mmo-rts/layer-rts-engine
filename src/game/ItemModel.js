var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var FeatureModel = require('./FeatureModel').FeatureModel;
}

(function (exports) {

    var itemStates = {};
    itemStates.INITIALIZED = 0;
    itemStates.INVALID = 1;
    itemStates.VALID = 2;
    itemStates.EXECUTING = 3;
    itemStates.FINISHED = 4;

    var ItemModel= Class.extend( {



        // serialized
        _id: null,
        _objectId: null,
        _itemTypeId: null,
        _state:null,

        _level:null,
        _healthPoints: null,
        _armor: null,
        _onChangeCallback: null,
        _mapId: null,

         //not serialized
        _gameData: null,
        _initProperties: null,
        _features: null,



        //_appliedFeatures: null,
        //_targetCoordinates: null,
        //_targetItemIds : null,
        //_targetObjectIds : null,

        init: function(gameData, initObj){

            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;

            for(var key in initProp) {
               this._initProperties[key] = initProp[key];
            }

            var featureTypeIds= this.gameData.itemTypes.get(this._itemTypeId)._featureTypeIds[this._level];

            for (var i = 0; i< featureTypeIds.length;i++){
                this._features.push(new FeatureModel(gameData,{featureTypeIds: featureTypeIds[i],
                    _itemId: this._id,_mapId: this._mapId}));
            }


            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },

        setState: function(state) {
            this._state = state;
            this.notifyChange();
        },

        notifyChange: function() {
            if (this._onChangeCallback) this._onChangeCallback();
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


        setInvalid: function () {
            this._state = itemStates.INVALID;
        },

        isValid: function () {
            //overwrite
        },

        execute: function (callback) {
            //overwrite
        },



        save: function () {
           var o = {_id: this._id,
                      a:[this._state,
                         this._objectId,
                         this._ItemTypeId,
                         this._level,
                         this._healthPoints,
                         this._armor,
                         this._mapId
                        ]
                   };
        return o;
        },


        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._state = o.a[0];
                this._objectId = o.a[1];
                this._ItemTypeId = o.a[2];
                this._level = o.a[3];
                this._healthPoints = o.a[4];
                this._armor = o.a[5];
                this._mapId = o.a[6];
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

    exports.itemStates = itemStates;
    exports.ItemModel = ItemModel;

})(typeof exports === 'undefined' ? window : exports);

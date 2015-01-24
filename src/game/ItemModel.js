var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var FeatureModel = require('./FeatureModel').FeatureModel;
}

(function (exports) {

    var itemStates = {};
    itemStates.TEMP = 0;
    itemStates.WORKING= 1;
    itemStates.FINSEHD = 2;


    var ItemModel= Class.extend( {



        // serialized
        _id: null,
        _objectId: null,
        _itemTypeId: null,
        _mapId: null,
        _state:itemStates.TEMP,
        _level:0,
        _onChangeCallback: null,


         //not serialized
        _gameData: null,
        _initProperties: null,
        _features: null,
        _mapObj: null,


        init: function(gameData, initObj){
            this.gameData = gameData;

            // deserialize event from json objectet
            this.load(initObj);
        },

        setState: function(state) {
            this._state = state;
            this.notifyChange();
        },

        setLevel: function(lvl) {
            this._level = lvl;
            this.notifyChange();
        },

        notifyChange: function() {
            if (this._onChangeCallback) this._onChangeCallback();
        },


        applyToGame: function() {

            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;
            for(var key in initProp) {
                this._initProperties[key] = initProp[key];
            }

            // do this on execute
            var featureTypeIds= this.gameData.itemTypes.get(this._itemTypeId)._featureTypeIds[0];
            for (var i = 0; i< featureTypeIds.length;i++){
                this._features.push(new FeatureModel(this.gameData,{featureTypeIds: featureTypeIds[i],
                    _itemId: this._id,_mapId: this._mapId}));
            }
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
           var o = {_id: this._id,
                    _itemTypeId: this._itemTypeId,
                    _objectId: this._objectId,
                    _mapId: this._mapId,
                    a:[this._level,
                       this._state
                      ]
                   };
        return o;
        },


        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._itemTypeId = o._itemTypeId;
                this._objectId = o._objectId;
                this._mapId = o._mapId;
                this._level = o.a[0];
                this._state = o.a[1];

            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
            this._mapObj=  this.gameData.maps.get(this._mapId).mapObjects.get(this._objectId);

        }

    });

    exports.itemStates = itemStates;
    exports.ItemModel = ItemModel;

})(typeof exports === 'undefined' ? window : exports);

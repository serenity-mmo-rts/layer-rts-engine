var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var FeatureModel = require('./FeatureModel').FeatureModel;
}

(function (exports) {



    var ItemModel = function (gameData,initObj){

        var itemStates = {};
        itemStates.TEMP = 0;
        itemStates.WORKING= 1;
        itemStates.FINSEHD = 2;
        // serialized
        this._id=null;
        this._objectId= null;
        this._itemTypeId= null;
        this._mapId= null;
        this._state=itemStates.TEMP;
        this._level=0;
        this._onChangeCallback= null;
        this._position= null;
        this._features=[];
        //not serialized
        this._mapObj= null;
        this.gameData = gameData;
        this._initProperties= {};
        // deserialize event from json objectet
        this.load(initObj);
        this.updateItemProperties();
    }

    ItemModel.prototype= {

        setState: function(state) {
            this._state = state;
            this._mapObj.notifyChange();
        },

        setPosition: function(position) {
            this._position = position;
            this._mapObj.notifyChange();
        },

        setLevel: function(lvl) {
            this._level = lvl;
            this._mapObj.notifyChange();
        },

        getPosition: function() {
            return this._position;
        },




        updateItemProperties: function() {

            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;
            for(var key in initProp) {
                this._initProperties[key] = initProp[key][this._level];
            }
            this._features = [];
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
                       this._state,
                       this._position
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
                this._position = o.a[2];

            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
            this._mapObj =  this.gameData.maps.get(this._mapId).mapObjects.get(this._objectId);
            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }

        }

    }


    //exports.itemStates = itemStates;
    exports.ItemModel = ItemModel;

})(typeof exports === 'undefined' ? window : exports);
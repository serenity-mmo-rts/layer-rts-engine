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
        this._itemTypeId = null;
        this._mapId= null;

        this._state=itemStates.TEMP;
        this._level=0;
        this._onChangeCallback= null;
        this._position= null;
        this._feature=null;

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
            if (lvl!=this._level){
                this._level = lvl;
                this._mapObj.notifyChange();
                this.createFeature();
            }
        },

        getPosition: function() {
            return this._position;
        },

        updateItemProperties: function() {
            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;
            for(var key in initProp) {
                this._initProperties[key] = initProp[key][this._level];
            }
        },

        createFeature: function(){
            this._feature = null;
            //var featureTypeId= this.gameData.itemTypes.get(this._itemTypeId)._featureTypeId[this._level];
            var features = this.gameData.itemTypes.get(this._itemTypeId)._features;
            this._feature = new FeatureModel(this.gameData,{_itemId: this._id,_mapId: this._mapId});
        },


        save: function () {

           var feature= this._feature.save();
           var o = {_id: this._id,
                    _itemTypeId: this._itemTypeId,
                    _objectId: this._objectId,
                    _mapId: this._mapId,
                    a:[this._level,
                       this._state,
                       this._position,
                       feature
                      ]

                   };

        return o;
        },


        load: function (o) {
            this._id = o._id;
            this._itemTypeId = o._itemTypeId;
            this._objectId = o._objectId;
            this._mapId = o._mapId;

            if (o.hasOwnProperty("a")) {
                this._level = o.a[0];
                this._state = o.a[1];
                this._position = o.a[2];
                this._feature = new FeatureModel(this.gameData,o.a[3]);

            }


            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
                if (this._feature == null){
                    this.createFeature();
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
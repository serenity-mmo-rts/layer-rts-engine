var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
}

(function (exports) {


    var FeatureModel= Class.extend( {


        _gameData: null,
        _featureTypeId: null,
        _properties: null,
        _effects: null,
        _currentTarget:null,


        init: function(gameData, typeId){

            this._featureTypeId = typeId;
            this._properties = this.gameData.featureTypes.get(this._featureTypeId);
            //this._properties._effects.apply(this);



            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        applyToItem: function (initProp,newProp) {


            for (var i = 0;i<this._childFeatures.length;i++){
                newProp = this._childFeatures[i].applyToObject(initProp,newProp)
            }
            return initProp

        },


        setItemTarget: function(itemId) {
            this._targetItemId = itemId

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


    exports.FeatureModel = FeatureModel;

})(typeof exports === 'undefined' ? window : exports);

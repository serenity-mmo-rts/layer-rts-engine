var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
}

(function (exports) {

    var itemStates = {};
    itemStates.INITIALIZED = 0;
    itemStates.INVALID = 1;
    itemStates.VALID = 2;
    itemStates.EXECUTING = 3;
    itemStates.FINISHED = 4;

    var ItemModel= Class.extend( {

        // unit specific
        _gameData: null,
        _id: null,
        _objectId: null,
        _itemTypeId: null,

        _state:null,
        _level:null,
        _healthPoints: null,
        _armor: null,

        init: function(gameData, initObj){

            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);

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

        applyToObject: function(){
             var features = this.gameData.itemTypes.get(this._itemTypeId)._objectFeatures;


             for (var i = 0;i<features[this.level].length;i++){
                 var key = features[[this.level][i]].key;
                 var operation = features[[this.level][i]].operation;
                 var value = features[[this.level][i]].value;

                 if (operation ==1) { // +
                     this.gameData.mapObjects.get(this._objectId)[key] += value;
                 }

                 else if(operation==2){ // *
                     this.gameData.mapObjects.get(this._objectId)[key] *= value;
                 }

             }

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

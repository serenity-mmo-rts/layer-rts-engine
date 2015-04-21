var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({

        _type: null,
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _canMove: null,
        _canFight: null,
        _maxLevel: null,
        _initProperties:{},
        _featureTypeIds: null,


        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [
                    this._type,
                    this._allowOnMapTypeId,
                    this._canMove,
                    this._canFight,
                    this._maxLevel,
                    this._initProperties,
                    this._featureTypeIds


                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this._type = o.a2[0];
                    this._allowOnMapTypeId = o.a2[1];
                    this._canMove = o.a2[2];
                    this._canFight = o.a2[3];
                    this._maxLevel = o.a2[4];
                    this._initProperties = o.a2[5];
                    this._featureTypeIds = o.a2[6]

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

    exports.ItemType= ItemType;

})(typeof exports === 'undefined' ? window : exports);

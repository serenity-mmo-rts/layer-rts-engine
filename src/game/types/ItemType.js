var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({


        _className: null,
        _blocks: {},
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _maxLevel: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [

                    this._className,
                    this._blocks,
                    this._allowOnMapTypeId,
                    this._allowOnObjTypeId,
                    this._maxLevel

                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this._className = o.a2[0];
                    this._blocks = o.a2[1];
                    this._allowOnMapTypeId = o.a2[2];
                    this._allowOnObjTypeId = o.a2[3];
                    this._maxLevel = o.a2[4];

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

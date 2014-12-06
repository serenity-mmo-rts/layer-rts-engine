var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({
        // serialized:
        _type: "ItemType",
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _requiredTechnologies: null,
        _requiredRessources: null,
        // parent feature
        _features: [],

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._allowOnMapTypeId,
                    this._allowOnObjTypeId,
                    this._requiredTechnologies,
                    this._requiredRessources,
                    this._features];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._allowOnMapTypeId = o.a[0];
                this._allowOnObjTypeId = o.a[1];
                this._requiredTechnologies = o.a[2];
                this._requiredRessources = o.a[3];
                this._features = o.a[4];
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

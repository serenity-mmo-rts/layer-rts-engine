var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType = require('./AbstractType').AbstractType;
}


(function (exports) {

    var ObjectType = AbstractType.extend({

        // serialized:
        _type: "ObjectType",
        // requirements
        _allowOnMapTypeId: null,
        _requiredTechnologies: null,
        _requiredRessources: null,

        // Object specific
        _initWidth: null,
        _initHeight: null,
        _spritesheetId: null,
        _spriteFrame: null,
        _hasChildMapTypeId: null,


        init: function (gameData, initObj) {

            this._super(gameData, initObj);

        },

        getArea: function () {
            return this.width * this.height;
        },

        save: function () {
            var o = this._super();
            o.a2 = [this._allowOnMapTypeId,
                this._requiredTechnologies,
                this._requiredRessources,
                this._initWidth,
                this._initHeight,
                this._spritesheetId,
                this._spriteFrame,
                this._hasChildMapTypeId];
            return o;

        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._allowOnMapTypeId = o.a2[0];
                this._requiredTechnologies = o.a2[1];
                this._requiredRessources = o.a2[2];
                this._initWidth = o.a2[3];
                this._initHeight = o.a2[4];
                this._spritesheetId = o.a2[5];
                this._spriteFrame = o.a2[6];
                this._hasChildMapTypeId = o.a2[7];
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

    exports.ObjectType = ObjectType;

})(typeof exports === 'undefined' ? window : exports);
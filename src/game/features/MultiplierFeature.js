
var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractFeature = require('./AbstractFeature').AbstractFeature;
}

(function (exports) {

    var MultiplierFeature = AbstractFeature.extend({


        _type: "MultiplierFeature",
        _key: null,
        _value: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        applyToObject: function (initProp,newProp) {

            if(this._modus ==1){ // apply to base value
                var change = initProp[this.key] * this._value;
                newProp[this._key] += change;
                return newProp;
            }
            else if (this._modus==2) { // apply to total value
                newProp[this._key] *= this._value;
                return newProp;
            }
        },


        save: function () {
            var o = this._super();
            o.a2 = [this._key,this._value];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._key = o.a2[0];
                this._value = o.a2[1];
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

    exports.MultiplierFeature = MultiplierFeature;

})(node ? exports : window);

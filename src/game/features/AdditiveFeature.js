
var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractFeature = require('./AbstractFeature').AbstractFeature;
}

(function (exports) {

    var AdditiveFeature = AbstractFeature.extend({


        _type: "AdditiveFeature",
        _key: null,
        _value: null,
        _modus: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },


        applyToObject: function (initProp,newProp) {
          if (this.isValid(this._key,initProp)){

              if(this._modus ==1){ // apply to base value
                  var change = initProp[this._key] + this._value;
                  newProp[this._key] += change;
                  return newProp;
              }
              else if (this._modus==2) { // apply to total value
                  newProp[this._key] += this._value;
                  return newProp;
              }
          }

        },



    save: function () {
            var o = this._super();
            o.a2 = [
                    this._key,
                    this._value,
                    this._modus
                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._key = o.a2[0];
                this._value = o.a2[1];
                this._modus = o.a2[2];
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

    exports.AdditiveFeature = AdditiveFeature;

})(node ? exports : window);

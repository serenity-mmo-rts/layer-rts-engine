var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({


        className: null,
        blocks: {},
        allowOnMapTypeId: null,
        allowOnObjTypeId: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [

                    this.className,
                    this.blocks,
                    this.allowOnMapTypeId,
                    this.allowOnObjTypeId

                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this.className = o.a2[0];
                    this.blocks = o.a2[1];
                    this.allowOnMapTypeId = o.a2[2];
                    this.allowOnObjTypeId = o.a2[3];

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

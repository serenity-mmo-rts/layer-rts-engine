var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType = require('./AbstractType').AbstractType;
}


(function (exports) {

    var ObjectType = AbstractType.extend({

        // basics:
        type: "ObjectType",
        blocks: {},
        allowOnMapTypeId: null,
        requiredTechnologies: null,
        requiredRessources: null,
        initWidth: null,
        initHeight: null,
        spritesheetId: null,
        spriteFrame: null,
        spriteAnimation: null,
        StarSizesMean : null,
        StarSizesStd :null,
        StarHeatMean : null,
        StarHeatStd : null,
        PlanetAmountMean : null,
        PlanetAmountStd : null,
        PlanetSizesMean : null, // in 2 pow n
        PlanetSizesStd : null,

        init: function (gameData, initObj) {

            this._super(gameData, initObj);

        },

        getArea: function () {
            return this.width * this.height;
        },

        save: function () {
            var o = this._super();
            o.a2 = [this.blocks,
                this.allowOnMapTypeId,
                this.requiredTechnologies,
                this.requiredRessources,
                this.initWidth,
                this.initHeight,
                this.spritesheetId,
                this.spriteFrame,
                this.hasChildMapTypeId,
                this.className,
                this.spriteAnimation,
                this.StarSizesMean,
                this.StarSizesStd,
                this.StarHeatMean,
                this.StarHeatStd,
                this.PlanetAmountMean,
                this.PlanetAmountStd,
                this.PlanetSizesMean,
                this.PlanetSizesStd
            ];



            return o;

        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.blocks = o.a2[0];
                this.allowOnMapTypeId = o.a2[1];
                this.requiredTechnologies = o.a2[2];
                this.requiredRessources = o.a2[3];
                this.initWidth = o.a2[4];
                this.initHeight = o.a2[5];
                this.spritesheetId = o.a2[6];
                this.spriteFrame = o.a2[7];
                this.hasChildMapTypeId = o.a2[8];
                this.className = o.a2[9];
                this.spriteAnimation = o.a2[10];
                this.StarSizesMean= o.a2[11];
                this.StarSizesStd= o.a2[12];
                this.StarHeatMean= o.a2[13];
                this.StarHeatStd= o.a2[14];
                this.PlanetAmountMean= o.a2[15];
                this.PlanetAmountStd= o.a2[16];
                this.PlanetSizesMean= o.a2[17];
                this.PlanetSizesStd= o.a2[18];
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

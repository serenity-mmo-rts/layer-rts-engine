var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {

    var PlanetMappingSimple = function(layer) {

        this.layer = layer;
        this.gameData = layer.gameData;

        this.mapGeneratorParams = layer.mapGeneratorParams();
        this.waterlevel = this.mapGeneratorParams[3];
        this.temperature = this.mapGeneratorParams[4];

        this.noiseLevel = 0;

        // will be internally generated:
        this.landscape = [];

    };

    PlanetMappingSimple.prototype.init = function() {
        this.initVegSpec();
    };

    PlanetMappingSimple.prototype.initVegSpec = function() {

        var deepwaterSize = 15 * this.waterlevel;
        var coastwaterSize = 16 * this.waterlevel;
        var beachSize = 2 * (1 - this.waterlevel);
        var valleySize = 5 * (1 - this.waterlevel);
        var greenSize = 5 * (1 - this.waterlevel);
        var mountainSize = 5 * (1 - this.waterlevel);
        var halficeSize = 20 * (1 - this.waterlevel);
        var iceSize = 30 * (1 - this.waterlevel);

        // normalization constant:
        var sumSize = deepwaterSize + coastwaterSize + beachSize + valleySize + greenSize + mountainSize + iceSize;

        this.landscape = [];
        if (this.temperature < -10) {
            // ice planet:
            this.landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 120, g: 120, b: 255}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 255}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 200, b: 200}, c2: {r: 50, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 170, g: 170, b: 170}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "green"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 220, g: 220, b: 220}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 210, g: 210, b: 210}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});
        }
        else if (this.temperature > 30) {
            // desert planet:
            this.landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 120, b: 20}, c2: {r: 150, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 150, g: 150, b: 50}, c2: {r: 253, g: 76, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "green"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 253, g: 76, b: 0}, c2: {r: 202, g: 51, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});
        }
        else {
            // earth like planet:
            this.landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 120, b: 20}, c2: {r: 50, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "green"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 153, g: 76, b: 0}, c2: {r: 102, g: 51, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
            this.landscape.push({maxV: this.landscape[this.landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});
        }

    };

    PlanetMappingSimple.prototype.convertToRgb = function(heightScaled, tempScaled, humidityScaled) {

        if (heightScaled < 0.01) {
            heightScaled = 0.01;
        }
        if (heightScaled > 0.99) {
            heightScaled = 0.99;
        }

        var resDataScaled = 1-1/(1+heightScaled);
        var c = {r: 1, g: 1, b: 1};

        var i = 0;
        while (i < this.landscape.length - 1 && this.landscape[i].maxV < resDataScaled) {
            i++;
        }
        var minV = (i == 0 ? 0 : this.landscape[i - 1].maxV);
        var a = (resDataScaled - minV) / (this.landscape[i].maxV - minV);
        c.r = this.landscape[i].c1.r * (1 - a) + this.landscape[i].c2.r * (a);
        c.g = this.landscape[i].c1.g * (1 - a) + this.landscape[i].c2.g * (a);
        c.b = this.landscape[i].c1.b * (1 - a) + this.landscape[i].c2.b * (a);

        if (this.landscape[i].cnoise.vol != 0) {
            //Add Noise
            var curNoiseLevel = Math.min(1,Math.max(0, Math.exp( - Math.random() / this.landscape[i].cnoise.vol )));
            c.r = c.r * (1 - curNoiseLevel) + this.landscape[i].cnoise.r * curNoiseLevel;
            c.g = c.g * (1 - curNoiseLevel) + this.landscape[i].cnoise.g * curNoiseLevel;
            c.b = c.b * (1 - curNoiseLevel) + this.landscape[i].cnoise.b * curNoiseLevel;
        }

        if (this.noiseLevel) {
            //Add Noise
            c.r += this.noiseLevel * Math.random();
            c.g += this.noiseLevel * Math.random();
            c.b += this.noiseLevel * Math.random();
        }

        return c;

    };

    exports.PlanetMappingSimple = PlanetMappingSimple;

})(node ? exports : window);
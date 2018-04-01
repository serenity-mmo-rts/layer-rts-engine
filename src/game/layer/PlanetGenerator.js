var node = !(typeof exports === 'undefined');
if (node) {
    var DiamondSquareMap = require('./DiamondSquareMap').DiamondSquareMap;
}

(function (exports) {

    var PlanetGenerator = function(layer) {

        this.layer = layer;
        this.gameData = layer.gameData;

        this.mapGeneratorParams = layer.mapGeneratorParams();
        this.seed = this.mapGeneratorParams[0];
        this.roughness = this.mapGeneratorParams[1];
        this.depthAtNormalZoom = this.mapGeneratorParams[2];
        this.waterlevel = this.mapGeneratorParams[3];
        this.temperature = this.mapGeneratorParams[4];
        this.initDepth = 5;

        this.currIteration = 0;

        this.mapHeight = [];
        this.debugLog = false;
        this.isInitialized = false;

    };

    PlanetGenerator.prototype.init = function() {

        var xpos = 0;
        var ypos = 0;
        var width = Math.pow(2,this.initDepth);
        var height = Math.pow(2,this.initDepth);

        this.mapHeight = [];

        this.mapHeight[0] = new DiamondSquareMap();
        this.mapHeight[0].initSeed(this.seed,this.roughness);

        for (var iter = 1; iter <= this.initDepth; iter++) {
            this.mapHeight[iter] = new DiamondSquareMap();
            this.mapHeight[iter].initNextIter(this.mapHeight[iter-1]);
            this.mapHeight[iter].run(xpos,ypos,width,height,this.initDepth);
            this.currIteration = iter;
        }

    };


    PlanetGenerator.prototype.getSeededCopy = function(iter) {

        if (!this.isInitialized){
            this.init();
        }

        var iter = iter || this.currIteration;

        var planetGen = new PlanetGenerator(this.layer);
        planetGen.mapHeight[iter] = this.mapHeight[iter];
        planetGen.currIteration = this.currIteration;
        return planetGen;

    };

    PlanetGenerator.prototype.getWorldObjects = function(xPos,yPos,width,height,n,type) {
        return [];
    };

    PlanetGenerator.prototype.getMatrix = function(xPos,yPos,width,height,n,type,skipRows) {

        var targetSizeTotal = Math.pow(2, n);
        if (xPos<0){
            var outOfBoundsX = Math.ceil(-xPos/targetSizeTotal);
            xPos += outOfBoundsX*targetSizeTotal;
        }
        if (yPos<0){
            var outOfBoundsY = Math.ceil(-yPos/targetSizeTotal);
            yPos += outOfBoundsY*targetSizeTotal;
        }
        switch (type) {


            case "roughness":
                break;
            case "height":
                return this.getHeight(xPos,yPos,width,height,n,skipRows);
                break;
            case "temp":
                break;
            case "vegetation":
                break;
            case "rgb":
                this.getHeight(xPos,yPos,width,height,n,skipRows);
                return this.getRGB(xPos,yPos,width,height,n,skipRows);
                break;
            case "water":
                break;
        }

    };


    PlanetGenerator.prototype.getHeight = function(xpos,ypos,width,height,depth,skipRows) {

        for (var iter = this.currIteration+1; iter <= depth; iter++) {
            this.mapHeight[iter] = new DiamondSquareMap();
            this.mapHeight[iter].initNextIter(this.mapHeight[iter-1]);

            if (skipRows&&(iter==depth)){
                this.mapHeight[iter].run(xpos,ypos,width,height,depth,true);
            }
            else {
                this.mapHeight[iter].run(xpos,ypos,width,height,depth,false);
            }

            this.currIteration = iter;
        }
        return this.mapHeight[depth];

    };

    PlanetGenerator.prototype.getDepthAtNormalZoom =function(){
        return this.depthAtNormalZoom;
    };

    PlanetGenerator.prototype.getEdgeLength =function(n){
        return  Math.pow(2,n)
    };

    PlanetGenerator.prototype.getZoomLevel =function(n){
        return  Math.pow(2,n-this.depthAtNormalZoom);
    };

    PlanetGenerator.prototype.getCurrentDepth =function(){
        return  this.currIteration;
    };

    PlanetGenerator.prototype.randomUint32 = function(seedArray) {
        // cf. http://jsperf.com/native-and-non-native-random-numbers/5
        var seed1 = seedArray[0];
        var seed2 = seedArray[1];
        var seed3 = seedArray[2];
        var seed4 = seedArray[3];

        var numShift1 = seed1 & 15; //this is the same as seed1 % 16;
        var numShift2 = seed2 & 15;
        var numShift3 = seed3 & 15;
        var numShift4 = seed4 & 15;

        var shifted1 = seed1 >> (numShift2+1);
        var shifted2 = seed2 << (numShift3+2);
        var shifted3 = seed3 << (numShift4+3);
        var shifted4 = seed4 >> (numShift1+4);

        var newVal = shifted1 ^ shifted2 ^ shifted3 ^ shifted4;

        return newVal;
    };

    PlanetGenerator.prototype.random = function (seedArray) {
        var randnum = this.randomUint32(seedArray);
        randnum /= (1 << 30); // convert to number between 0 and 1
        //console.log( randnum );
        return randnum;
    };

    PlanetGenerator.prototype.getHeightVal = function(x, y) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        return this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)];
    };

    PlanetGenerator.prototype.getRGB = function(xPos,yPos,width,height,n,skipRows) {

        var convertToLandscape = (function(){
            var noiseLevel = 0;

            var deepwaterSize = 15;
            var coastwaterSize = 13;
            var beachSize = 2;
            var valleySize = 5;
            var greenSize = 5;
            var mountainSize = 5;
            var halficeSize = 20;
            var iceSize = 30;

            var sumSize = deepwaterSize + coastwaterSize + beachSize + valleySize + greenSize + mountainSize + iceSize;

            var landscape = [];
            landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 120, b: 20}, c2: {r: 50, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "green"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 153, g: 76, b: 0}, c2: {r: 102, g: 51, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
            landscape.push({maxV: landscape[landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});

            var convertToLandscape = function(resDataScaled){
                var resDataScaled = 1-1/(1+resDataScaled);
                var c = {r: 1, g: 1, b: 1};

                var i = 0;
                while (i < landscape.length - 1 && landscape[i].maxV < resDataScaled) {
                    i++;
                }
                var minV = (i == 0 ? 0 : landscape[i - 1].maxV);
                var a = (resDataScaled - minV) / (landscape[i].maxV - minV);
                c.r = landscape[i].c1.r * (1 - a) + landscape[i].c2.r * (a);
                c.g = landscape[i].c1.g * (1 - a) + landscape[i].c2.g * (a);
                c.b = landscape[i].c1.b * (1 - a) + landscape[i].c2.b * (a);

                if (landscape[i].cnoise.vol != 0) {
                    //Add Noise
                    var curNoiseLevel = Math.min(1,Math.max(0, Math.exp( - Math.random() / landscape[i].cnoise.vol )));
                    c.r = c.r * (1 - curNoiseLevel) + landscape[i].cnoise.r * curNoiseLevel;
                    c.g = c.g * (1 - curNoiseLevel) + landscape[i].cnoise.g * curNoiseLevel;
                    c.b = c.b * (1 - curNoiseLevel) + landscape[i].cnoise.b * curNoiseLevel;
                }

                if (noiseLevel) {
                    //Add Noise
                    c.r += noiseLevel * Math.random();
                    c.g += noiseLevel * Math.random();
                    c.b += noiseLevel * Math.random();
                }

                return c;
            };
            return convertToLandscape

        })();

        var sizeX = this.mapHeight[n].sizeX;
        var sizeY = this.mapHeight[n].sizeY;

        var mapR = new Uint8Array(sizeX*sizeY);
        var mapG = new Uint8Array(sizeX*sizeY);
        var mapB = new Uint8Array(sizeX*sizeY);

        var currMapHeight = this.mapHeight[n].map;
        var minVal = this.mapHeight[n].minVal;
        var range = this.mapHeight[n].maxVal - this.mapHeight[n].minVal;

        var yIncrement = 1;
        if (skipRows) {
            yIncrement=2;
        }
        for (var y = 0;y<sizeY;y+=yIncrement){
            var rowIdx = sizeX*y;
            for (var x = 0;x<sizeX;x++){
                var height = currMapHeight[x+rowIdx];
                var heightScaled = (height - minVal) / range;
                var rgb = convertToLandscape(heightScaled);
                mapR[x+rowIdx] = rgb.r;
                mapG[x+rowIdx] = rgb.g;
                mapB[x+rowIdx] = rgb.b;
            }
        }

        return {r: mapR, g: mapG, b: mapB, sizeX: sizeX, sizeY: sizeY};


    };

    exports.PlanetGenerator = PlanetGenerator;

})(node ? exports : window);
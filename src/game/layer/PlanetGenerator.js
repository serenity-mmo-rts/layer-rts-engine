var node = !(typeof exports === 'undefined');
if (node) {
    var DiamondSquareMap = require('./DiamondSquareMap').DiamondSquareMap;
}

(function (exports) {

    var PlanetGenerator = function(layer) {

        this.layer = layer;
        this.gameData = layer.gameData;
        this.seed = layer.mapGeneratorParams[0];
        this.roughness = layer.mapGeneratorParams[1];
        this.depthAtNormalZoom = layer.mapGeneratorParams[2];
        this.waterlevel = layer.mapGeneratorParams[3];
        this.temperature = layer.mapGeneratorParams[4];

        this.mapHeight = [];
        this.mapR = [];
        this.mapG = [];
        this.mapB = [];
        this.mapsCrop = [];
        this.requestedAreaIdx = [];
        this.debugLog = false;

    };
    PlanetGenerator.prototype.getWorldObjects = function(xPos,yPos,width,height,n,type) {
        return [];
    };

    PlanetGenerator.prototype.getMatrix = function(xPos,yPos,width,height,n,type) {

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
                return this.getHeight(xPos,yPos,width,height,n);
                break;
            case "temp":
                break;
            case "vegetation":
                break;
            case "rgb":
                this.getHeight(xPos,yPos,width,height,n);
                return this.getRGB(xPos,yPos,width,height,n);
                break;
            case "water":
                break;
        }

    };


    PlanetGenerator.prototype.getHeight = function(xPos,yPos,width,height,n) {

        this.mapHeight = [];
        this.mapHeight[0] = new DiamondSquareMap(0,xPos,yPos,width,height,[],this.seed );

        // iterate
        for (var iter = 1; iter <= n; iter++) {
            this.mapHeight[iter] = new DiamondSquareMap(iter,xPos,yPos,width,height, this.mapHeight[iter-1] );
        }

        return this.mapHeight[n];

    };

    PlanetGenerator.prototype.getDepthAtNormalZoom =function(){
        return  this.depthAtNormalZoom;
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

    PlanetGenerator.prototype.transfer = function(oldSizeX,oldSizeY) {

        this.mapHeight.push(new Uint32Array(this.sizeX*this.sizeY));
        for (var y = 0;y<oldSizeY;y++){
            var oldRowIdx = oldSizeX*y;
            var newRowIdx = this.sizeX*(y*2);
            for (var x = 0;x<oldSizeX;x++){
                this.mapHeight[this.currIteration][x*2+newRowIdx] = this.mapHeight[this.currIteration-1][x+oldRowIdx];
            }
        }
    };

    PlanetGenerator.prototype.crop = function(cropper,newSizeX,newSizeY,cropRegion) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var reqX1 = cropRegion[0];
        var reqX2 = cropRegion[1];
        var reqY1 = cropRegion[2];
        var reqY2 = cropRegion[3];

        // put data into reshaped smaller array
        var croppedMap = new Uint32Array(newSizeX*newSizeY);
        var newY = -1;
        for(var y=reqY1-cropper;y<=reqY2+cropper;y++ ){
            newY++;
            var newX = -1;
            for(var x=(reqX1-cropper);x<=reqX2+cropper;x++ ){
                newX++;
                croppedMap[(newY*newSizeX)+newX] = this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)];
            }
        }
            this.mapHeight[this.currIteration] = croppedMap;
    };


    PlanetGenerator.prototype.square = function(x, y, scaling) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var neighbors = [
            this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX], // left up
            this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right up
            this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right down
            this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX] // left down
        ];

        var randnum = this.random(neighbors);
        var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
        var newValue = ave + randnum*scaling;

        // check for underflow:
        if (newValue<this.minVal) {
            newValue = this.minVal;
        }

        // check for overflow:
        if (newValue>this.maxVal) {
            newValue = this.maxVal;
        }

        this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;
    };

    PlanetGenerator.prototype.diamond = function(x, y, scaling) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var neighbors = [
            this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // top
            this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX],  // right
            this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // bottom
            this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX]   // left
        ];

        var randnum = this.random(neighbors);
        var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
        var newValue = ave + 2*randnum*scaling;

        // check for underflow:
        if (newValue<this.minVal) {
            newValue = this.minVal;
        }

        // check for overflow:
        if (newValue>this.maxVal) {
            newValue = this.maxVal;
        }

        this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;
    };

    PlanetGenerator.prototype.debugArray = function(sizeX,sizeY) {
        console.log('start')
        for (var i = 0;i<sizeY;i++){
            for (var k=0;k<sizeX;k++){
                console.log(this.mapHeight[this.currIteration][i*sizeX+k]);
            }
        }
        console.log('end')

    };

    PlanetGenerator.prototype.dispArray = function(arr,width) {

        for (var y =0; y < arr.length/width; y ++) {

            var output = '';
            for (var x = 0; x < width; x ++) {
                output += arr[y*width+x] + ' ';
            }
            console.log(output);
        }

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

    PlanetGenerator.prototype.getRGB = function(xPos,yPos,width,height,n) {

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


        this.mapR[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));
        this.mapG[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));
        this.mapB[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));

        for (var y = 0;y<this.sizeY;y++){
            var rowIdx = this.sizeX*y;
            for (var x = 0;x<this.sizeX;x++){
                var height = this.mapHeight[n].map[x+rowIdx];
                var heightScaled = (height - this.minVal) / this.range;
                var rgb = convertToLandscape(heightScaled);
                this.mapR[this.currIteration][x+rowIdx] = rgb.r;
                this.mapG[this.currIteration][x+rowIdx] = rgb.g;
                this.mapB[this.currIteration][x+rowIdx] = rgb.b;
            }
        }

        return {r: this.mapR, g: this.mapG, b: this.mapB};


    };

    exports.PlanetGenerator = PlanetGenerator;

})(node ? exports : window);
var node = !(typeof exports === 'undefined');
if (node) {
    var DiamondSquareMap = require('./DiamondSquareMap').DiamondSquareMap;
    var PlanetMapping = require('./PlanetMapping').PlanetMapping;
    var PlanetMappingSimple = require('./PlanetMappingSimple').PlanetMappingSimple;
}

(function (exports) {

    var PlanetGenerator = function(layer) {

        this.layer = layer;
        this.gameData = layer.gameData;

        this.rgbMapName = "linearMappingOfHeight";

        this.mapGeneratorParams = layer.mapGeneratorParams();
        this.seed = this.mapGeneratorParams[0];
        this.roughness = this.mapGeneratorParams[1];
        this.depthAtNormalZoom = this.mapGeneratorParams[2];
        this.waterlevel = this.mapGeneratorParams[3];
        this.temperature = this.mapGeneratorParams[4];
        this.latituteInterp = 0.9; // TODO: add this as map parameter...
        this.initDepth = 5;

        this.currIteration = 0;

        this.mapHeight = [];
        this.mapTemp = [];
        this.mapHumidity = [];

        this.mappingResolution = 1000;

        this.debugLog = false;
        this.isInitialized = false;

        this.planetMapping = null;
        this.planetMappingSimple = null;

    };

    PlanetGenerator.prototype.setRgbMapName = function(type) {
        this.rgbMapName = type;

        this.planetMapping = null;
        if (type=="vegetationByHeightRanges" && !this.planetMapping) {
            this.planetMapping = new PlanetMapping(this.layer);
            this.planetMapping.init();
        }
        this.planetMappingSimple = null;
        if (type=="linearMappingOfHeight" && !this.planetMapping) {
            this.planetMappingSimple = new PlanetMappingSimple(this.layer);
            this.planetMappingSimple.init();
        }

    };

    PlanetGenerator.prototype.init = function() {

        var xpos = 0;
        var ypos = 0;
        var width = Math.pow(2,this.initDepth);
        var height = Math.pow(2,this.initDepth);

        // slowly increase roughness over scales:
        var roughnessArrHeight = [];
        roughnessArrHeight.push(0.001*this.roughness);
        roughnessArrHeight.push(0.01*this.roughness);
        roughnessArrHeight.push(0.1*this.roughness);
        roughnessArrHeight.push(0.1*this.roughness);
        roughnessArrHeight.push(1*this.roughness);

        this.mapHeight = [];
        this.mapHeight[0] = new DiamondSquareMap();
        this.mapHeight[0].initSeed(this.seed+75, roughnessArrHeight);


        // slowly increase roughness over scales:
        var roughnessArrTemp = [];
        roughnessArrTemp.push(0.001*this.roughness);
        roughnessArrTemp.push(0.001*this.roughness);
        roughnessArrTemp.push(0.01*this.roughness);
        roughnessArrTemp.push(0.01*this.roughness);
        roughnessArrTemp.push(1.5*this.roughness);

        this.mapTemp = [];
        this.mapTemp[0] = new DiamondSquareMap();
        this.mapTemp[0].initSeed(this.seed+43, roughnessArrTemp);


        // slowly increase roughness over scales:
        var roughnessArrHumidity = [];
        roughnessArrHumidity.push(0.001*this.roughness);
        roughnessArrHumidity.push(0.001*this.roughness);
        roughnessArrHumidity.push(0.01*this.roughness);
        roughnessArrHumidity.push(0.01*this.roughness);
        roughnessArrHumidity.push(1.5*this.roughness);

        this.mapHumidity = [];
        this.mapHumidity[0] = new DiamondSquareMap();
        this.mapHumidity[0].initSeed(this.seed+49, roughnessArrHumidity);

        for (var iter = 1; iter <= this.initDepth; iter++) {
            this.mapHeight[iter] = new DiamondSquareMap();
            this.mapHeight[iter].initNextIter(this.mapHeight[iter-1]);
            this.mapHeight[iter].run(xpos,ypos,width,height,this.initDepth);

            this.mapTemp[iter] = new DiamondSquareMap();
            this.mapTemp[iter].initNextIter(this.mapTemp[iter-1]);
            this.mapTemp[iter].run(xpos,ypos,width,height,this.initDepth);

            this.mapHumidity[iter] = new DiamondSquareMap();
            this.mapHumidity[iter].initNextIter(this.mapHumidity[iter-1]);
            this.mapHumidity[iter].run(xpos,ypos,width,height,this.initDepth);

            this.currIteration = iter;
        }

        this.setRgbMapName(this.rgbMapName);

        this.isInitialized = true;

    };

    PlanetGenerator.prototype.getSeededCopy = function(iter) {

        if (!this.isInitialized){
            this.init();
        }

        var iter = iter || this.currIteration;

        var planetGen = new PlanetGenerator(this.layer);
        for (var i=0; i<=iter; i++) {
            planetGen.mapHeight[i] = this.mapHeight[i];
            planetGen.mapTemp[i] = this.mapTemp[i];
            planetGen.mapHumidity[i] = this.mapHumidity[i];
        }
        planetGen.mappingResolution = this.mappingResolution;
        planetGen.planetMapping = this.planetMapping;
        planetGen.planetMappingSimple = this.planetMappingSimple;
        planetGen.isInitialized = this.isInitialized;
        planetGen.mappingMinVal = this.mappingMinVal;
        planetGen.mappingMaxVal = this.mappingMaxVal;
        planetGen.rgbMapName = this.rgbMapName;
        return planetGen;

    };

    PlanetGenerator.prototype.getWorldObjects = function(xPos,yPos,width,height,n,type) {
        return [];
    };

    PlanetGenerator.prototype.getMatrix = function(xPos,yPos,width,height,depth,type,skipRows) {

        var type = this.rgbMapName;
        var targetSizeTotal = Math.pow(2, depth);

        xPos = this.wrapOutOfBounds(xPos, targetSizeTotal);
        yPos = this.wrapOutOfBounds(yPos, targetSizeTotal);

        this.calcMaps(xPos,yPos,width,height,depth,skipRows);

        return this.getVegetationRGB(xPos,yPos,width,height,depth,skipRows,type);
    };

    PlanetGenerator.prototype.wrapOutOfBounds = function(pos, totalSize) {
        if (pos<0){
            var outOfBoundsX = Math.ceil(-pos/totalSize);
            pos += outOfBoundsX*totalSize;
        }
        if (pos>=totalSize){
            var outOfBoundsX = Math.floor(pos/totalSize);
            pos -= outOfBoundsX*totalSize;
        }
        return pos;
    };

    PlanetGenerator.prototype.calcMaps = function(xpos, ypos, width, height, depth, skipRows) {

        for (var iter = this.currIteration+1; iter <= depth; iter++) {
            this.mapHeight[iter] = new DiamondSquareMap();
            this.mapTemp[iter] = new DiamondSquareMap();
            this.mapHumidity[iter] = new DiamondSquareMap();

            this.mapHeight[iter].initNextIter(this.mapHeight[iter-1]);
            this.mapTemp[iter].initNextIter(this.mapTemp[iter-1]);
            this.mapHumidity[iter].initNextIter(this.mapHumidity[iter-1]);

            if (skipRows&&(iter==depth)){
                this.mapHeight[iter].run(xpos,ypos,width,height,depth,true);
                this.mapTemp[iter].run(xpos,ypos,width,height,depth,true);
                this.mapHumidity[iter].run(xpos,ypos,width,height,depth,true);
            }
            else {
                this.mapHeight[iter].run(xpos,ypos,width,height,depth,false);
                this.mapTemp[iter].run(xpos,ypos,width,height,depth,false);
                this.mapHumidity[iter].run(xpos,ypos,width,height,depth,false);
            }

            this.currIteration = iter;
        }

    };

    PlanetGenerator.prototype.getVegetationRGB = function(xPos,yPos,width,height,n,skipRows,type) {

        var targetSizeTotal = Math.pow(2, n);

        var targetSizeX = width;
        var targetSizeY = height;
        if (skipRows) {
            targetSizeY /= 2;
        }

        var mapR = new Uint8Array(targetSizeX*targetSizeY);
        var mapG = new Uint8Array(targetSizeX*targetSizeY);
        var mapB = new Uint8Array(targetSizeX*targetSizeY);

        var sourceSizeX = this.mapHeight[n].sizeX;
        var sourceSizeY = this.mapHeight[n].sizeY;

        var sourceStartIdxX = xPos - this.mapHeight[n].mapsCropsLeft;
        var sourceStartIdxY = yPos - this.mapHeight[n].mapsCropsTop;

        sourceStartIdxX = this.wrapOutOfBounds(sourceStartIdxX, targetSizeTotal);
        sourceStartIdxY = this.wrapOutOfBounds(sourceStartIdxY, targetSizeTotal);

        var currMapHeight = this.mapHeight[n].map;
        var currMapTemp = this.mapTemp[n].map;
        var currMapHumidity = this.mapHumidity[n].map;

        var minVal = this.mapHeight[n].minVal;
        var maxVal = this.mapHeight[n].maxVal;
        var range = maxVal - minVal;

        var ySourceIncrement = 1;
        if (skipRows) {
            ySourceIncrement = 2;
        }

        for (var yTarget = 0, ySource=sourceStartIdxY; yTarget<targetSizeY; yTarget++, ySource+=ySourceIncrement) {
            var startOfRowTarget = targetSizeX * yTarget;
            var startOfRowSource = sourceSizeX * ySource;

            // calculate global y coordinate for latitude interpolation (scaled between 0 and 1):
            var yBetween0And1 = (yPos + ySource) / targetSizeTotal;
            var distFromPoles = 1 - Math.abs(yBetween0And1 - 0.5) * 2;

            for (var xTarget = 0, xSource=sourceStartIdxX; xTarget<targetSizeX; xTarget++, xSource++) {
                var startOfPixelTarget = (startOfRowTarget + xTarget);
                var startOfPixelSource = (startOfRowSource + xSource);

                var heightScaled = (currMapHeight[startOfPixelSource] - minVal) / range;
                var tempScaled = (currMapTemp[startOfPixelSource] - minVal) / range;
                var humidityScaled = (currMapHumidity[startOfPixelSource] - minVal) / range;

                if (this.latituteInterp) {
                    tempScaled = tempScaled * (1 - this.latituteInterp) + distFromPoles * this.latituteInterp;
                }

                switch (type) {
                    case "heightGrayscale":
                        heightScaled = Math.round(heightScaled*255);
                        mapR[startOfPixelTarget] = heightScaled;
                        mapG[startOfPixelTarget] = heightScaled;
                        mapB[startOfPixelTarget] = heightScaled;
                        break;
                    case "tempGrayscale":
                        tempScaled = Math.round(tempScaled*255);
                        mapR[startOfPixelTarget] = tempScaled;
                        mapG[startOfPixelTarget] = tempScaled;
                        mapB[startOfPixelTarget] = tempScaled;
                        break;
                    case "humidityGrayscale":
                        humidityScaled = Math.round(humidityScaled*255);
                        mapR[startOfPixelTarget] = humidityScaled;
                        mapG[startOfPixelTarget] = humidityScaled;
                        mapB[startOfPixelTarget] = humidityScaled;
                        break;
                    case "linearMappingOfHeight":
                        var rgb = this.planetMappingSimple.convertToRgb(heightScaled, tempScaled, humidityScaled);
                        mapR[startOfPixelTarget] = rgb.r;
                        mapG[startOfPixelTarget] = rgb.g;
                        mapB[startOfPixelTarget] = rgb.b;
                        break;
                    case "vegetationByHeightRanges":
                        var rgb = this.planetMapping.convertToRgb(heightScaled, tempScaled, humidityScaled);
                        mapR[startOfPixelTarget] = rgb.r;
                        mapG[startOfPixelTarget] = rgb.g;
                        mapB[startOfPixelTarget] = rgb.b;
                        break;
                }
            }
        }

        return {r: mapR, g: mapG, b: mapB, sizeX: targetSizeX, sizeY: targetSizeY};

    };

    PlanetGenerator.prototype.getGrayscaleRGBfromMap = function(xPos,yPos,width,height,n,skipRows,mapArray) {

        var sizeX = mapArray[n].sizeX;
        var sizeY = mapArray[n].sizeY;

        var mapR = new Uint8Array(sizeX*sizeY);
        var mapG = new Uint8Array(sizeX*sizeY);
        var mapB = new Uint8Array(sizeX*sizeY);

        var currMap = mapArray[n].map;
        var minVal = mapArray[n].minVal;
        var range = mapArray[n].maxVal - mapArray[n].minVal;

        var yIncrement = 1;
        if (skipRows) {
            yIncrement=2;
        }
        for (var y = 0;y<sizeY;y+=yIncrement){
            var rowIdx = sizeX*y;
            for (var x = 0;x<sizeX;x++){
                var val = currMap[x+rowIdx];
                var valScaled = (val - minVal) / range;
                mapR[x+rowIdx] = Math.round(valScaled*255);
                mapG[x+rowIdx] = Math.round(valScaled*255);
                mapB[x+rowIdx] = Math.round(valScaled*255);
            }
        }

        return {r: mapR, g: mapG, b: mapB, sizeX: sizeX, sizeY: sizeY};
    };

    PlanetGenerator.prototype.getRGB = function(xPos,yPos,width,height,n,skipRows) {

        var self = this;

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
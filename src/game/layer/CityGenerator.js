var node = !(typeof exports === 'undefined');
if (node) {
    var DiamondSquareMap = require('./DiamondSquareMap').DiamondSquareMap;
    var PlanetGenerator = require('./PlanetGenerator').PlanetGenerator;
}

(function (exports) {

    var CityGenerator = function(layer) {

        // Call the super constructor.
        PlanetGenerator.call(this, layer);

        this.cityRadius = this.mapGeneratorParams[5];

        this.cityPosX_renderCoord = this.layer.mapType.scale * (this.layer.xPos() - this.layer.yPos());
        this.cityPosY_renderCoord = this.layer.mapType.scale * (this.layer.xPos() + this.layer.yPos());

    };


    /**
     * Inherit from PlanetGenerator and add the correct constructor method to the prototype:
     */
    CityGenerator.prototype = Object.create(PlanetGenerator.prototype);
    var proto = CityGenerator.prototype;
    proto.constructor = CityGenerator;

    CityGenerator.prototype.getSeededCopy = function(iter) {
        var newCityGenerator = new CityGenerator(this.layer);
        newCityGenerator = PlanetGenerator.prototype.getSeededCopy.call(this, iter, newCityGenerator);
        return newCityGenerator;
    };

    CityGenerator.prototype.getMatrix = function(xPos,yPos,width,height,depth,type,skipRows) {
        var matrix = PlanetGenerator.prototype.getMatrix.call(this, xPos,yPos,width,height,depth,type,skipRows);
        return matrix;
    };

    CityGenerator.prototype.renderBgObjects = function () {

    };

    CityGenerator.prototype.getVegetationRGB = function(xPos,yPos,width,height,n,skipRows,type) {

        var targetSizeTotal = Math.pow(2, n);

        // xPos and width are all in coordinates in which the total planet map is spanned from 0 to targetSizeTotal
        // now calc city position and radius in the coordinates of this pixel map at depth n:

        var layerSize = this.layer.width() * this.layer.scale;

        var cityPosX = targetSizeTotal * (this.cityPosX_renderCoord + layerSize / 2) / layerSize;
        var cityPosY = targetSizeTotal * (this.cityPosY_renderCoord + layerSize / 2) / layerSize;

        var cityRadius = targetSizeTotal * this.cityRadius / this.layer.height();
        var cityRadiusSquared = cityRadius * cityRadius;

        var mapsCropsLeft = this.mapHeight[n].mapsCropsLeft;
        var mapsCropsTop = this.mapHeight[n].mapsCropsTop;

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


                // check if this pixel is inside or outside the city:
                var xPosOfPixel = xSource + mapsCropsLeft;
                var yPosOfPixel = ySource + mapsCropsTop;

                var distX = Math.abs(xPosOfPixel - cityPosX);
                var distY = Math.abs(yPosOfPixel - cityPosY);

                distX = this.wrapOutOfBounds(distX, targetSizeTotal);
                distY = this.wrapOutOfBounds(distY, targetSizeTotal);
                if (distX > targetSizeTotal / 2) {
                    distX = targetSizeTotal - distX;
                }
                if (distY > targetSizeTotal / 2) {
                    distY = targetSizeTotal - distY;
                }

                var sqrDist = distX * distX + distY * distY;
                if (sqrDist > cityRadiusSquared) {
                    // this pixel is outside of city radius:
                    mapR[startOfPixelTarget] = mapR[startOfPixelTarget]/3;
                    mapG[startOfPixelTarget] = mapG[startOfPixelTarget]/3;
                    mapB[startOfPixelTarget] = mapB[startOfPixelTarget]/3;
                }
            }
        }

        return {r: mapR, g: mapG, b: mapB, sizeX: targetSizeX, sizeY: targetSizeY};

    };

    exports.CityGenerator = CityGenerator;

})(node ? exports : window);
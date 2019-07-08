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

        function pixelColorFilter(xSource, ySource, mapR, mapG, mapB, startOfPixelTarget) {
            var xPosOfPixel = xSource + mapsCropsLeft;
            var yPosOfPixel = ySource + mapsCropsTop;

            var distX = Math.abs(xPosOfPixel - cityPosX);
            var distY = Math.abs(yPosOfPixel - cityPosY);

            distX = PlanetGenerator.wrapOutOfBounds(distX, targetSizeTotal);
            distY = PlanetGenerator.wrapOutOfBounds(distY, targetSizeTotal);
            if (distX > targetSizeTotal / 2) {
                distX = targetSizeTotal - distX;
            }
            if (distY > targetSizeTotal / 2) {
                distY = targetSizeTotal - distY;
            }

            var sqrDist = distX * distX + distY * distY;
            if (sqrDist > cityRadiusSquared) {
                // this pixel is outside of city radius:
                mapR[startOfPixelTarget] = mapR[startOfPixelTarget] / 3;
                mapG[startOfPixelTarget] = mapG[startOfPixelTarget] / 3;
                mapB[startOfPixelTarget] = mapB[startOfPixelTarget] / 3;
            }
        }

        var rgb = PlanetGenerator.prototype.getVegetationRGB.call(this, xPos,yPos,width,height,n,skipRows,type,pixelColorFilter);
        return rgb;
    };

    exports.CityGenerator = CityGenerator;

})(node ? exports : window);
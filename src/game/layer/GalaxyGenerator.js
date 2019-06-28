var node = !(typeof exports === 'undefined');
if (node) {
    var RandomNumber = require('../RandomNumber').RandomNumber;
    var MapObject = require('../MapObject').MapObject;
}

(function (exports) {

    var GalaxyGenerator = function(layer) {

        this.seed = (1 << 15);
        this.layer = layer;
        this.gameData = layer.gameData;

        this.nrOfSolarSystems = 700;
        this.starTypes = ["redDwarf","normalStar","doubleSystem","neutronStar","blackHole"];
        this.distributionofStarTypes = [0.2,0.4,0.6,0.8,1.0];
        this.worldObjects = [];
        // this.generateGalaxy();

        this.isInitialized = false;
    };


    GalaxyGenerator.prototype.init = function () {
        this.generateGalaxy();
        this.isInitialized = true;
    };


    GalaxyGenerator.prototype.generateGalaxy = function(){

        var layer = this.gameData.layers.get(this.layer._id());
        var mapData = layer.mapData;

        var rng = new RandomNumber();
        rng.setSeed(this.seed);

        var numArms = 5;
        var minRad = 0.08;
        var stdInArm = 0.2; // between 0 and 1
        for (var i = 1; i < this.nrOfSolarSystems; i++) {
            var starType = rng.rand();
            console.log("starType="+starType)
            var usedStar = null;
            if (starType <= this.distributionofStarTypes[0]) {
                usedStar = this.gameData.objectTypes.get(this.starTypes[0]);
            }
            else if (starType <= this.distributionofStarTypes[1]) {
                usedStar = this.gameData.objectTypes.get(this.starTypes[1]);
            }
            else if (starType <= this.distributionofStarTypes[2]) {
                usedStar = this.gameData.objectTypes.get(this.starTypes[2]);
            }
            else if (starType <= this.distributionofStarTypes[3]) {
                usedStar = this.gameData.objectTypes.get(this.starTypes[3]);
            }
            else {
                usedStar = this.gameData.objectTypes.get(this.starTypes[4]);
            }

            var centerDistNormalized = minRad + Math.pow(rng.rand(), 1.4) * (1 - minRad);
            var centerDist = (centerDistNormalized * this.layer.width()) / 4;
            var arm = Math.floor(rng.rand() * numArms);
            var posInArm = rng.randn() * stdInArm / centerDistNormalized;
            var armRotAngle = 0.5 * Math.log(centerDistNormalized);
            var angle = 5 * armRotAngle + 2 * Math.PI * (posInArm + arm) / numArms;
            var posx = (Math.cos(angle) * centerDist);
            var posy = (Math.sin(angle) * centerDist);

            var subLayerSeed = rng.rand();
            var starTemperature = usedStar.StarHeatMean + (rng.randn() * usedStar.StarHeatStd);
            var starSize = usedStar.StarSizesMean + (rng.randn() * usedStar.StarSizesStd);
            var planetAmount = usedStar.PlanetAmountMean + (rng.randn() * usedStar.PlanetAmountStd);
            planetAmount = Math.max(0, Math.round(planetAmount));

            var parentOfMapObjects = this.gameData.layers.get(this.layer._id()).mapData.mapObjects;

            var mapObjId = "mapObj_" + layer._id() + "_system" + i;
            var sublayerId = "sublayer_" + layer._id() + "_system" + i;

            var mapObj = mapData.mapObjects.get(mapObjId);
            if (!mapObj) {
                //console.log("add solar system...");
                // create solar system Object
                var mapObj = new MapObject(parentOfMapObjects, {
                    _id: mapObjId,
                    mapId: this.layer._id(),
                    x: posx,
                    y: posy,
                    objTypeId: usedStar._id,
                    userId: 0,
                    sublayerId: sublayerId,
                    mapGeneratorParams: [subLayerSeed, starTemperature, starSize, planetAmount, usedStar.PlanetSizesMean, usedStar.PlanetSizesStd]
                });
                mapObj.setPointers();
                mapData.addObject(mapObj);
                mapObj.embedded(true);
                mapObj.afterFinishedBuilding();
            }
        }
    };

    GalaxyGenerator.prototype.getWorldObjects = function () {
        if (!this.isInitialized){
            this.generateGalaxy();
        }
        return this.worldObjects;
    };




    exports.GalaxyGenerator = GalaxyGenerator;

})(node ? exports : window);
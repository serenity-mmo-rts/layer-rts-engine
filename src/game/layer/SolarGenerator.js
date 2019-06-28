var node = !(typeof exports === 'undefined');
if (node) {
    var RandomNumber = require('../RandomNumber').RandomNumber;
    var MapObject = require('../MapObject').MapObject;
}

(function (exports) {

    var SolarGenerator = function(layer) {
        // subLayerSeed,starTemperature,starSize,planetAmount,planetSizeMean,planetSizeStd

        this.layer = layer;
        this.gameData = layer.gameData;
        this.mapGeneratorParams = layer.mapGeneratorParams();

        this.seed = this.mapGeneratorParams[0];
        this.starTemperature = this.mapGeneratorParams[1];
        this.starSize = this.mapGeneratorParams[2];
        this.planetAmount = this.mapGeneratorParams[3];
        this.planetSizeMean = this.mapGeneratorParams[4];
        this.planetSizeStd = this.mapGeneratorParams[5];
        this.worldObjects = [];

        this.isInitialized = false;
    };

    SolarGenerator.prototype.init = function () {
        this.generateSolarSystem();
        this.isInitialized = true;
    };


    SolarGenerator.prototype.generateSolarSystem = function(){

        var layer = this.gameData.layers.get(this.layer._id());
        var mapData = layer.mapData;

        var rng = new RandomNumber();
        rng.setSeed(this.seed);

        this.planetDistanceMean = 100/(this.planetAmount+1);
        this.planetDistanceStd = this.planetDistanceMean/2;
        this.planetSizeLinearIncrease = 1/15; // with distance from sun
        this.planetMinSize = 10;
        this.planetMaxSize =20;
        this.planetSizes =[];
        this.planetTemperatures =[];

        for (var i= 0; i<this.planetAmount;i++) {
            // calc planet Radius
            var distToCoM = (this.planetDistanceMean * (i + 1)) + (rng.randn() * this.planetDistanceStd);
            if (i==0) {
                // for now just set the sun in CoM
                distToCoM = 0;
            }
            // calc planet Angle
            var planetAnlge = rng.rand() * (2 * Math.PI);
            // calc X and Y position from radius and angle
            var planetXPos = distToCoM * Math.cos(planetAnlge)*100;
            var planetYPos = distToCoM * Math.sin(planetAnlge)*100;

            // calc planet Size
            var planetSize = Math.round((this.planetSizeMean) + (rng.randn()*this.planetSizeStd) + (distToCoM*this.planetSizeLinearIncrease));
            if (planetSize < this.planetMinSize) {
                planetSize = this.planetMinSize;
            }
            else if (planetSize > this.planetMaxSize) {
                planetSize = this.planetMaxSize;
            }
            this.planetSizes.push(planetSize);

            // calc planet Temperatur
            var avgTemperature = (1 / distToCoM) * this.starTemperature;
            this.planetTemperatures.push(avgTemperature);

            // random seed for sublayer
            var subLayerSeed = 170000000 + Math.round(10000*rng.rand());

            // type
            var subLayerTypeSelection = rng.rand();
            var objTypeId = null;
            if (i==0) {
                objTypeId = "sunPlanet";
            }
            else{
                if (subLayerTypeSelection > 0.7) {
                    objTypeId = "earthPlanet";
                }
                else if (subLayerTypeSelection > 0.3) {
                    objTypeId = "marsPlanet";
                }
                else {
                    objTypeId = "moonPlanet";
                }
            }

            // water level: (between 0.2 and 0.8)
            var waterLevel = 0.5 + 0.25 * rng.randn();
            if (waterLevel<0) {
                waterLevel=0;
            }
            if (waterLevel>1) {
                waterLevel=1;
            }

            // roughness: make sure to only vary slightly from 10000
            var roughness = 10000 + Math.round(1000 * rng.randn());
            if (roughness<0) {
                roughness=0;
            }

            var parentOfMapObjects = this.gameData.layers.get(this.layer._id()).mapData.mapObjects;

            var mapObjId = "mapObj_" + layer._id() + "_planet" + i;
            var sublayerId = "sublayer_" + layer._id() + "_planet" + i;

            var mapObj = mapData.mapObjects.get(mapObjId);

            var mapGeneratorParams = [subLayerSeed,roughness,planetSize,waterLevel,avgTemperature];

            if (!mapObj) {
                console.log("add planet...");
                // create planet Object
                var mapObj = new MapObject(parentOfMapObjects, {
                    _id: mapObjId,
                    mapId: this.layer._id,
                    x: planetXPos,
                    y: planetYPos,
                    objTypeId: objTypeId,  ///TODO here we must add a selection mechanism for different planet types
                    userId: 0,
                    sublayerId: sublayerId,
                    mapGeneratorParams: mapGeneratorParams

                });
                mapObj.setPointers();
                mapData.addObject(mapObj);
                mapObj.embedded(true);
                mapObj.afterFinishedBuilding();
            }
        }

        //this.worldObjects.push(sun);

    };

    SolarGenerator.prototype.getWorldObjects = function () {
        if (!this.isInitialized){
            this.generateSolarSystem();
        }
        return this.worldObjects;
    };






    exports.SolarGenerator = SolarGenerator;

})(node ? exports : window);
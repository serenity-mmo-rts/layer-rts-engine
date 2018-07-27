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
        this.seed = layer.mapGeneratorParams[0];
        this.starTemperature = layer.mapGeneratorParams[1];
        this.starSize = layer.mapGeneratorParams[2];
        this.planetAmount = layer.mapGeneratorParams[3];
        this.planetSizeMean = layer.mapGeneratorParams[4];
        this.planetSizeStd = layer.mapGeneratorParams[5];
        RandomNumber.setSeed(this.seed);
        this.worldObjects = [];
    };

    SolarGenerator.prototype.init = function () {

    };


    SolarGenerator.prototype.generateSolarSystem = function(){

        this.planetDistanceMean = 100/(this.planetAmount+1);
        this.planetDistanceStd = this.planetDistanceMean/2;
        this.temperatureDecay = "linear";
        this.planetSizeLinearIncrease = 1/15; // with distance from sun
        this.planetMinSize = 10;
        this.planetMaxSize =20;
        this.planetRadius =[];
        this.planetAnlges =[];
        this.planetXPos =[];
        this.planetYPos =[];
        this.planetSizes =[];
        this.planetTemperatures =[];

        for (var i= 0; i<this.planetAmount;i++) {
            // calc planet Radius
            this.planetRadius.push((this.planetDistanceMean * (i + 1)) + (RandomNumber.randn() * this.planetDistanceStd));
            // calc planet Angle
            this.planetAnlges.push(RandomNumber.rand() * (2 * Math.PI));
            // calc X and Y position from radius and angle
            this.planetXPos.push(this.planetRadius[i] * Math.cos(this.planetAnlges[i])*100); // -Hack
            this.planetYPos.push(this.planetRadius[i] * Math.sin(this.planetAnlges[i])*100); // -Hack

            // calc planet Size
            var size = Math.round((this.planetSizeMean) + (RandomNumber.randn()*this.planetSizeStd) + (this.planetRadius[i]*this.planetSizeLinearIncrease));
            if (size < this.planetMinSize) {
                size = this.planetMinSize;
            }
            else if (size > this.planetMaxSize) {
                size = this.planetMaxSize;
            }
            this.planetSizes.push(size);

            // calc planet Temperatur
            if (this.temperatureDecay == "linear") {
                this.planetTemperatures.push((1 / this.planetRadius[i]) * this.starTemperature);
            }
            // random seed for sublayer
            var subLayerSeed = RandomNumber.rand();
            // create planet Object
            var mapObj = new MapObject(this.gameData, {
                _id: "planet" + i + "In" + this.layer._id,
                mapId: this.layer._id,
                x: this.planetXPos[i],
                y: this.planetYPos[i],
                objTypeId: "earthPlanet",  ///TODO here we must add a selection mechanism for different planet types
                userId: 0,
                mapGeneratorParams: [subLayerSeed,this.planetTemperatures[i],this.planetSizes[i]]

            });
            mapObj.setPointers();
            this.gameData.layers.get(this.layer._id).mapData.addObject(mapObj);
            this.worldObjects.push(mapObj);
        }

        // add sun
        /**
        this.worldObjects.push(new MapObject(this.gameData, {
            _id: "sunIn" + this.layer._id,
            mapId: this.layer._id,
            x: 0,
            y: 0,
            objTypeId: "sunPlanet",
            userId: 0,
            mapGeneratorParams: [subLayerSeed, this.starTemperature, this.starSize]

        }));
         **/
    };

    SolarGenerator.prototype.getWorldObjects = function () {
        if (this.worldObjects.length == 0){
            this.generateSolarSystem();
        }
        return this.worldObjects;
    };






    exports.SolarGenerator = SolarGenerator;

})(node ? exports : window);
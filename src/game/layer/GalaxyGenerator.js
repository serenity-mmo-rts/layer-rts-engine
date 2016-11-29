var node = !(typeof exports === 'undefined');
if (node) {
    var RandomNumber = require('../RandomNumber').RandomNumber;
    var MapObject = require('../MapObject').MapObject;
}

(function (exports) {

    var GalaxyGenerator = function(layer) {

        //this.seed = (1 << 15);
        this.layer = layer;
        this.gameData = layer.gameData;
        this.seed = 0.5;

        this.nrOfSolarSystems = 2000;
        this.starTypes = ["redDwarf","normalStar","doubleSystem","neutronStar","blackHole"];
        this.distributionofStarTypes = [0.2,0.7,0.95,0.09,1];
        this.worldObjects = [];
        // this.generateGalaxy();
    };

    GalaxyGenerator.prototype.generateGalaxy = function(){
        RandomNumber.setSeed(this.seed);
        var numArms = 5;
        var minRad = 0.01;
        var stdInArm = 0.2; // between 0 and 1
        for (var i = 1; i < this.nrOfSolarSystems; i++) {
            var starType = RandomNumber.rand();
            if (starType<=this.distributionofStarTypes[0]){
                var usedStar = this.gameData.objectTypes.get(this.starTypes[0]);
            }
            else if (starType<=this.distributionofStarTypes[1]){
                var usedStar = this.gameData.objectTypes.get(this.starTypes[1]);
            }
            else if (starType<=this.distributionofStarTypes[2]){
                var usedStar = this.gameData.objectTypes.get(this.starTypes[2]);
            }
            else if (starType<=this.distributionofStarTypes[3]){
                var usedStar = this.gameData.objectTypes.get(this.starTypes[3]);
            }
            else{
                var usedStar = this.gameData.objectTypes.get(this.starTypes[4]);
            }

            var centerDistNormalized = minRad + Math.pow(RandomNumber.rand(),1.4)*(1-minRad);
            var centerDist = (centerDistNormalized*this.layer.width)/4;
            var arm = Math.floor(RandomNumber.rand()*numArms);
            var posInArm = RandomNumber.randn()*stdInArm/centerDistNormalized;
            var armRotAngle = 0.5*Math.log(centerDistNormalized);
            var angle = 5*armRotAngle + 2*Math.PI*( posInArm  + arm) / numArms;
            var posx = (Math.cos(angle) * centerDist);
            var posy = (Math.sin(angle) * centerDist);

            var subLayerSeed = RandomNumber.rand();
            var starTemperature = usedStar._StarHeatMean+(RandomNumber.randn()*usedStar._StarHeatStd);
            var starSize = usedStar._StarSizesMean+(RandomNumber.randn()*usedStar._StarSizesStd);
            var planetAmount = usedStar._PlanetAmountMean+(RandomNumber.randn()*usedStar._PlanetAmountStd);

            this.worldObjects.push(new MapObject(this.gameData,{
                _id: "galaxyStar01inst" + i,
                mapId: this.layer._id,
                x: posx,
                y: posy,
                objTypeId: usedStar._id,
                userId: 0,
                _blocks: {
                    Sublayer: {
                        mapGeneratorParams: [subLayerSeed,starTemperature,starSize,planetAmount,usedStar._PlanetSizesMean,usedStar._PlanetSizesStd]
                    }
                }
            }));
        }
    };

    GalaxyGenerator.prototype.getWorldObjects = function () {
        if (this.worldObjects.length == 0){
            this.generateGalaxy();
        }
        return this.worldObjects;
    };




    exports.GalaxyGenerator = GalaxyGenerator;

})(node ? exports : window);
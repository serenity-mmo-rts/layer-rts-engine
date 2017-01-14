var node = !(typeof exports === 'undefined');
if (node) {
    var DiamondSquareMap = require('./DiamondSquareMap').DiamondSquareMap;
    var PlanetGenerator = require('./PlanetGenerator').PlanetGenerator;
}

(function (exports) {

    var CityGenerator = function(layer) {


        // Call the super constructor.
        PlanetGenerator.call(this, layer);


    };


    /**
     * Inherit from PlanetGenerator and add the correct constructor method to the prototype:
     */
    CityGenerator.prototype = Object.create(PlanetGenerator.prototype);
    var proto = CityGenerator.prototype;
    proto.constructor = CityGenerator;



    exports.CityGenerator = CityGenerator;

})(node ? exports : window);
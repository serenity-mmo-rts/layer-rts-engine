var node = !(typeof exports === 'undefined');
if (node) {

    var MapObject = require('./mapObjects/MapObject').MapObject;
}

(function (exports) {
    var Society = function (gameData) {
       var x = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
       var HealthToHappiness =  new MappingFunction(x,[])

    }

    Society.prototype = {


    }

    exports.Society=Society;

})(node ? exports : window);

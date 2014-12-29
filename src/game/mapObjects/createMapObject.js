var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var ModelFactory = require('./ModelFactory').ModelFactory;
    var ModelHub = require('./ModelHub').ModelHub ;
    var ModelScienceCenter = require('./ModelScienceCenter').ModelScienceCenter;
    var ModelSublayer = require('./ModelSublayer').ModelSublayer;
    var ModelUnitFactory = require('./ModelUnitFactory').ModelUnitFactory;
}



(function (exports) {



    exports.createMapObject= function(gameData,initObj) {
        var object = null;
        var className = gameData.objectTypes.get(initObj.objTypeId)._className;
        if (className == "Factory") {
                object = new ModelFactory(gameData,initObj);
        }
        else if (className ==  "Hub") {
                object = new ModelHub(gameData,initObj);
        }
        else if (className ==  "ScienceCenter") {
                object = new ModelScienceCenter(gameData,initObj);
        }
        else if (className ==  "Sublayer") {
                object = new ModelSublayer(gameData,initObj);
        }
        else if (className ==  "UnitFactory") {
                object = new ModelUnitFactory(gameData,initObj);
        }

        return object;
    };


})(typeof exports === 'undefined' ? window : exports);

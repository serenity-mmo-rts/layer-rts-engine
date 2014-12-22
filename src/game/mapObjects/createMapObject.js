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
            if (node) {
                object = new ModelFactory.ModelFactory(gameData,initObj);
            }
            else {
                object = new ModelFactory(gameData,initObj);
            }
        }
        else if (className ==  "Hub") {
            if (node) {
                object = new ModelHub.ModelHub(gameData,initObj);
            }
            else {
                object = new ModelHub(gameData,initObj);
            }
        }
        else if (className ==  "ScienceCenter") {
            if (node) {
                object = new ModelScienceCenter.ModelScienceCenter(gameData,initObj);
            }
            else {
                object = new ModelScienceCenter(gameData,initObj);
            }
        }
        else if (className ==  "Sublayer") {
            if (node) {
                object = new ModelSublayer.ModelSublayer(gameData,initObj);
            }
            else {
                object = new ModelSublayer(gameData,initObj);
            }
        }
        else if (className ==  "UnitFactory") {
            if (node) {
                object = new ModelUnitFactory.ModelUnitFactory(gameData,initObj);
            }
            else {
                object = new ModelUnitFactory(gameData,initObj);
            }
        }

        return object;
    };


})(typeof exports === 'undefined' ? window : exports);

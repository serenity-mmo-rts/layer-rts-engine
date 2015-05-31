var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./MapObject').MapObject;
    var UserObject = require('./buildingBlocks/UserObject').UserObject;

    var ResourceProduction = require('./buildingBlocks/ResourceProduction').ResourceProduction;
    var HubNode = require('./buildingBlocks/HubNode').HubNode ;
    var TechProduction = require('./buildingBlocks/TechProduction').TechProduction;
    var Sublayer = require('./buildingBlocks/Sublayer').Sublayer;
}



(function (exports) {



    exports.createMapObject= function(gameData,initObj) {
        var object = null;
        var blocks = gameData.objectTypes.get(initObj.objTypeId)._buildingBlocks.key();
        var properties = gameData.objectTypes.get(initObj.objTypeId)._buildingBlocks.value();

        object = new MapObject(gameData, initObj);

    };


})(typeof exports === 'undefined' ? window : exports);

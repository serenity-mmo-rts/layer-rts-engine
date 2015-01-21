var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var AdditiveFeature = require('./AdditiveFeature').AdditiveFeature;
    var MultiplierFeature = require('./MultiplierFeature').MultiplierFeature;
    var AbstractFeature = require('./AbstractFeature').AbstractFeature;

}



(function (exports) {



    exports.createGameFeature = function(gameData,initObj) {
        var feature = null;
        if (initObj._type == "MultiplierFeature") {
            if (node) {
                feature = new MultiplierFeature.MultiplierFeature(gameData,initObj);
            }
            else {
                feature = new MultiplierFeature(gameData,initObj);
            }
        }

        else if (initObj._type == "AdditiveFeature") {
            if (node) {
                feature = new AdditiveFeature.AdditiveFeature(gameData,initObj);
            }
            else {
                feature = new AdditiveFeature(gameData,initObj);
            }
        }
        return feature;
    };


})(typeof exports === 'undefined' ? window : exports);

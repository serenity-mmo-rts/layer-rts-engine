
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}



(function (exports) {

    var SoilPuller = function (mapObj,initObj){

        this._mapObj = mapObj;
        this._soil_typeId=null;
        this._soil_available=0;
        this._soilDepletedInSec = 0;
        this._amount_in_from_soil=0;
        this._soil_effective_in=0;

        };

    SoilPuller.prototype= {

        _getSoilTypeId: function(){

        },

        _getAmountSoilAvailable: function(){


        },

        _getSoilTypeId: function(){

        },


        extract_soil_resources: function(typeId,requested) {

            var output
            return output
        },

        calculateDepletion: function() {

        },



        save: function () {

            var o = {_soil_typeId: this._soil_typeId,
                _soil_available: this._soil_available,
                _soilDepletedInSec: this._soilDepletedInSec,
                _amount_in_from_soil: this._amount_in_from_soil,
                _soil_effective_in: this._soil_effective_in

            };

            return o;
        },


        load: function (o) {
            this._soil_typeId = o._soil_typeId;
            this._soil_available = o._soil_available;
            this._soilDepletedInSec = o._soilDepletedInSec;
            this._amount_in_from_soil = o._amount_in_from_soil;
            this._soil_effective_in = o._soil_effective_in;

            if (o.hasOwnProperty("a")) {
                this._level = o.a[0];
                this._state = o.a[1];
                this._feature = new FeatureModel(this.gameData,o.a[2]);

            }


            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
                if (this._feature == null){
                    this.createFeature();
                }

            }
            this._mapObj =  this.gameData.layers.get(this._mapId).mapData.mapObjects.get(this._objectId);
            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }

        }

    }

    exports.SoilPuller = SoilPuller;

})(typeof exports === 'undefined' ? window : exports);
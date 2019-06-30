var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Sublayer = function (parent, type) {
        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 22;
    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Sublayer.prototype = Object.create(AbstractBlock.prototype);
    var proto = Sublayer.prototype;
    proto.constructor = Sublayer;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            subLayerType: null
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {subLayerMapId: null},
            {mapGeneratorParams: null}
        ];
    };

    /**
     * this method is called after this block was build (or after the mapObject was build).
     * @returns {*}
     */
    proto.afterFinishedBuilding = function () {

        if (node) {

            var gameData = this.getGameData();
            var parentMap = this.getMap();

            var mapGeneratorParams = this.parent.mapGeneratorParams();
            if (!mapGeneratorParams) {
                // this is a new user object:
                if (this.subLayerType == "cityMapType01") {
                    // cities are initialized with the planet parameters, plus the city size:
                    mapGeneratorParams = parentMap.mapGeneratorParams().slice();
                    mapGeneratorParams.push(gameData.objectTypes.get(this.parent.objTypeId()).initHeight);
                }
            }

            var sublayerParams = {
                _id: this.parent.sublayerId(),
                parentObjId: this.parent._id(),
                xPos: this.parent.x(),
                yPos: this.parent.y(),
                width: parentMap.width,
                height: parentMap.height,
                mapTypeId: this.subLayerType,
                parentMapId: parentMap._id(),
                mapGeneratorParams: mapGeneratorParams
            };

            parentMap.createSublayer(sublayerParams);
        }

        // Also call the super method.
        AbstractBlock.prototype.afterFinishedBuilding.call(this);

    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Sublayer.prototype.finalizeBlockClass('Sublayer');
    exports.Sublayer = Sublayer

})(typeof exports === 'undefined' ? window : exports);

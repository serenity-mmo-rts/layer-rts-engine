var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var SoilPuller = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    SoilPuller.prototype = Object.create(AbstractBlock.prototype);
    var proto = SoilPuller.prototype;
    proto.constructor = SoilPuller;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            soilTypeIds: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {soilEffectiveIn: []}, // in amount per sec
            {soilAvailable: []}
        ];
    };

    /**
     *
     * @param soilTypeId
     * @returns {number}
     */
    proto.getSoilDepletedIn = function(soilTypeId) {
        return this.soilAvailable / this.soilEffectiveIn;
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SoilPuller.prototype.finalizeBlockClass('SoilPuller');
    exports.SoilPuller = SoilPuller

})(typeof exports === 'undefined' ? window : exports);

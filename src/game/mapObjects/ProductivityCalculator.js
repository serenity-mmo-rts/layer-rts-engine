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
    var ProductivityCalculator = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 22;

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ProductivityCalculator.prototype = Object.create(AbstractBlock.prototype);
    var proto = ProductivityCalculator.prototype;
    proto.constructor = ProductivityCalculator;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {

        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [

        ];
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ProductivityCalculator.prototype.finalizeBlockClass('ProductivityCalculator');
    exports.ProductivityCalculator = ProductivityCalculator

})(typeof exports === 'undefined' ? window : exports);

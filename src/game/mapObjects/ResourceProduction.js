var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var ResourceProduction = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.productivity = ko.observable(1);


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ResourceProduction.prototype = Object.create(AbstractBlock.prototype);
    var proto = ResourceProduction.prototype;
    proto.constructor = ResourceProduction;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            resInIds: ["iron", "oxygen"],
            resInPerSec: [2, 3],
            resOutIds: ["carbon"],
            resOutPerSec: [1],
            capacityScaling: 1
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {productionSpeed: 0},
            {productivityCap: 1}
        ];
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceProduction.prototype.finalizeBlockClass('ResourceProduction');
    exports.ResourceProduction = ResourceProduction

})(typeof exports === 'undefined' ? window : exports);

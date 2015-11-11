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
    var HubNode = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 'test';

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubNode.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubNode.prototype;
    proto.constructor = HubNode;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            canBuildConnectionTypeId: null,
            minRange: 0,
            maxRange: 1000,
            connBuildTimePerDist: 1
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {testState1: 5},
            {testState2: this.maxRange/2}
        ];
    };

    /**
     * Get the maximum range of this hub
     * @returns {number}
     */
    proto.getMaxRange = function () {
        return this.maxRange;
    };

    /**
     * get the build time of connections from this hub.
     * @returns {number}
     */
    proto.getConnBuildTimePerDist = function () {
        return this.connBuildTimePerDist;
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubNode.prototype.finalizeBlockClass('HubNode');
    exports.HubNode = HubNode;

})(typeof exports === 'undefined' ? window : exports);

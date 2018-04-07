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
    var HubConnectivity = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.connectedObjIds = {}; // key=objId, value=false if in production or true if connected

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubConnectivity.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubConnectivity.prototype;
    proto.constructor = HubConnectivity;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            numPorts: 1
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
     * Returns the object ids to which this object is connected
     * @returns {{ids: bool}}
     */
    proto.getObjectsConnected = function(){
        return this.connectedObjIds;
    };

    /**
     * Returns the number of free ports
     * @returns {number}
     */
    proto.getFreePorts = function(){
        return this.numPorts - Object.keys(this.connectedObjIds).length;
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubConnectivity.prototype.finalizeBlockClass('HubConnectivity');
    exports.HubConnectivity = HubConnectivity

})(typeof exports === 'undefined' ? window : exports);
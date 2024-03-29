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
            {connectionIds: []},
            {hubSystemId: null}
        ];
    };


    proto.changeHubSystemId = function(hubSystemId) {
        if (this.hubSystemId() != hubSystemId) {

            var mapData = this.getMap().mapData;
            if (this.hubSystemId()) {
                mapData.layer.blocks.HubSystemManager.hubList.get(this.hubSystemId()).removeFromHubSystem(this.parent);
            }
            mapData.layer.blocks.HubSystemManager.hubList.get(hubSystemId).addToHubSystem(this.parent);

            this.hubSystemId(hubSystemId);
            if (this.parent.blocks.hasOwnProperty('ResourceManager')) {
                this.parent.blocks.ResourceManager.changeHubSystemId(hubSystemId);
            }

            // change all connected Objects to the same hubSystemId recursively:
            var connectionIds = this.connectionIds();
            for (var i= 0, len=connectionIds.length; i<len; i++) {
                mapData.mapObjects.get(connectionIds[i]).blocks.Connection.changeHubSystemId(hubSystemId);
            }
        }
    };

    proto.resetHelpers = function(){
        if (this.parent.embedded() && this.hubSystemId()) {
            var mapData = this.getMap().mapData;
            var hubSystem = mapData.layer.blocks.HubSystemManager.hubList.get(this.hubSystemId());
            if (hubSystem) {
                hubSystem.addToHubSystem(this.parent);
            }
        }
    };

    /**
     * Returns the number of free ports
     * @returns {number}
     */
    proto.getFreePorts = function(){
        return this.numPorts - this.connectionIds().length;
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubConnectivity.prototype.finalizeBlockClass('HubConnectivity');
    exports.HubConnectivity = HubConnectivity

})(typeof exports === 'undefined' ? window : exports);
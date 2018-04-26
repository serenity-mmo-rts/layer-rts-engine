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
    var Connection = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Connection.prototype = Object.create(AbstractBlock.prototype);
    var proto = Connection.prototype;
    proto.constructor = Connection;

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
            { connectedFrom: null},    // id encoded. this has to be a hub
            { connectedTo: null}    // id encoded. can be any other object or hub}
        ];
    };

    proto.setPointers = function(){
        var self= this;
        this.connectedFrom.subscribe(function(newValue) {
            self.setConnectionPoints();
        });
        this.connectedTo.subscribe(function(newValue) {
            self.setConnectionPoints();
        });
        this.parent.embedded.subscribe(function(newValue) {
            self.setConnectionPoints();
        });
        self.setConnectionPoints();
    };

    proto.setConnectionPoints = function(){
        var mapData = this.getMap().mapData;
        //update the helper vars of the connected objects:
        if (this.parent.embedded()) {
            var isConnectionFinished = (this.parent.state() >= 2);
            if (this.connectedFrom() != null && this.connectedTo() != null) {
                var sourceHub = mapData.mapObjects.get(this.connectedFrom());
                var targetObj = mapData.mapObjects.get(this.connectedTo());
                sourceHub.blocks.HubConnectivity.connectedObjIds[this.connectedTo()] = isConnectionFinished;
                targetObj.blocks.HubConnectivity.connectedObjIds[this.connectedFrom()] = isConnectionFinished;
            }
        }
    };

    proto.getObjectsConnected = function(){
        return [this.connectedFrom(), this.connectedTo() ];
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Connection.prototype.finalizeBlockClass('Connection');
    exports.Connection = Connection

})(typeof exports === 'undefined' ? window : exports);

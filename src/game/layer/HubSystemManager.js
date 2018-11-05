
var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var ResourceStorage = require('../mapObjects/ResourceStorage').ResourceStorage;
    var HubSystem = require('./HubSystem').HubSystem;
    var GameList = require('../GameList').GameList;
}



(function (exports) {



    var HubSystemManager = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.hubList = new GameList(this.getGameData(), HubSystem, false, false, this, 'hubList');

        this.hubSystems = [];

    };



    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubSystemManager.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubSystemManager.prototype;
    proto.constructor = HubSystemManager;



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
    HubSystemManager.prototype.finalizeBlockClass('HubSystemManager');
    exports.HubSystem = HubSystemManager;

})(typeof exports === 'undefined' ? window : exports);
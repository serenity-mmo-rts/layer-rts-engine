var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var ResourceStorage = require('./ResourceStorage').ResourceStorage;
    var GameList = require('../GameList').GameList;
    ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var ResourceStorageManager = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.layer = null;
        this.ressources = {};

        //this.resList = new GameList(gameData, ResourceStorage, false, false, this, 'resList');

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ResourceStorageManager.prototype = Object.create(AbstractBlock.prototype);
    var proto = ResourceStorageManager.prototype;
    proto.constructor = ResourceStorageManager;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            ressourceTypeIds: [],
            ressourceCapacity: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {resList: new GameList(this.getGameData(), ResourceStorage, false, false, this, 'resList')}
        ];
    };


    proto.setPointers = function() {
        this.layer = this.getMap();
        this.resetHelpers();
    };


    proto.resetHelpers = function() {

    };


    proto.reqChangePerSec = function(resTypeId, reqChangePerSec, onUpdatedEffective ) {
        var resStorage = this.resList().get(resTypeId);
        if (!resStorage) {
            var type = null;
            resStorage = new ResourceStorage(this.resList(),type);
            this.resList().add(resStorage);
        }

        var requestObj = resStorage.addRequest(reqChangePerSec, onUpdatedEffective);
        return requestObj;
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorageManager.prototype.finalizeBlockClass('ResourceStorageManager');
    exports.ResourceStorageManager = ResourceStorageManager

})(typeof exports === 'undefined' ? window : exports);

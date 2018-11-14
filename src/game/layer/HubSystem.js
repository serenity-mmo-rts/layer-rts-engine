var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var HubSystemResource = require('./HubSystemResource').HubSystemResource;
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
    var HubSystem = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.mapObjects = []; // all map objects that are connected to the hub system and have a resourceManager.

        // manually serialized list of hub resources:
        this.resList = new GameList(this.getGameData(), HubSystemResource, false, false, this, 'resList');

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubSystem.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubSystem.prototype;
    proto.constructor = HubSystem;

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
            {_id: null}
        ];
    };


    proto.setPointers = function() {
        // call setPointers recursively for each resoruce:
        this.resList.each(function(res){
            res.setPointers();
        });
    };


    proto.resetHelpers = function() {

    };


    /**
     * add a new mapObject to the hub system
     * @param objId
     */
    proto.addToHubSystem = function (objId) {
        this.mapObjects.push(objId);
    };


    proto.getSystemResource = function(resTypeId) {
        var systemResource = this.resList.get(resTypeId);
        if (!systemResource) {
            systemResource = new HubSystemResource(this.resList,null);
            systemResource._id(resTypeId);
            this.resList.add(systemResource);
        }
        return systemResource;
    };

    /**
     *
     * @param mapObjId
     * @param resTypeId
     * @param reqPullPerHour should be 0 or positive integer
     * @param reqPushPerHour should be 0 or positive integer
     * @param reqPullPriority should be integer in range 0-2
     * @param reqPushPriority should be integer in range 0-2
     */
    proto.setRequest = function(mapObjId, resTypeId, reqPullPerHour, reqPullPriority, canPullPerHour, canPullPriority, reqPushPerHour, reqPushPriority, canPushPerHour, canPushPriority ) {
        var systemResource = this.getSystemResource(resTypeId);
        var requestObj = systemResource.setRequest(mapObjId, reqPullPerHour, reqPullPriority, canPullPerHour, canPullPriority, reqPushPerHour, reqPushPriority, canPushPerHour, canPushPriority);
        return requestObj;
    };

    proto.save = function() {
        var o = AbstractBlock.prototype.save.call(this);
        o.resList = this.resList.save();
        return o;
    };

    proto.load = function(o) {
        AbstractBlock.prototype.load.call(this,o);
        for (var i= 0, len=o.resList.length; i<len; i++){
            var systemResource = new HubSystemResource(this.resList,null);
            systemResource.load(o.resList[i]);
            this.resList.add(systemResource);
        }
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubSystem.prototype.finalizeBlockClass('HubSystem');
    exports.HubSystem = HubSystem

})(typeof exports === 'undefined' ? window : exports);

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
    var ResourceManager = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.hubSystemId = null;

        // GameList with sub states:
        this.resList = new GameList(this.getGameData(), ResourceStorage, false, false, this, 'resList');


        // check if all resourceStorage instances are in the resList and set their capacity accordingly:
        for (var i= 0, len=this.ressourceTypeIds.length; i<len; i++){
            var resStorage = this.resList.get(this.ressourceTypeIds[i]);
            if (!resStorage){
                // if it does not exist we create it here:
                resStorage = new ResourceStorage(this.resList,null);
                resStorage._id(this.ressourceTypeIds[i]);
                resStorage.capacity(this.ressourceCapacity[i]);
                this.resList.add(resStorage);
            }
        }


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ResourceManager.prototype = Object.create(AbstractBlock.prototype);
    var proto = ResourceManager.prototype;
    proto.constructor = ResourceManager;

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
            {x: 0}
        ];
    };

    proto.changeHubSystemId = function(hubSystemId) {
        console.log("hubSystemId = "+hubSystemId);
        var hubSystem = this.getMap().blocks.HubSystemManager.hubList.get(hubSystemId);
        this.hubSystem = hubSystem;
        this.resList.each(function(res){
            res.setHubSystem(hubSystem);
        })
    };

    proto.setPointers = function() {
        this.hubSystem = this.getMap().blocks.HubSystemManager.hubList.get(this.parent.blocks.HubConnectivity.hubSystemId());

        // call setPointers recursively for each resoruce:
        this.resList.each(function(res){
            res.setPointers();
        });

        this.resetHelpers();
    };


    proto.resetHelpers = function() {

    };

    proto.reqChangePerHour = function(resTypeId, reqChangePerHour, onUpdatedEffective ) {

        console.log("in mapObject of type "+this.parent.type.className + " there is an internal request for resTypeId="+resTypeId+ " with reqChangePerHour="+reqChangePerHour)
        var resStorage = this.resList.get(resTypeId);
        if (!resStorage) {
            resStorage = new ResourceStorage(this.resList,null);
            resStorage._id(resTypeId);
            resStorage.setCapacity(0);
            this.resList.add(resStorage);
        }

        var requestObj = resStorage.addRequest(reqChangePerHour, onUpdatedEffective);
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
            var resStorage = new ResourceStorage(this.resList,null);
            resStorage.load(o.resList[i]);
            this.resList.add(resStorage);
        }
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceManager.prototype.finalizeBlockClass('ResourceManager');
    exports.ResourceManager = ResourceManager

})(typeof exports === 'undefined' ? window : exports);

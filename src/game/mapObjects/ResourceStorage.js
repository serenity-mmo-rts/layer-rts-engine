var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var ResourceStorage = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.requests = {};

        this.ressourceChangePerSec = ko.observableArray();

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ResourceStorage.prototype = Object.create(AbstractBlock.prototype);
    var proto = ResourceStorage.prototype;
    proto.constructor = ResourceStorage;

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
            {ressourceStoredAmount: []},
            {ressourceLastUpdated: []},
            {ressourceTargetAmount: []} // the user can set this to arbitrary amounts which will be used to push/pull to hub system accordingly
            //{ressourceChangePerSec: []}
        ];
    };

    proto.reqChangePerSec = function(resTypeId, reqChangePerSec, newEffectiveCallback ) {
        var self = this;
        var requestObj = {
            resTypeId: resTypeId,
            reqChangePerSec: reqChangePerSec,
            effectiveChangePerSec: 0,
            newEffectiveCallback: newEffectiveCallback
        };
        if (!this.requests.hasOwnProperty(resTypeId)){
            this.requests[resTypeId] = [];
        }
        this.requests[resTypeId].push(requestObj);
        this.recalcRessourceInOut(requestObj.resTypeId);

        return {
            effectiveChangePerSec: requestObj.effectiveChangePerSec,
            updateReqChangePerSec: function (reqChangePerSec){
                requestObj.reqChangePerSec = reqChangePerSec;
                self.recalcRessourceInOut(requestObj.resTypeId);
            },
            removeRequest: function() {
                var idx = self.requests[resTypeId].indexOf(requestObj);
                if (idx != -1) {
                    return self.requests[resTypeId].splice(idx, 1);
                }
            }
        };
    };

    proto.recalcRessourceInOut = function(resTypeId) {

    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorage.prototype.finalizeBlockClass('ResourceStorage');
    exports.ResourceStorage = ResourceStorage

})(typeof exports === 'undefined' ? window : exports);

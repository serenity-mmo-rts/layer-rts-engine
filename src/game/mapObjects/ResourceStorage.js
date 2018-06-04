var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {



    var ResourceSpec = function () {
        this.requests = [];
        this.capacity = capacity;
        this.storedAmount = 0;
        this.targetAmount = 0;
        this.lastUpdated = 0;
        this.changePerSec = 0;
    };



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
        this.layer = null;
        this.ressources = {};

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
            {storedTypeIds: []},
            {storedAmount: []},
            {storedLastUpdated: []},
            {storedTargetAmount: []}, // the user can set this to arbitrary amounts which will be used to push/pull to hub system accordingly
            {storedChangePerSec: []}
        ];
    };


    proto.setPointers = function() {
        this.layer = this.getMap();
        this.resetHelpers();
    };


    proto.resetHelpers = function() {

        var oldRes = this.ressources;
        this.ressources = {};

        // load capacities:
        for (var i=0, len=this.ressourceTypeIds.length; i<len; i++) {
            var resTypeId = this.ressourceTypeIds[i];
            var capacity = this.ressourceCapacity[i];

            // add new entry to list:
            this.ressources[resTypeId] = {
                requests: [],
                capacity: capacity,
                storedAmount: 0,
                targetAmount: 0,
                lastUpdated: 0,
                changePerSec: 0
            };

        }

        // load current storage etc.
        var storedTypeIds = this.storedTypeIds();
        var storedAmount = this.storedAmount();
        var storedLastUpdated = this.storedLastUpdated();
        var storedTargetAmount = this.storedTargetAmount();
        var storedChangePerSec = this.storedChangePerSec();
        for (var i=0, len=storedTypeIds.length; i<len; i++) {
            var resTypeId = storedTypeIds[i];
            if (this.ressources.hasOwnProperty(resTypeId)) {
                // already in list, modify:
                var res = this.ressources[resTypeId];
                res.storedAmount = storedAmount[i];
                res.targetAmount = storedTargetAmount[i];
                res.lastUpdated = storedLastUpdated[i];
                res.changePerSec = storedChangePerSec[i];
            }
            else {
                // add new entry to list:
                this.ressources[resTypeId] = {
                    requests: [],
                    capacity: 0,
                    storedAmount: storedAmount[i],
                    targetAmount: storedTargetAmount[i],
                    lastUpdated: storedLastUpdated[i],
                    changePerSec: storedChangePerSec[i]
                };
            }

        }

        // reload old requests:
        for (var resTypeId in oldRes) {
            if (oldRes.hasOwnProperty(resTypeId)) {

                if (this.ressources.hasOwnProperty(resTypeId)) {
                    // already in list, modify:
                    this.ressources[resTypeId].requests = oldRes[resTypeId].requests;
                }
                else {
                    // add new entry to list:
                    this.ressources[resTypeId] = {
                        requests: oldRes[resTypeId].requests,
                        capacity: 0,
                        storedAmount: 0,
                        targetAmount: 0,
                        lastUpdated: 0,
                        changePerSec: 0
                    };
                }


            }
        }


        // recalc all changePerSec:
        for (var resTypeId in this.ressources) {
            if (this.ressources.hasOwnProperty(resTypeId)) {
                this.recalcRessourceInOut(resTypeId);
            }
        }


    };



    proto.reqChangePerSec = function(resTypeId, reqChangePerSec, newEffectiveCallback ) {
        var self = this;
        var requestObj = {
            resTypeId: resTypeId,
            reqChangePerSec: reqChangePerSec,
            effectiveChangePerSec: 0,
            newEffectiveCallback: newEffectiveCallback
        };
        if (!this.ressources.hasOwnProperty(resTypeId)){
            this.ressources[resTypeId] = {
                requests: [],
                capacity: 0,
                storedAmount: 0,
                targetAmount: 0,
                lastUpdated: 0,
                changePerSec: 0
            };
        }
        this.ressources[resTypeId].requests.push(requestObj);
        this.recalcRessourceInOut(requestObj.resTypeId);

        return {
            effectiveChangePerSec: requestObj.effectiveChangePerSec,
            updateReqChangePerSec: function (reqChangePerSec){
                requestObj.reqChangePerSec = reqChangePerSec;
                self.recalcRessourceInOut(requestObj.resTypeId);
            },
            removeRequest: function() {
                var idx = self.ressources[resTypeId].requests.indexOf(requestObj);
                if (idx != -1) {
                    return self.ressources[resTypeId].requests.splice(idx, 1);
                }
            }
        };
    };

    proto.recalcRessourceInOut = function(resTypeId) {
        console.log("ResourceStorage: recalc ressource in out of type "+resTypeId);

        var res = this.ressources[resTypeId];

        // calc internal requests for supply/demand of this resource:
        var allRequests = res.requests;
        var sum = 0;
        for (var i=0, len=allRequests.length; i<len; i++) {
            sum += allRequests[i].reqChangePerSec;
        }
        var requestedChangePerSec = sum;

        // remove amount if above capacity:
        if (res.storedAmount > res.capacity) {
            res.storedAmount = res.capacity;
        }

        // calculate effective considering empty or full storage:
        var effectiveChangePerSec;
        if (requestedChangePerSec > 0) {
            if (res.storedAmount == res.capacity) {
                effectiveChangePerSec = 0;
            }
            else {
                effectiveChangePerSec = requestedChangePerSec;
            }
        }
        else if (requestedChangePerSec < 0) {
            if (res.storedAmount == 0) {
                effectiveChangePerSec = 0;
            }
            else {
                effectiveChangePerSec = requestedChangePerSec;
            }
        }

        // if changePerSec is about to change, we have to first update the current amounts with previous changePerSec
        if (res.changePerSec != effectiveChangePerSec) {
            var currentTime = 0;// TODO: somehow get the current time like this.layer.currentTime
            res.storedAmount += res.changePerSec * (currentTime - res.lastUpdated);

            // set new effective change per sec from now on:
            res.changePerSec = effectiveChangePerSec;
            res.lastUpdated = currentTime;
        }




    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorage.prototype.finalizeBlockClass('ResourceStorage');
    exports.ResourceStorage = ResourceStorage

})(typeof exports === 'undefined' ? window : exports);

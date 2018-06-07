var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {



    /*****************************
     * ResourceRequest
     ****************************/

    var ResourceRequest = function( resStorage, reqChangePerSec, onUpdatedEffective) {
        this.resStorage = resStorage;

        this.reqChangePerSec = reqChangePerSec;
        this.effChangePerSec = 0;
        this.onUpdatedEffective = onUpdatedEffective;

    };
    var proto = ResourceRequest.prototype;

    /**
     * Use this function to change an existing request
     * @param reqChangePerSec
     */
    proto.updateReqChangePerSec = function (reqChangePerSec){
        this.reqChangePerSec = reqChangePerSec;
        this.resStorage.recalcRessourceInOut();
        return this.effChangePerSec;
    };

    /**
     * This function removes this request
     */
    proto.remove = function() {
        var requests = this.resStorage.requests;
        var idx = requests.indexOf(this);
        if (idx != -1) {
            return requests.splice(idx, 1);
        }
        this.resStorage.recalcRessourceInOut();
    };


    /*****************************
     * ResourceStorage
     ****************************/


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
        this.requests = [];
        this.capacity = 0;

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
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {
                id: "iron"
            },
            {storedAmount: 0},
            {targetAmount: 0},
            {lastUpdated: 0}, // the user can set this to arbitrary amounts which will be used to push/pull to hub system accordingly
            {changePerSec: 0}
        ];
    };

    proto.setCapacity = function(newCap) {
        this.capacity = newCap;
    };


    proto.setPointers = function() {
        this.resetHelpers();
    };


    proto.resetHelpers = function() {

        // recalc all changePerSec:
        this.recalcRessourceInOut();

    };

    proto.addRequest = function(reqChangePerSec, onUpdatedEffective) {
        var self = this;
        var requestObj = new ResourceRequest(this, reqChangePerSec, onUpdatedEffective);
        this.requests.push(requestObj);
        this.recalcRessourceInOut();
        return requestObj;
    };

    proto.recalcRessourceInOut = function() {
        console.log("ResourceStorageManager: recalc ressource in out");


        // calc internal requests for supply/demand of this resource:
        var allRequests = this.requests;
        var sum = 0;
        for (var i=0, len=allRequests.length; i<len; i++) {
            sum += allRequests[i].reqChangePerSec;
        }
        var requestedChangePerSec = sum;

        // remove amount if above capacity:
        if (this.storedAmount() > this.capacity) {
            this.storedAmount(this.capacity);
        }

        // calculate effective considering empty or full storage:
        var effectiveChangePerSec;
        if (requestedChangePerSec > 0) {
            if (this.storedAmount() == this.capacity) {
                effectiveChangePerSec = 0;
            }
            else {
                effectiveChangePerSec = requestedChangePerSec;
            }
        }
        else if (requestedChangePerSec < 0) {
            if (this.storedAmount() == 0) {
                effectiveChangePerSec = 0;
            }
            else {
                effectiveChangePerSec = requestedChangePerSec;
            }
        }

        // if changePerSec is about to change, we have to first update the current amounts with previous changePerSec
        if (this.changePerSec() != effectiveChangePerSec) {
            var currentTime = 0;// TODO: somehow get the current time like this.layer.currentTime
            this.storedAmount( this.storedAmount() + this.changePerSec() * (currentTime - this.lastUpdated()) );

            // set new effective change per sec from now on:
            this.changePerSec(effectiveChangePerSec);
            this.lastUpdated(currentTime);
        }




    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorage.prototype.finalizeBlockClass('ResourceStorage');
    exports.ResourceStorage = ResourceStorage

})(typeof exports === 'undefined' ? window : exports);

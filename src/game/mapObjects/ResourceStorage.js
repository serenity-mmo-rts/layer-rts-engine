var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {



    /*****************************
     * ResourceRequest
     ****************************/

    var ResourceRequest = function( resStorage, reqChangePerHour, onUpdatedEffective) {
        this.resStorage = resStorage;

        this.reqChangePerHour = reqChangePerHour;
        this.effChangePerHour = 0;
        this.onUpdatedEffective = onUpdatedEffective;

    };
    var proto = ResourceRequest.prototype;

    /**
     * Use this function to change an existing request
     * @param reqChangePerHour
     */
    proto.updateReqChangePerSec = function (reqChangePerHour){
        this.reqChangePerHour = reqChangePerHour;
        this.resStorage._recalcRessourceInOut();
        return this.effChangePerHour;
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
        this.resStorage._recalcRessourceInOut();
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
        this.timeCallbackId = null;
        this.currentlyRecalculating = false; // this is used to make sure that we do not recursively recalculate while recalculating

    };
    
    
    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    ResourceStorage.prototype = Object.create(AbstractBlock.prototype);
    var proto = ResourceStorage.prototype;
    proto.constructor = ResourceStorage;

    ResourceStorage.millisecondToHour = 60*60*1000;

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
            {changePerHour: 0},
            { totalPullEffectivityNominator: 0},
            { totalPullEffectivityDenominator: 0},
            { totalPushEffectivityNominator: 0},
            { totalPushEffectivityDenominator: 0}
        ];
    };

    proto.setCapacity = function(newCap) {
        this.capacity = newCap;
    };


    proto.setPointers = function() {
        this.resetHelpers();
    };


    proto.resetHelpers = function() {

    };

    proto.addRequest = function(reqChangePerHour, onUpdatedEffective) {
        var self = this;
        var requestObj = new ResourceRequest(this, reqChangePerHour, onUpdatedEffective);
        this.requests.push(requestObj);

        if (this.lockObject.isLocked) {
            // we are currently reverting.
            // Therefore do not update the local state in this class, but only calculate the effective of the given request:
            this._updateReqEffective(requestObj);
        }
        else {
            // recalculate every request and update the storage accordingly:
            this._recalcRessourceInOut();
        }

        return requestObj;
    };

    /**
     * this function retrieves the current amount stored, without effecting the state.
     */
    proto.getCurrentAmount = function(currentTime) {

        // load states into local variables:
        var changePerHour = this.changePerHour();
        var storedAmount = this.storedAmount();
        var lastUpdated = this.lastUpdated();

        // first update the current stored amount:
        if (changePerHour>0){
            // to prevent cheating, the user looses slightly by using floor:
            storedAmount += Math.floor(changePerHour * (currentTime - lastUpdated) / ResourceStorage.millisecondToHour);
        }
        else if (changePerHour<0) {
            // to prevent cheating, the user looses slightly by using ceil:
            storedAmount -= Math.ceil(-changePerHour * (currentTime - lastUpdated) / ResourceStorage.millisecondToHour);
        }
        lastUpdated = currentTime;

        // remove amount if above capacity:
        if (storedAmount > this.capacity) {
            storedAmount = this.capacity;
        }

        // sanity check:
        if (storedAmount < 0) {
            throw new Error("stored Amount should not be negative");
        }

        return storedAmount;

    };

    /**
     * this function uses all current requests to recalculate the effective inputs and outputs.
     * @private
     */
    proto._recalcRessourceInOut = function() {

        // TODO: use some big integer library in this function and check for overflows...

        // make sure that we are not recursively calling this function, from within the onUpdatedEffective callbacks:
        if (this.currentlyRecalculating){
            return;
        }
        this.currentlyRecalculating = true;

        // bring the storedAmount up to the currentTime:
        this._updateStoredAmount();

        // calc internal requests for supply/demand of this resource:
        var allRequests = this.requests;
        var totalDesiredPush = 0;
        var totalDesiredPull = 0;
        for (var i=0, len=allRequests.length; i<len; i++) {
            var req = allRequests[i].reqChangePerHour;
            if (req>0) {
                totalDesiredPush += req;
            }
            else {
                totalDesiredPull -= req;
            }
        }

        // calculate the effective change per sec for the storage and the effectivity of each request:
        if (totalDesiredPull > totalDesiredPush) {
            if (this.storedAmount() > 0) {
                this.totalPullEffectivityNominator(1);
                this.totalPullEffectivityDenominator(1);
                this.totalPushEffectivityNominator(1);
                this.totalPushEffectivityDenominator(1);
            }
            else {
                this.totalPullEffectivityNominator(totalDesiredPush);
                this.totalPullEffectivityDenominator(totalDesiredPull);
                this.totalPushEffectivityNominator(1);
                this.totalPushEffectivityDenominator(1);
            }
        }
        else {
            if (this.storedAmount() < this.capacity) {
                this.totalPullEffectivityNominator(1);
                this.totalPullEffectivityDenominator(1);
                this.totalPushEffectivityNominator(1);
                this.totalPushEffectivityDenominator(1);
            }
            else {
                this.totalPullEffectivityNominator(1);
                this.totalPullEffectivityDenominator(1);
                this.totalPushEffectivityNominator(totalDesiredPull);
                this.totalPushEffectivityDenominator(totalDesiredPush);
            }
        }

        // now update all the request objects:
        var changePerHour = 0;
        for (var i=0, len=allRequests.length; i<len; i++) {
            var reqObj = allRequests[i];
            this._updateReqEffective(reqObj);
            changePerHour += reqObj.effChangePerHour;
        }

        // update the rate of change in the storage:
        if (this.storedAmount() >= this.capacity && changePerHour>0) {
            changePerHour = 0;
        }
        if (this.storedAmount() <= 0 && changePerHour<0) {
            throw new Error("this should not happen: the storage is empty, but it is still leaking resources!");
        }

        this._updateChangePerHour(changePerHour);

        this.currentlyRecalculating = false;
    };


    /**
     * this function changes the state variable storedAmount to the currentTime in the layer:
     * @private
     */
    proto._updateStoredAmount = function() {
        var currentTime = this.getMap().currentTime;
        var storedAmount = this.getCurrentAmount(currentTime);

        // write back into state:
        this.storedAmount(storedAmount);
        this.lastUpdated(currentTime);

    };

    /**
     * this function is a private setter function to update the changePerHour in the storage. It updates the time callback accordingly.
     * @private
     */
    proto._updateChangePerHour = function(changePerHour) {

        var currentTime = this.getMap().currentTime;
        this.changePerHour(changePerHour);

        // add callback to timeScheduler
        var timeScheduler = this.getMap().timeScheduler;
        if (changePerHour == 0) {
            // remove callback:
            if (this.timeCallbackId) {
                timeScheduler.removeCallback(this.timeCallbackId);
                this.timeCallbackId = null;
            }
        }
        else {
            // calculate the time interval until the storage is empty or full:
            var msTillFullOrEmpty;
            if (changePerHour > 0) {
                msTillFullOrEmpty = Math.ceil(ResourceStorage.millisecondToHour * (this.capacity - this.storedAmount()) / changePerHour);
            }
            else {
                msTillFullOrEmpty = -Math.ceil(ResourceStorage.millisecondToHour * this.storedAmount() / changePerHour);
            }

            // update the time callback:
            if (this.timeCallbackId) {
                timeScheduler.setDueTime(this.timeCallbackId, currentTime+msTillFullOrEmpty);
            }
            else {
                var self = this;
                timeScheduler.addCallback(function () {
                    self._recalcRessourceInOut();
                }, currentTime+msTillFullOrEmpty)
            }

        }

    };

    /**
     * this function updates a specific requestObject. This function assumes that the storage state is already calculated correctly!!
     * @private
     */
    proto._updateReqEffective = function(reqObj) {
        var req = reqObj.reqChangePerHour;
        if (req>0) {
            reqObj.effChangePerHour = Math.ceil( (req * this.totalPushEffectivityNominator()) / this.totalPushEffectivityDenominator());
        }
        else {
            reqObj.effChangePerHour = - Math.floor( (-req * this.totalPullEffectivityNominator()) / this.totalPullEffectivityDenominator());
        }
        reqObj.onUpdatedEffective(reqObj.effChangePerHour, this.id());
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorage.prototype.finalizeBlockClass('ResourceStorage');
    exports.ResourceStorage = ResourceStorage

})(typeof exports === 'undefined' ? window : exports);

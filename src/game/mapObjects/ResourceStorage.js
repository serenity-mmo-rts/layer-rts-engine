var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var ResourceRequest = require('./ResourceRequest').ResourceRequest;
}

(function (exports) {



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
        this.timeCallbackId = null;
        this.amountAfterWait = 0;
        this.currentlyRecalculating = false; // this is used to make sure that we do not recursively recalculate while recalculating
        this.hubSystemResource = null;
        this.mapObj = null;

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
                _id: "iron"
            },
            {storedAmount: 0},
            {targetAmount: null},
            {isMainStorage: false},
            {lastUpdated: 0},
            {changePerHour: 0},
            {totalPullEffectivityNominator: 0},
            {totalPullEffectivityDenominator: 0},
            {totalPushEffectivityNominator: 0},
            {totalPushEffectivityDenominator: 0},
            {hubEffective: 0},
            {capacity: 0}
        ];
    };

    proto.setCapacity = function(newCap) {
        this.capacity(newCap);
    };


    proto.setPointers = function() {

        if (this.parent.parent.hubSystem) {
            this.hubSystemResource = this.parent.parent.hubSystem.resList.get(this._id());
        }

        this.mapObj = this.parent.parent.parent;

        this.resetHelpers();
    };


    proto.setHubSystem = function(hubSystem){

        if (this.hubSystemResource) {
            // remove requests from old hub:
            this.hubSystemResource.setRequest(this.mapObj._id(), 0, 0, 0, 0, 0, 0, 0, 0);
        }

        if (hubSystem==null) {
            this.hubSystemResource = null;
        }
        else {
            this.hubSystemResource = hubSystem.getSystemResource(this._id());
            this._recalcRessourceInOut();
        }
    };


    proto.resetHelpers = function() {

        // make sure to set the timer correctly, given the current states.
        this._updateChangePerHour(this.changePerHour());

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


    proto.updateHubEffective = function(totalChangePerHour) {

        this.hubEffective(totalChangePerHour);
        this._recalcRessourceInOut();

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
        if (storedAmount > this.capacity()) {
            storedAmount = this.capacity();
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


        var targetAmount = this.targetAmount();
        var storedAmount = this.storedAmount();
        var capacity = this.capacity();

        /*********************************
         * calculate hub system requests:
         *////////////////////////////////

        if (this.hubSystemResource) {
            var reqPullPerHour = 0;
            var reqPullPriority = 1;
            var canPullPerHour = 0;
            var canPullPriority = 2;
            var reqPushPerHour = 0;
            var reqPushPriority = 1;
            var canPushPerHour = 0;
            var canPushPriority = 2;

            // calculate high priority requests to hub system:
            var maxConnectionBandwidth = 10000;

            if (totalDesiredPull > totalDesiredPush) {
                if (storedAmount == 0) {
                    // request more resources from hub system with priority 1:
                    reqPullPerHour = totalDesiredPull - totalDesiredPush;
                    reqPullPriority = 1;
                }
            }
            else if (totalDesiredPull < totalDesiredPush) {
                if (storedAmount == capacity) {
                    // request to push more resources to hub system with priority 1:
                    reqPushPerHour = totalDesiredPush - totalDesiredPull;
                    reqPushPriority = 1;
                }
            }

            if (targetAmount !== null) {
                // if target amount is specified try to reach it with priority 1 with max bandwidth:
                var diff = targetAmount - storedAmount;
                if (diff > 0) {
                    // pull from hub with priority 1:
                    reqPullPerHour = maxConnectionBandwidth;
                    reqPullPriority = 1;
                }
                else if (diff < 0) {
                    // push to hub with priority 1:
                    reqPushPerHour = maxConnectionBandwidth;
                    reqPushPriority = 1;
                }
            }

            // calculate optional requests to hub system:
            if (this.isMainStorage()) {
                // main storage has priority 2:
                if (storedAmount > 0) {
                    // can push to hub with priority 2
                    canPushPerHour = maxConnectionBandwidth - reqPushPerHour;
                    canPushPriority = 2;
                }
                if (storedAmount < capacity) {
                    // can pull from hub with priority 2
                    canPullPerHour = maxConnectionBandwidth - reqPullPerHour;
                    canPullPriority = 2;
                }
            }
            else {
                // other storages have priority 3
                if (storedAmount > 0) {
                    // can push to hub with priority 3
                    canPushPerHour = maxConnectionBandwidth - reqPushPerHour;
                    canPushPriority = 3;
                }
                if (storedAmount < capacity) {
                    // can pull from hub with priority 3
                    canPullPerHour = maxConnectionBandwidth - reqPullPerHour;
                    canPullPriority = 3;
                }
            }

            this.hubSystemResource.setRequest(
                this.mapObj._id(),
                reqPullPerHour,
                reqPullPriority,
                canPullPerHour,
                canPullPriority,
                reqPushPerHour,
                reqPushPriority,
                canPushPerHour,
                canPushPriority
            );
        }

        /*********************
         * now include the effective change from the hub system in this map object:
         *//////////////////////

        var hubEffective = this.hubEffective();
        if (hubEffective>0) {
            // hub is pulling from this mapObj
            totalDesiredPull += hubEffective;
        }
        else if (hubEffective<0) {
            // hub is pushing to this mapObj
            totalDesiredPush -= hubEffective;
        }

        /*****************
         * calculate the effective rates within this map object:
         *//////////

        // calculate the effective change per sec for the storage and the effectivity of each request:
        if (totalDesiredPull > totalDesiredPush) {
            if (storedAmount > 0) {
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
            if (storedAmount < capacity) {
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
        changePerHour -= hubEffective;
        if (storedAmount >= capacity && changePerHour>0) {
            changePerHour = 0;
        }
        if (storedAmount <= 0 && changePerHour<0) {
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
            // calculate the time interval until the storage is empty or full or target is reached:
            var msTillNotify;
            var targetAmount = this.targetAmount();
            var storedAmount = this.storedAmount();
            if (changePerHour > 0) {
                if (targetAmount!==null && storedAmount < targetAmount) {
                    // notify when target is reached:
                    this.amountAfterWait = targetAmount;
                    msTillNotify = Math.ceil(ResourceStorage.millisecondToHour * (targetAmount - storedAmount) / changePerHour);
                }
                else {
                    // notify when full:
                    this.amountAfterWait = this.capacity();
                    msTillNotify = Math.ceil(ResourceStorage.millisecondToHour * (this.capacity() - storedAmount) / changePerHour);
                }
            }
            else {
                if (targetAmount!==null && storedAmount > targetAmount) {
                    // notify when target is reached:
                    this.amountAfterWait = targetAmount;
                    msTillNotify = -Math.floor(ResourceStorage.millisecondToHour * (storedAmount - targetAmount) / changePerHour);
                }
                else {
                    // notify when empty:
                    this.amountAfterWait = 0;
                    msTillNotify = -Math.floor(ResourceStorage.millisecondToHour * storedAmount / changePerHour);
                }
            }

            // update the time callback:
            if (this.timeCallbackId) {
                timeScheduler.setDueTime(this.timeCallbackId, currentTime+msTillNotify);
            }
            else {
                var self = this;
                timeScheduler.addCallback(function () {

                    // make sure that we hit the target exactly without precision errors:
                    self.storedAmount(self.amountAfterWait);
                    self.lastUpdated(self.getMap().currentTime);

                    self._recalcRessourceInOut();
                }, currentTime+msTillNotify);
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
        reqObj.onUpdatedEffective(reqObj.effChangePerHour, this._id());
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    ResourceStorage.prototype.finalizeBlockClass('ResourceStorage');
    exports.ResourceStorage = ResourceStorage

})(typeof exports === 'undefined' ? window : exports);

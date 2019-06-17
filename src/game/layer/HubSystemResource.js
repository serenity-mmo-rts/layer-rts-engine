var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var HubSystemRequest = require('./HubSystemRequest').HubSystemRequest;
    var GameList = require('../GameList').GameList;
}

(function (exports) {



    /*****************************
     * HubSystemResource
     ****************************/


    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var HubSystemResource = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.currentlyRecalculating = false; // this is used to make sure that we do not recursively recalculate while recalculating

        // manually serialized list of hub resources:
        this.reqList = new GameList(this.getGameData(), HubSystemRequest, false, false, this, 'reqList');

    };


    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubSystemResource.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubSystemResource.prototype;
    proto.constructor = HubSystemResource;



    HubSystemResource.maxPriority = 3; // 0,1,2,3
    HubSystemResource.maxPriorityToFill = 1; // we try to fill requests only for priority 0 or 1


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
            }
        ];
    };

    proto.setPointers = function() {
        // call setPointers recursively for each request:
        this.reqList.each(function(req){
            req.setPointers();
        });
    };

    proto.resetHelpers = function() {

    };


    /**
     *
     * @param mapObjId
     * @param reqPullPerHour should be 0 or positive integer
     * @param reqPushPerHour should be 0 or positive integer
     * @param reqPullPriority should be integer in range 0-2
     * @param reqPushPriority should be integer in range 0-2
     */
    proto.setRequest = function(mapObjId, reqPullPerHour, reqPullPriority, canPullPerHour, canPullPriority, reqPushPerHour, reqPushPriority, canPushPerHour, canPushPriority ) {

        // Update Pull:
        var reqObj = this.reqList.get(mapObjId);
        if (reqPullPerHour==0 && canPullPerHour==0 && reqPushPerHour==0 && canPushPerHour==0) {
            // remove request if it existed:
            if (reqObj) {
                this.reqList.deleteById(mapObjId);
            }
        }
        else {
            // add new request or just update existing:
            if (!reqObj) {
                reqObj = new HubSystemRequest(this.reqList, null);
                reqObj._id(mapObjId);
                reqObj.setPointers();
                this.reqList.add(reqObj);
            }

            var maxPriorityToFill = HubSystemResource.maxPriorityToFill;
            if (reqPullPriority > maxPriorityToFill) {
                throw new Error("requests must have priority smaller or equal to "+maxPriorityToFill);
            }
            if (reqPushPriority > maxPriorityToFill) {
                throw new Error("requests must have priority smaller or equal to "+maxPriorityToFill);
            }
            if (canPullPriority <= maxPriorityToFill) {
                throw new Error("optional requests must have priority greater or equal to "+(maxPriorityToFill+1));
            }
            if (canPushPriority <= maxPriorityToFill) {
                throw new Error("optional requests must have priority greater or equal to "+(maxPriorityToFill+1));
            }

            reqObj.reqPullPerHour(reqPullPerHour);
            reqObj.reqPullPriority(reqPullPriority);
            reqObj.reqPullEffective(0);
            reqObj.canPullPerHour(canPullPerHour);
            reqObj.canPullPriority(canPullPriority);
            reqObj.canPullEffective(0);
            reqObj.reqPushPerHour(reqPushPerHour);
            reqObj.reqPushPriority(reqPushPriority);
            reqObj.reqPushEffective(0);
            reqObj.canPushPerHour(canPushPerHour);
            reqObj.canPushPriority(canPushPriority);
            reqObj.canPushEffective(0);

        }

        this._recalcRessourceInOut();
    };

    /**
     * this function uses all current requests to recalculate the effective inputs and outputs.
     * @private
     */
    proto._recalcRessourceInOut = function() {

        // make sure that we are not recursively calling this function, from within the onUpdatedEffective callbacks:
        if (this.currentlyRecalculating){
            return;
        }
        this.currentlyRecalculating = true;

        // initialize some local variables:
        var maxPriority = HubSystemResource.maxPriority; // 0,1,2,3
        var maxPriorityToFill = HubSystemResource.maxPriorityToFill; // we try to fill requests only for priority 0 or 1
        var allReqPullByPriority = [];
        var allReqPushByPriority = [];
        var reqPullPerPriority = [];
        var reqPushPerPriority = [];
        var effPullPerPriority = [];
        var effPushPerPriority = [];
        var totalPull = 0;
        var totalPush = 0;
        for (var priority=0; priority<=maxPriority; priority++) {
            allReqPullByPriority.push([]);
            allReqPushByPriority.push([]);
            reqPullPerPriority.push(0);
            reqPushPerPriority.push(0);
            effPullPerPriority.push(0);
            effPushPerPriority.push(0);
        }

        // calc internal requests for supply/demand of this resource:
        this.reqList.each(function(reqObj) {

            var rate = null;

            rate = reqObj.reqPullPerHour();
            if (rate > 0){
                var priority = reqObj.reqPullPriority();
                allReqPullByPriority[priority].push(reqObj);
                reqPullPerPriority[priority] += rate;
            }

            rate = reqObj.canPullPerHour();
            if (rate > 0){
                var priority = reqObj.canPullPriority();
                allReqPullByPriority[priority].push(reqObj);
                reqPullPerPriority[priority] += rate;
            }

            rate = reqObj.reqPushPerHour();
            if (rate > 0){
                var priority = reqObj.reqPushPriority();
                allReqPushByPriority[priority].push(reqObj);
                reqPushPerPriority[priority] += rate;
            }

            rate = reqObj.canPushPerHour();
            if (rate > 0){
                var priority = reqObj.canPushPriority();
                allReqPushByPriority[priority].push(reqObj);
                reqPushPerPriority[priority] += rate;
            }

        });

        // calculate total requests that we should try to fill:
        var pullToFill = 0;
        var pushToFill = 0;
        for (var priority=0; priority<=maxPriorityToFill; priority++) {
            pullToFill += reqPullPerPriority[priority];
            pushToFill += reqPushPerPriority[priority];
        }

        // check if storage and low priority could fill the remaining difference in requests:
        if (pullToFill > pushToFill) { // we need more push
            for (var priority = maxPriorityToFill + 1; priority <= maxPriority; priority++) {
                pushToFill += reqPushPerPriority[priority];
                if (pushToFill>pullToFill) {
                    pushToFill = pullToFill;
                    break;
                }
            }
        }
        else if (pullToFill < pushToFill){ // we need more pull
            for (var priority = maxPriorityToFill + 1; priority <= maxPriority; priority++) {
                pullToFill += reqPullPerPriority[priority];
                if (pullToFill>pushToFill) {
                    pullToFill = pushToFill;
                    break;
                }
            }
        }

        // if there is still a difference, then we cannot fill every request, so reset to maximum possible:
        if (pullToFill > pushToFill) {
            pullToFill = pushToFill;
        }
        else if (pushToFill > pullToFill) {
            pushToFill = pullToFill;
        }

        // now loop again to calculate effective push and pull:
        var reqArr;
        var reqAmountThisPool;
        for (var priority=0; priority<=maxPriorityToFill; priority++) {

            // calc effective pulls:
            reqArr = allReqPullByPriority[priority];
            reqAmountThisPool = reqPullPerPriority[priority];
            if (reqAmountThisPool > pullToFill) {
                // reduce effective accordingly:
                var totalAmountFilled = 0;
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    // TODO: change this to work without rounding by giving some objects more and some less, but first make sure that ordering is deterministic:
                    var reqPullEffective = Math.floor( (reqArr[i].reqPullPerHour() * pullToFill) / reqAmountThisPool )
                    reqArr[i].reqPullEffective(reqPullEffective);
                    totalAmountFilled += reqPullEffective;
                }
                pullToFill -= totalAmountFilled;
            }
            else {
                // fill the full amount requested:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    reqArr[i].reqPullEffective(reqArr[i].reqPullPerHour());
                }
                pullToFill -= reqAmountThisPool;
            }

            // calc effective pushs:
            reqArr = allReqPushByPriority[priority];
            reqAmountThisPool = reqPushPerPriority[priority];
            if (reqAmountThisPool > pushToFill) {
                // reduce effective accordingly:
                var totalAmountFilled = 0;
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    // TODO: change this to work without rounding by giving some objects more and some less, but first make sure that ordering is deterministic:
                    var reqPushEffective = Math.ceil( (reqArr[i].reqPushPerHour() * pushToFill) / reqAmountThisPool )
                    reqArr[i].reqPushEffective(reqPushEffective);
                    totalAmountFilled += reqPushEffective;
                }
                pushToFill -= totalAmountFilled;
            }
            else {
                // fill the full amount requested:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    reqArr[i].reqPushEffective(reqArr[i].reqPushPerHour());
                }
                pushToFill -= reqAmountThisPool;
            }

        }

        for (var priority=maxPriorityToFill+1; priority<=maxPriority; priority++) {

            // calc effective pulls:
            reqArr = allReqPullByPriority[priority];
            reqAmountThisPool = reqPullPerPriority[priority];
            if (reqAmountThisPool > pullToFill) {
                // reduce effective accordingly:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    // TODO: change this to work without rounding by giving some objects more and some less, but first make sure that ordering is deterministic:
                    reqArr[i].canPullEffective(Math.floor( (reqArr[i].canPullPerHour() * pullToFill) / reqAmountThisPool ));
                }
                pullToFill -= reqAmountThisPool;
            }
            else {
                // fill the full amount requested:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    reqArr[i].canPullEffective(reqArr[i].canPullPerHour());
                }
                pullToFill -= reqAmountThisPool;
            }

            // calc effective pushs:
            reqArr = allReqPushByPriority[priority];
            reqAmountThisPool = reqPushPerPriority[priority];
            if (reqAmountThisPool > pushToFill) {
                // reduce effective accordingly:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    // TODO: change this to work without rounding by giving some objects more and some less, but first make sure that ordering is deterministic:
                    reqArr[i].canPushEffective(Math.ceil( (reqArr[i].canPushPerHour() * pushToFill) / reqAmountThisPool ));
                }
                pushToFill -= reqAmountThisPool;
            }
            else {
                // fill the full amount requested:
                for (var i= 0,len=reqArr.length; i<len; i++) {
                    reqArr[i].canPushEffective(reqArr[i].canPushPerHour());
                }
                pushToFill -= reqAmountThisPool;
            }

        }

        // notify all mapObjects
        this.reqList.each(function(reqObj) {
            reqObj.notifyIfTotalChanged();
        });




        this.currentlyRecalculating = false;
    };


    proto.save = function() {
        var o = AbstractBlock.prototype.save.call(this);
        o.reqList = this.reqList.save();
        return o;
    };

    proto.load = function(o) {
        AbstractBlock.prototype.load.call(this,o);
        for (var i= 0, len=o.reqList.length; i<len; i++){
            var request = new HubSystemRequest(this.reqList,null);
            request.load(o.reqList[i]);
            this.reqList.add(request);
        }
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubSystemResource.prototype.finalizeBlockClass('HubSystemResource');
    exports.HubSystemResource = HubSystemResource

})(typeof exports === 'undefined' ? window : exports);

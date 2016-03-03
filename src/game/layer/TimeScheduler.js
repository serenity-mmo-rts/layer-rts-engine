var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./../events/AbstractEvent').AbstractEvent;
    var eventStates = require('./../events/AbstractEvent').eventStates;
    var EventFactory = require('./../events/EventFactory');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    /**
     * This is a constructor for the Time Scheduler
     *  @returns {{callbackId}}
     */
    var TimeScheduler = function (gameData) {

        // do not serialize:
        this.callbacks = {};
        this.sortedDueTimes = [];
        this.sortedCallbackIds = [];
        this.idx = -1;
    };

    TimeScheduler.prototype = {


        /**
         *
         * @param callback
         * @param dueTime
         * @returns {id}
         */
        addCallback: function (callback,dueTime) {
            this.idx +=1;
            var callbackId = this.idx;
            this.callbacks[callbackId] = callback;
            this._addDueTimeAndID(callbackId,dueTime);
            return callbackId;
        },

        /**
         * Removes existing Callback from Callback Object
         */
        removeCallback: function (callbackId) {
            var callback = this.callbacks[callbackId];
            if(callback) {
                delete this.callbacks[callbackId];
                this._removeDueTimeAndID(callbackId);
            }
            else{
                console.log("Error no callback found with callbackId:"+callbackId);
            }
        },

        /**
         * Adds Id and DueTime of existing Callback to sorted Arrays
         */
        _addDueTimeAndID: function(callbackId,dueTime) {
            var addAtLocation = this.quicksortLocationOf(dueTime);
            this.sortedDueTimes.splice(addAtLocation, 0,dueTime);
            this.sortedCallbackIds.splice(addAtLocation, 0, callbackId);
        },

        /**
         * Removes Id and DueTime of existing Callback from sorted Arrays
         */
        _removeDueTimeAndID: function (callbackId) {
            var loc = this.findCallbackLocation(callbackId);
            this.sortedDueTimes.splice(loc, 1);
            this.sortedCallbackIds.splice(loc, 1);
        },


        /**
         * First removes then adds Id and DueTime of existing callback
         */
        setDueTime: function(callbackId, dueTime) {
            // this function is doing nothing if the event does not exist in scheduler:
            var callback = this.callbacks[callbackId];
            if(callback) {
                this._removeDueTimeAndID(callbackId);
                this._addDueTimeAndID(callbackId,dueTime);
            }

        },

        /**
         * Finishes all Callbacks that happened between the current time and last invocation
         */
        finishAllTillTime: function(time) {

            var numEventsFinished = 0;
            var index = this.sortedCallbackIds.length-1;
            while(index>=0 && this.sortedDueTimes[index] <= time) {
                var curId = this.sortedCallbackIds[index];
                var curDueTime = this.sortedDueTimes[index];
                var curCallback = this.callbacks[curId];

                // Recalculate the current DuetTime and check if it is really finished:
                if (curDueTime <= time){
                    var newDueTime = curCallback(curDueTime,curId);
                    this.setDueTime(curId,newDueTime);
                    // check whether due time was updated or callback was due (newDueTime = Infinite)
                    if (!isFinite(newDueTime)) {
                        console.log("event scheduler finishing event "+curId);
                        numEventsFinished++;
                    }
                }

                // Continue with next Event:
                 index -= 1;
            }

            return numEventsFinished;
        },



        /**
         * @ Returns the index element for a given callback into the sorted array
         */
        findCallbackLocation: function(callbackId) {
            var dueTime = this.sortedDueTimes[callbackId];

            var tmpEventLoc = this.quicksortLocationOf(dueTime);
            if (this.sortedCallbackIds[tmpEventLoc]==callbackId) {
                return tmpEventLoc;
            }

            // the following search around the location of the dueTime is just for the rare case if two events with the exact same due time exist. Don't know if we can somehow simplify this???
            // search downward:
            var eventLoc = tmpEventLoc;
            while(this.sortedCallbackIds[eventLoc]!=callbackId && this.sortedDueTimes[eventLoc]==dueTime) {
                eventLoc--;
            }
            if (this.sortedCallbackIds[eventLoc]==callbackId) {
                return eventLoc;
            }

            // search upward:
            var eventLoc = tmpEventLoc;
            while(this.sortedCallbackIds[eventLoc]!=callbackId && this.sortedDueTimes[eventLoc]==dueTime) {
                eventLoc++;
            }
            if (this.sortedCallbackIds[eventLoc]==callbackId) {
                return eventLoc;
            }
            else {
                throw new Error("could not find event in list of sorted due times!");
            }
        },



        // assume that sortedDueTimes is sorted in descending order!!!
        // return location where to insert new element
        quicksortLocationOf: function(element, start, end) {

            // start with search within the full range if only first parameter is given:
            start = start || 0;
            end = end || this.sortedDueTimes.length-1;

            // select new pivot
            var pivot = parseInt(start + (end - start) / 2, 10);

            if (end-start <= 1) {

                if (this.sortedDueTimes[start] <= element) {
                    return start;
                }
                else if (this.sortedDueTimes[end] <= element) {
                    return end;
                }
                else {
                    return end+1;
                }
            }

            if (this.sortedDueTimes[pivot] > element) {
                return this.quicksortLocationOf(element, pivot, end);
            } else {
                return this.quicksortLocationOf(element, start, pivot);
            }
        }
    };

    exports.TimeScheduler = TimeScheduler;

})(node ? exports : window);

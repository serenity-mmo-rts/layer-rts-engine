var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./../events/AbstractEvent').AbstractEvent;
    var EventFactory = require('./../events/EventFactory');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {

    /**
     * This is a constructor for the Time Scheduler
     *  @returns {{callbackId}}
     */
    var TimeScheduler = function (gameData, layer) {

        // do not serialize:
        this.callbacks = {};
        this.callbacksDueTimes = {};
        this.sortedDueTimes = [];
        this.sortedCallbackIds = [];
        this.deactivatedCallbackIds = {};
        this.idx = -1;
        this.layer = layer;
    };

    TimeScheduler.prototype = {


        /**
         *
         * @param callback
         * @param dueTime
         * @returns {_id}
         */
        addCallback: function (callback,dueTime) {
            this.idx +=1;
            var callbackId = this.idx;
            this.callbacks[callbackId] = callback;
            this.callbacksDueTimes[callbackId] = dueTime;
            this._addDueTimeAndIdToSortedArrays(callbackId,dueTime);
            //console.log("TimeScheduler has added one callback. TimeScheduler has "+this.sortedDueTimes.length+" active callbacks now.");
            return callbackId;
        },

        /**
         * Removes existing Callback from Callback Object
         */
        removeCallback: function (callbackId) {
            var callback = this.callbacks[callbackId];
            if(callback) {
                this._removeDueTimeAndIdFromSortedArrays(callbackId);
                delete this.callbacks[callbackId];
                delete this.callbacksDueTimes[callbackId];
            }
            else{
                throw new Error("Error no callback found with callbackId:"+callbackId);
            }
            //console.log("TimeScheduler has removed one callback. TimeScheduler has "+this.sortedDueTimes.length+" active callbacks now.");
        },

        /**
         * Adds Id and DueTime of existing Callback to sorted Arrays
         */
        _addDueTimeAndIdToSortedArrays: function(callbackId,dueTime) {
            if(dueTime==Infinity){
                this.deactivatedCallbackIds[callbackId] = true;
            }
            else {
                var addAtLocation = this.quicksortLocationOf(dueTime);
                this.sortedDueTimes.splice(addAtLocation, 0, dueTime);
                this.sortedCallbackIds.splice(addAtLocation, 0, callbackId);
            }
        },

        /**
         * Removes Id and DueTime of existing Callback from sorted Arrays
         */
        _removeDueTimeAndIdFromSortedArrays: function (callbackId) {
            var dueTime = this.callbacksDueTimes[callbackId];
            if (dueTime==Infinity){
                // the event was deactivated, so it is stored in this.deactivatedCallbackIds and not in the sorted arrays:
                delete this.deactivatedCallbackIds[callbackId];
            }
            else {
                // the event was active, so it is stored in the sorted arrays:
                var loc = this.findCallbackLocation(callbackId,dueTime);
                this.sortedDueTimes.splice(loc, 1);
                this.sortedCallbackIds.splice(loc, 1);
            }
        },


        /**
         * First removes then adds Id and DueTime of existing callback
         */
        setDueTime: function(callbackId, dueTime) {
            // this function is doing nothing if the event does not exist in scheduler:
            var callback = this.callbacks[callbackId];
            if(callback) {
                this._removeDueTimeAndIdFromSortedArrays(callbackId);
                this.callbacksDueTimes[callbackId] = dueTime;
                this._addDueTimeAndIdToSortedArrays(callbackId,dueTime);
            }
            console.log("TimeScheduler has "+this.sortedDueTimes.length+" active callbacks");
        },

        /**
         * Return the number of callbacks that are active
         */
        getNumActiveCallbacks: function() {
            return this.sortedCallbackIds.length;
        },

        /**
         * Finishes all Callbacks that happened between the current time and last invocation
         */
        finishAllTillTime: function(time) {

            var numActiveCallbacksBefore = this.sortedDueTimes.length;
            var numCallbacksTriggered = 0;
            var index = this.sortedCallbackIds.length-1;
            while(index>=0 && this.sortedDueTimes[index] <= time) {
                var curId = this.sortedCallbackIds[index];
                var curDueTime = this.sortedDueTimes[index];
                var curCallback = this.callbacks[curId];

                // Recalculate the current DuetTime and check if it is really finished:
                if (curDueTime <= time){
                    this.layer.currentTime = curDueTime;
                    var newDueTime = curCallback(curDueTime,curId);
                    numCallbacksTriggered++;
                    if (newDueTime !== undefined) {
                        this.setDueTime(curId, newDueTime);
                    }
                    else {
                        if (this.callbacks.hasOwnProperty(curId)) {
                            this.removeCallback(curId);
                        }
                    }

                }

                // Continue with next Event:
                // index -= 1; // NO: this is very bad!!!
                // in the next iteration again check the last item in the queue:
                index = this.sortedCallbackIds.length-1;
            }
            if (numCallbacksTriggered) {
                console.log("There were "+numActiveCallbacksBefore+" active callbacks. The time scheduler called " + numCallbacksTriggered + " callbacks. Now there are "+this.sortedDueTimes.length+" active callbacks remaining");
            }
            return numCallbacksTriggered;
        },



        /**
         * @ Returns the index element for a given callback into the sorted array
         */
        findCallbackLocation: function(callbackId,dueTime) {
            if (!dueTime) {
                console.log('dueTime is undefined')
            }
            if (dueTime==Infinity){
                tmpEventLoc = 0;
                throw new Error("time events with due time infinity should not be saved in the sorted arrays!")
            }
            else{
                var tmpEventLoc = this.quicksortLocationOf(dueTime);
                if (this.sortedCallbackIds[tmpEventLoc]==callbackId) {
                    return tmpEventLoc;
                }
            }

            // the following search around the location of the dueTime is just for the rare case if two events with the exact same due time exist. Don't know if we can somehow simplify this???
            // search upward:
            var eventLoc = tmpEventLoc;
            while(this.sortedCallbackIds[eventLoc]!=callbackId || this.sortedDueTimes[eventLoc]!=dueTime) {
                eventLoc++;
                if (eventLoc>this.sortedCallbackIds.length) {
                    throw new Error("could not find event in list of sorted due times");
                }
            }
            if (this.sortedCallbackIds[eventLoc]==callbackId) {
                return eventLoc;
            }


            // search downward:
            var eventLoc = tmpEventLoc;
            while(this.sortedCallbackIds[eventLoc]!=callbackId && this.sortedDueTimes[eventLoc]!=dueTime) {
                eventLoc--;
                if (eventLoc<0) {
                    throw new Error("could not find event in list of sorted due times");
                }
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

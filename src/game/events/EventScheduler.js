var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./AbstractEvent');
    var EventFactory = require('./EventFactory');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {


    var EventScheduler = function (gameData) {
        // serialize
        this.events = new GameList(gameData,AbstractEvent,false,EventFactory);

        // do not serialize:
        this.sortedDueTimes = [];
        this.sortedEvents = [];
        this.eventsFinished = new GameList(gameData,AbstractEvent,false,EventFactory);
        this.changedCallback = null;
    }

    EventScheduler.prototype = {

        setEvents: function (events) {
            this.events.load(events);
            this.sortedDueTimes = [];
            this.sortedEvents = [];
            var self = this;
            this.events.each(function(evt){self.addEventToSortedList(evt)});
        },


        addEvent: function (event) {
            //check if object is already in list:
            if (this.events.hashList.hasOwnProperty(event._id)) {
                console.log("map event was already in list.")
            }
            else {
                //add Event To MapData:
                this.events.hashList[event._id] = event;

                //add Event to sorted list:
                this.addEventToSortedList(event);
            }
        },

        finishAllTillTime: function(time) {

            for(var index = this.sortedEvents.length-1; index>=0 && this.sortedDueTimes[index] <= time; index--) {

                var curEvent = this.sortedEvents[index];
                console.log("finished event...")
                curEvent.finish();
                this.events.deleteById(curEvent._id);
                this.eventsFinished.add(curEvent);
                this.sortedDueTimes.pop();
                this.sortedEvents.pop();
            }
        },

        getNextEvent: function() {
            return this.sortedEvents[1];
        },


        addEventToSortedList: function(event) {
            var addAtLocation = this.quicksortLocationOf(event._dueTime);
            this.sortedDueTimes.splice(addAtLocation, 0, event._dueTime);
            this.sortedEvents.splice(addAtLocation, 0, event);


            //for(var i = 0; i<this.sortedDueTimes.length; i++) {
            //    console.log("this.sortedDueTimes["+i+"] = " + this.sortedDueTimes[i]);
            //}

        },

        // assume that sortedDueTimes is sorted in descending order!!!
        // return location where to insert new element
        quicksortLocationOf: function(element, start, end) {

            // start with search within the full range if only first parameter is given:
            start = start || 0;
            end = end || this.sortedDueTimes.length;

            // select new pivot
            var pivot = parseInt(start + (end - start) / 2, 10);

            if (end-start <= 1) {
                if (this.sortedDueTimes[pivot] > element) {
                    return pivot+1;
                }
                else {
                    return pivot;
                }
            }

            if (this.sortedDueTimes[pivot] > element) {
                return this.quicksortLocationOf(element, pivot, end);
            } else {
                return this.quicksortLocationOf(element, start, pivot);
            }
        }
    }

    exports.EventScheduler = EventScheduler;

})(node ? exports : window);

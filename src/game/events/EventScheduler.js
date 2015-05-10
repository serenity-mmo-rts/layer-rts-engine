var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
    var eventStates = require('./AbstractEvent').eventStates;
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

            // TODO: This could be more efficient if we use another sorting algorithm (i.e. mergesort):
            this.events.each(function(evt){self.addEventToSortedList(evt)});
        },


        addEvent: function (event) {
            //check if object is already in list:
            if (this.events.hashList.hasOwnProperty(event._id)) {
                console.log("map event "+event._id+" was already in list.")
            }
            else {
                if (event._state == eventStates.VALID) {
                    this.events.add(event);
                }
                else if (event._state == eventStates.EXECUTING) {
                    this.events.add(event);
                    this.addEventToSortedList(event);
                }
                else if (event._state == eventStates.FINISHED) {
                    this.eventsFinished.add(event);
                }
            }
        },

        removeEvent: function (eventId) {
            var event = this.events.get(eventId);
            if(event) {
                if (event._dueTime) {
                    var loc = this.findEventLocation(eventId);
                    this.sortedDueTimes.splice(loc, 1);
                    this.sortedEvents.splice(loc, 1);
                }
                this.events.deleteById(eventId);
            }
        },

        finishAllTillTime: function(time) {

            var index = this.sortedEvents.length-1;
            while(index>=0 && this.sortedDueTimes[index] <= time) {
                var curEvent = this.sortedEvents[index];

                // Recalculate the current DuetTime and check if it is really finished:
                curEvent.updateDueTime();
                if (this.sortedEvents[index]._id == curEvent._id && curEvent._dueTime <= time){
                    console.log("event scheduler finishing event "+curEvent._id);

                    this.sortedDueTimes.pop();
                    this.sortedEvents.pop();
                    this.events.deleteById(curEvent._id);
                    this.eventsFinished.add(curEvent);
                    curEvent.finish();
                }

                // Continue with next Event:
                var index = this.sortedEvents.length-1;
            }
        },

        updateEventId: function(oldId, newId) {
            this.events.updateId(oldId,newId);
        },

        updateEventDueTime: function(eventId, newDueTime) {
            // this function is doing nothing if the event does not exist in scheduler:
            var event = this.events.get(eventId);
            if(event) {
                this.removeEvent(eventId);
                event._dueTime = newDueTime;
                this.addEvent(event);
            }
        },

        findEventLocation: function(eventId) {
            var dueTime = this.events.get(eventId)._dueTime;
            var tmpEventLoc = this.quicksortLocationOf(dueTime);
            if (this.sortedEvents[tmpEventLoc]._id==eventId) {
                return tmpEventLoc;
            }

            // the following search aound the location of the dueTime is just for the rare case if two events with the exact same due time exist. Don't know if we can somehow simplify this???
            // search downward:
            var eventLoc = tmpEventLoc;
            while(this.sortedEvents[eventLoc]._id!=eventId && this.sortedEvents[eventLoc]._dueTime==dueTime) {
                eventLoc--;
            }
            if (this.sortedEvents[eventLoc]._id==eventId) {
                return eventLoc;
            }

            // search upward:
            var eventLoc = tmpEventLoc;
            while(this.sortedEvents[eventLoc]._id!=eventId && this.sortedEvents[eventLoc]._dueTime==dueTime) {
                eventLoc++;
            }
            if (this.sortedEvents[eventLoc]._id==eventId) {
                return eventLoc;
            }
            else {
                throw new Error("could not find event in list of sorted due times!");
            }
        },

        addEventToSortedList: function(event) {
            if (event._dueTime) {
                var addAtLocation = this.quicksortLocationOf(event._dueTime);
                this.sortedDueTimes.splice(addAtLocation, 0, event._dueTime);
                this.sortedEvents.splice(addAtLocation, 0, event);
            }

            //console.log("this.sortedDueTimes:");
            //for (var i = 0; i<this.sortedDueTimes.length; i++){
            //    console.log(this.sortedDueTimes[i]);
            //}
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
    }

    exports.EventScheduler = EventScheduler;

})(node ? exports : window);

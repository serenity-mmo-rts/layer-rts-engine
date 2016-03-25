var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./../events/AbstractEvent').AbstractEvent;
    var eventStates = require('./../events/AbstractEvent').eventStates;
    var EventFactory = require('./../events/EventFactory');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {


    var EventScheduler = function (gameData) {
        // serialize
        this.events = new GameList(gameData,AbstractEvent,false,EventFactory);
        this.eventsFinished = new GameList(gameData,AbstractEvent,false,EventFactory);
    };

    EventScheduler.prototype = {

        setEvents: function (events) {
            this.events.load(events);
        },

        addEvent: function (event) {
            //check if object is already in list:
            if (this.events.hashList.hasOwnProperty(event._id)) {
                console.log("map event "+event._id+" was already in list.")
            }
            else {
                if (event._isFinished) {
                    this.eventsFinished.add(event);
                }
                else {
                    this.events.add(event);
                }
            }
        },

        removeEvent: function (eventId) {
            var event = this.events.get(eventId);
            if(event) {
                this.events.deleteById(eventId);
            }
        },

        finishEvent: function (event){
            var eventId = event._id;
            this.events.deleteById(eventId);
            this.addEvent(event);
        },


        updateEventId: function(oldId, newId) {
            var success = this.events.updateId(oldId,newId);
            if (!success) {
                var success2 = this.eventsFinished.updateId(oldId,newId);
                if (!success2) {
                    console.log("WARNING: updateEventId in EventScheduler: could not find old event Id " + oldId);
                }
                else {
                    console.log("WARNING: updateEventId in EventScheduler: the event with oldId " + oldId + " was already finished when the id was updated!");
                }
            }
        }
    };

    exports.EventScheduler = EventScheduler;

})(node ? exports : window);

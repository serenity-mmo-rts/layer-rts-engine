var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var AbstractEvent = require('./../events/AbstractEvent').AbstractEvent;
    var eventStates = require('./../events/AbstractEvent').eventStates;
    var EventFactory = require('./../events/EventFactory');
    var dbConn = require('../../server/dbConnection');
}

(function (exports) {


    var EventScheduler = function (gameData,parent) {

        this.parent = parent;
        this.lockObject = parent.lockObject;

        // serialize
        this.events = new GameList(gameData,AbstractEvent,false,EventFactory,this,'events');
        this.eventsFinished = new GameList(gameData,AbstractEvent,false,EventFactory,this,'eventsFinished');
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
                if (event.isFinished) {
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
            }
        },




        /**
         * call this function if a state variable has changed to notify db sync later.
         */
        notifyStateChange: function (childKey) {

            if (childKey) {
                this.mutatedChilds[childKey] = true;
            }

            // Now notify the parent:
            if (!this.isMutated) {
                this.isMutated = true;
                if (this.hasOwnProperty("_id")) {
                    // if this is a game instance with an _id. For example item or mapObject:
                    this.parent.notifyStateChange(this._id());
                }
                else {
                    // if this is a building block without _id. For example UpgradeProdcution:
                    this.parent.notifyStateChange(this.blockname);
                }
            }

        },

        /**
         * get the map
         * @returns {*}
         */
        getMap: function() {
            if (this.hasOwnProperty("map")){
                return this.map;
            }
            else {
                return this.parent.getMap();
            }
        },

        /**
         * reset the states to oldValue here and in all mutatedChilds recursively.
         */
        revertChanges: function () {

            for (var key in this.mutatedChilds) {
                if (this.mutatedChilds.hasOwnProperty(key)) {
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].revertChanges();
                    }
                    else {
                        // this key is a sub building block
                        this.blocks[key].revertChanges();
                    }
                }
            }

        },

        revertChangesDone: function () {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].revertChangesDone();
                    }
                    else {
                        // this key is a sub building block
                        this.blocks[key].revertChangesDone();
                    }
                }
            }
            this.isMutated = false;
            this.mutatedChilds = {};
        },


        /**
         * delete all the oldValue fields here and in all mutatedChilds recursively.
         */
        newSnapshot: function () {

                for (var key in this.mutatedChilds) {
                    if (this.mutatedChilds.hasOwnProperty(key)) {
                        if (key in this) {
                            // this key is a ko.observable
                            this[key].newSnapshot();
                        }
                        else {
                            // this key is a sub building block
                            this.blocks[key].newSnapshot();
                        }
                    }
                }

            this.isMutated = false;
            this.mutatedChilds = {}

        }


    };

    exports.EventScheduler = EventScheduler;

})(node ? exports : window);

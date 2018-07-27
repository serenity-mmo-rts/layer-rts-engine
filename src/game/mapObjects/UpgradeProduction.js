var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var State = require('../AbstractBlock').State;
    var GameData = require('../GameData').GameData;
   // var MapObject = require('../MapObject').MapObject;
 //   var Item = require('../Item').Item;
    var User = require('../User').User;
   // var mapObjectStates = require('../MapObject').mapObjectStates;
 //   var BuildUpgradeEvent = require('../events/BuildUpgradeEvent').BuildUpgradeEvent;
 //   var LevelUpgradeEvent = require('../events/LevelUpgradeEvent').LevelUpgradeEvent;
 //   var BuildObjectEvent = require('../events/BuildObjectEvent').BuildObjectEvent;
 //   var ResearchEvent = require('../events/ResearchEvent').ResearchEvent;

}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var UpgradeProduction = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.helperVar = 22;
        this.timeCallbackId = null;
        this.gameData = null;
        this.mapId = null;
        this.layer= null;
        this.buildQueue = [];
        this.startedTimes= [];
        this.dueTimes= [];

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    UpgradeProduction.prototype = Object.create(AbstractBlock.prototype);
    var proto = UpgradeProduction.prototype;
    proto.constructor = UpgradeProduction;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            numSlots: 0,
            itemTypeIds: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {buildQueueIds: []},
            {startedTime: 0}
        ];
    };

    proto.setPointers = function () {
        var self = this;

        this.gameData = this.parent.gameData;
        this.mapId = this.parent.mapId();
        this.layer= this.getMap();
        if (this.parent.activeOnLayer){  // in case layer was changed and event needs to be removed
            this.resetHelpers();
        }



        // subscribe to any changes of the array:
        /**
        this.buildQueueIds.subscribe(function(array){
            self._fillBuildQueue(array);
            self._fillDueAndStartedTimes();
            if (self.parent.embedded()) {
                self._checkQueue();
            }
        });

        this.startedTime.subscribe(function(){
            self._fillDueAndStartedTimes();
        });
         **/

        this.parent.embedded.subscribe(function(newValue) {
            if (newValue) {
                // this object should now be included into the game
                self.timeCallbackId =  self.layer.timeScheduler.addCallback(function() {
                    var dT = self._finishedCallback();
                    return dT
                },Infinity);

                self._checkQueue();
            }
            else {
                // remove this object from the game:
                self.gameData.layers.get(self.mapId).timeScheduler.removeCallback(self.timeCallbackId);
            }
        });



    };

    proto.resetHelpers = function(){
        this._fillBuildQueue(this.buildQueueIds());
        this._fillDueAndStartedTimes();
        //if (this.parent.embedded()) {
        //    this._checkQueue();
        //}
    };

    proto.addEventToQueue = function (evt) {
        if (this.startedTime()==0){
            this.startedTime(evt.startedTime);
        }
        this.buildQueueIds.push(evt._id);
        this._fillBuildQueue(this.buildQueueIds());
        this._fillDueAndStartedTimes();
        if (this.parent.embedded()) {
            this._checkQueue();
        }
    };

    proto.removeItemFromQueue = function (idx) {
        this.buildQueueIds.splice(idx, 1);
        this.buildQueue.splice(idx, 1);
        this.startedTimes.splice(idx, 1);
        this.dueTimes.splice(idx, 1);
        if  (this.buildQueueIds().length>0){
            return false;
        }
        else{
            return true;
        }
    };

    proto._fillBuildQueue = function (buildQueueIds) {
        this.buildQueue = [];
        for (var i = 0, len=buildQueueIds.length; i < len; i++) {
            var evt = this.getMap().eventScheduler.events.get(buildQueueIds[i]);
            this.buildQueue.push(evt);
        }

    };

    proto._fillDueAndStartedTimes = function () {
        this.startedTimes = [];
        this.dueTimes = [];
        var len=this.buildQueue.length;
        for (var idx = 0;idx < len; idx++) {
            var evt = this.buildQueue[idx];
            // if update comes in first time for running event update all events that are already in cue
            // get building time
            if (evt.type == "BuildUpgradeEvent") {
                var buildTime = this.gameData.itemTypes.get(evt.itemTypeId).buildTime[0];
            }
            else if (evt.type == "LevelUpgradeEvent") {
                var level = this.layer.mapData.items.get(evt.itemId).getLevel(); // level goes from 1 to n, buildTime from 0 to n-1
                var buildTime = this.gameData.itemTypes.get(evt.itemTypeId).buildTime[level];
            }
            else if (evt.type == "BuildObjectEvent") {
                var buildTime = this.parent.buildTime;
            }
            else if (evt.type == "ResearchEvent") {
                var buildTime = this.gameData.technologyTypes.get(evt.techTypeId).buildTime;
            }
            else if (evt.type=="MoveThroughLayerEvent"){
                var buildTime =this.parent.blocks.Unit.deployTime;
            }
            if (idx == 0) {
                // update current running event due time in production
                if (this.startedTime()) {
                    this.startedTimes[0] = this.startedTime();
                }
                else {
                    this.startedTimes[0] = evt.startedTime;
                }
                this.dueTimes[0] = this.startedTimes[0] + buildTime;
                this.getMap().timeScheduler.setDueTime(this.timeCallbackId, this.dueTimes[0]);
            }

            else {
                this.startedTimes[idx] = (this.dueTimes[idx - 1]);
                this.dueTimes[idx] = (this.startedTimes[idx] + buildTime);
            }
            console.log("replace user due time to : " + this.dueTimes[idx]);
        }
    };


    proto._checkQueue = function () {
        if (this.buildQueue.length > 0) {
            var evt = this.buildQueue[0];

            // building upgrade
            if (evt.type=="BuildUpgradeEvent"){
                this.parent.setState(State.UPDATING);
                var item = this.layer.mapData.items.get(evt.itemId);
                item.setState(State.CONSTRUCTION);
                console.log("I start building a " + evt.itemTypeId + " in map Object" +this.parent._id());
            }
            // upgrading  upgrade
            else if (evt.type=="LevelUpgradeEvent"){
                this.parent.setState(State.UPDATING);
                var item = this.layer.mapData.items.get(evt.itemId);
                item.setState(State.UPDATING);
                console.log("I start upgrading an" + evt.itemTypeId + " in map Object" +this.parent._id());
            }
            // building map object
            else if (evt.type=="BuildObjectEvent"){
                this.parent.setState(State.CONSTRUCTION);
                console.log("I start building a " + this.parent.objTypeId() +  " at coordinates ("+ this.parent.x()+","+this.parent.y()+")");
            }
            // dismantle map Object
           else if (evt.type=="MoveThroughLayerEvent"){
                console.log("Start dismantling of Map Object " +this.parent._id() + "");
            }
            // research technology
            else if (evt.type=="ResearchEvent"){
                this.parent.setState(State.UPDATING);
                console.log("Started research:"+evt.techTypeId+" in Map Object: "+this.parent._id());
            }
        }

    };

    proto._finishedCallback = function() {

        var evt = this.buildQueue[0];
        var dueTime = this.dueTimes[0];

        // building upgrade
        if (evt.type=="BuildUpgradeEvent"){
            this.parent.setState(State.NORMAL);
            var item = this.layer.mapData.items.get(evt.itemId);
            item.setState(State.NORMAL);
            item.blocks.Feature.restartExecution(dueTime);
            console.log("I finished building an item: "+evt.itemId+" production completed");
        }
        // upgrading  upgrade
        else if (evt.type=="LevelUpgradeEvent"){
            this.parent.setState(State.NORMAL);
            var item = this.layer.mapData.items.get(evt.itemId);
            var level = item.getLevel()+1;
            item.setLevel(level);
            item.setState(State.NORMAL);
            item.blocks.Feature.restartExecution(dueTime);
            console.log("item: "+evt.itemId+" upgrade completed");
        }
        // building map object
        else if (evt.type=="BuildObjectEvent"){
            this.parent.setState(State.NORMAL);
            console.log("I finished building a " + this.parent.objTypeId() + " at coordinates ("+ this.parent.x()+","+this.parent.y()+")");
        }
        // dismantle map Object
        else if (evt.type=="MoveThroughLayerEvent"){
            // set map object state to dismantle
            this.parent.activeOnLayer=false;
            var item =  this.layer.mapData.items.get(this.parent.subItemId());
            item.blocks.Movable.moveObjectUp(dueTime);
            console.log("Dismantling of Map Object: "+this.parent._id()+" done. Now start moving upwards...");
        }
        // research technology
        else if (evt.type=="ResearchEvent"){
            this.parent.setState(State.NORMAL);
            User.addTechnology(evt.techTypeId);
            console.log("Fished research:"+evt.techTypeId+" in Map Object: "+this.parent._id());
        }

        evt.setFinished();
        // the new started time is the old due time:
        this.startedTime(dueTime);
        var queueIsEmpty = this.removeItemFromQueue(0);
        if (queueIsEmpty){
            this.startedTime(0);
            return Infinity;
        }
        else{
            this._fillDueAndStartedTimes();  // update Time scheduler
            this._checkQueue();
            return false;
        }

    };


    proto.progress= function(){
        var totalTimeNeeded = this.dueTimes[0] -this.startedTimes[0];
        var currentTime  = Date.now();
        var timeLeft =  this.dueTimes[0] -currentTime;
        var percent = (timeLeft/totalTimeNeeded)*100;
        return 100-percent
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UpgradeProduction.prototype.finalizeBlockClass('UpgradeProduction');
    exports.UpgradeProduction = UpgradeProduction

})(typeof exports === 'undefined' ? window : exports);
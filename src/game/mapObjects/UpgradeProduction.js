var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var User = require('../User').User;
    var mapObjectStates = require('../MapObject').mapObjectStates;
    var BuildUpgradeEvent = require('../events/BuildUpgradeEvent').BuildUpgradeEvent;
    var LevelUpgradeEvent = require('../events/LevelUpgradeEvent').LevelUpgradeEvent;
    var BuildObjectEvent = require('../events/BuildObjectEvent').BuildObjectEvent;
    var ResearchEvent = require('../events/ResearchEvent').ResearchEvent;

}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var UpgradeProduction = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.helperVar = 22;
        this._timeCallbackId = null;

        this.gameData = null;
        this.mapId = null;
        this.layer= null;

        this.buildQueue = [];

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
            {isRunning: false},
            {startedTime: null},
            {dueTime: null}
        ];
    };

    proto.setPointers = function () {
        this.gameData = this.parent.gameData;
        this.mapId = this.parent.mapId();
        this.layer= this.parent.gameData.layers.get(this.parent.mapId());
        this.buildQueue = [];
        for (var i = 0; i < this.buildQueueIds().length; i++) {
            this.buildQueue.push(this.gameData.layers.get(this.mapId).eventScheduler.events.get(this.buildQueueIds()[i]));
        }
        var self = this;

    };


    proto.addEventToQueue = function (evt) {
        // TODO serialize global event list
        this.buildQueue.push(evt);
        this.buildQueueIds().push(evt._id);
        evt.setFinished();
    };

    proto.removeItemFromQueue = function (idx) {
        this.buildQueueIds().splice(idx, 1);
        this.buildQueue.splice(idx, 1);
    };


    proto.updateDueTime= function(evt) {
        this.startedTime(evt._startedTime) ;

        // get building time
        if (evt._type=="BuildUpgradeEvent"){
            var buildTime = this.gameData.itemTypes.get(evt.itemTypeId)._buildTime[0];
        }
        else if (evt._type=="LevelUpgradeEvent"){
            var level= this.layer.mapData.items.get(evt._itemId).getLevel(); // level goes from 1 to n, buildTime from 0 to n-1
            var buildTime = this.gameData.itemTypes.get(evt.itemTypeId)._buildTime[level];
        }
        else if (evt._type=="BuildObjectEvent"){
            var buildTime = this.gameData.objectTypes.get(evt.mapObjTypeId)._buildTime;
        }
        else if (evt._type=="ResearchEvent"){
            var buildTime = this.gameData.technologyTypes.get(evt.techTypeId)._buildTime;
        }
        // notify time scheduler:
        console.log("replace user due time: "+this.dueTime()+" by new due time from server: "+this.startedTime() + buildTime);
        this.dueTime(this.startedTime() + buildTime);
        this.gameData.layers.get(this.mapId).timeScheduler.setDueTime(this._timeCallbackId, this.dueTime());

    };

    proto.checkQueue = function (startedTime) {
        if (this.buildQueue.length > 0 && this.isRunning()==false) {
            this.isRunning(true);
            this.parent.setState(1);
            var evt = this.buildQueue[0];
            // building upgrade
            if (evt._type=="BuildUpgradeEvent"){
                var buildTime = this.gameData.itemTypes.get(evt.itemTypeId)._buildTime[0];
                this.startedTime(startedTime);
                this.dueTime(this.startedTime() + buildTime);
                var self = this;
                var callback = function(dueTime,callbackId) {
                    self.layer.timeScheduler.removeCallback(callbackId);
                    var item = new Item(self.gameData, {_id: evt._itemId, _objectId: self.parent._id(), itemTypeId: evt.itemTypeId, mapId: evt._mapId});

                    console.log("item: "+evt._itemId+" production completed");
                    self.layer.mapData.addItem(item);
                    item.setPointers();
                    item._blocks.Feature.startExecution(dueTime);
                    self.parent.setState(2);
                    self.removeItemFromQueue(0);
                    self.isRunning(false);
                    self.checkQueue(dueTime);
                    return Infinity;
                };
                this._timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
                console.log("I start building a " + evt.itemTypeId + " in map Object" +this.parent._id());
            }
            // upgrading  upgrade
            else if (evt._type=="LevelUpgradeEvent"){
                var buildTime = this.gameData.itemTypes.get(evt._item.itemTypeId())._buildTime[evt._item._level()];
                this.startedTime(startedTime);
                this.dueTime(this.startedTime() + buildTime);
                var self = this;
                var callback = function(dueTime,callbackId) {
                    self.layer.timeScheduler.removeCallback(callbackId);
                    console.log("item: "+evt._itemId+" upgrade completed");
                    var item = self.layer.mapData.items.get(evt._itemId);
                    var level = item.getLevel()+1;
                    item.setLevel(level);
                    item._blocks.Feature.startExecution(dueTime);
                    self.parent.setState(2);
                    self.removeItemFromQueue(0);
                    self.isRunning(false);
                    self.checkQueue(dueTime);
                    return Infinity;
                };
                this._timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
                console.log("I start upgrading an" + evt.itemTypeId + " in map Object" +this.parent._id());

            }
            // building map object
            else if (evt._type=="BuildObjectEvent"){
                var buildTime = this.gameData.objectTypes.get(evt.mapObjTypeId)._buildTime;
                this.startedTime(startedTime);
                this.dueTime(this.startedTime() + buildTime);
                var self = this;
                var callback = function(dueTime,callbackId) {
                    self.layer.timeScheduler.removeCallback(callbackId);
                    console.log("I finished building a " + self.parent.objTypeId() + " at coordinates ("+ self.parent.x()+","+self.parent.y()+")");
                    self.parent.setState(2);
                    self.removeItemFromQueue(0);
                    self.isRunning(false);
                    self.checkQueue(dueTime);
                    return Infinity;
                };
                this._timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime);
                console.log("I start building an" + self.parent.objTypeId() +  " at coordinates ("+ self.parent.x()+","+self.parent.y()+")");
            }

            // dismantle map Object
           else if (evt._type=="MoveThroughLayerEvent"){
                // set map object state to dismantle
                this.parent.setState(1);
                this.parent.notifyStateChange();
                var objType = this.gameData.objectTypes.get(this.parent.objTypeId());
                var deployTime = objType._blocks.Unit.deployTime;
                this.startedTime(startedTime);
                this.dueTime(this.startedTime() + deployTime);
                var self = this;
                var callback = function(dueTime,callbackId) {
                    self.layer.timeScheduler.removeCallback(callbackId);
                    self.parent.state(mapObjectStates.HIDDEN);
                    self.parent.notifyStateChange();
                    console.log("Dismantling of Map Object: "+self.parent._id()+" done. Now start moving upwards...");
                    self.layer.mapData.items.get(self.parent.subItemId())._blocks.Movable.moveObjectUp(dueTime);
                    return Infinity;
                };
                this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
                console.log("Start dismantling of Map Object " +this.parent._id() + "");
            }


            // research technology
            else if (evt._type=="ResearchEvent"){
                this.parent.setState(1);
                this.parent.notifyStateChange();
                var techTime = this.gameData.technologyTypes.get(evt.techTypeId)._buildTime;
                this.startedTime(startedTime);
                this.dueTime(this.startedTime() + techTime);
                var self = this;
                var callback = function(dueTime,callbackId) {
                    self.layer.timeScheduler.removeCallback(callbackId);
                    self.parent.state(2);
                    self.parent.notifyStateChange();
                    console.log("Fished research:"+evt.techTypeId+" in Map Object: "+self.parent._id());
                    User.addTechnology(evt.techTypeId);
                    return Infinity;
                };
                this.timeCallbackId =  this.layer.timeScheduler.addCallback(callback,this.dueTime());
                console.log("Started research:"+evt.techTypeId+" in Map Object: "+this.parent._id());
            }


        }
    };




    proto.progress= function(){
        var totalTimeNeeded = this.dueTime() -this.startedTime();
        var currentTime  = Date.now();
        var timeLeft =  this.dueTime()-currentTime;
        var percent = (timeLeft/totalTimeNeeded)*100;
        return 100-percent
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UpgradeProduction.prototype.finalizeBlockClass('UpgradeProduction');
    exports.UpgradeProduction = UpgradeProduction

})(typeof exports === 'undefined' ? window : exports);
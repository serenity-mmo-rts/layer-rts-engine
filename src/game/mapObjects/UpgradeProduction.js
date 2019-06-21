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
        this.dueTime = null;
        this.requestObjects = [];

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
            {startedTime: 0}, // this is actually the last update time
            {lastUpdateTime: 0},
            {lastPercentageBuild: 0},
            {lastEffectivity: 0}
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
            if (newValue && self.parent.activeOnLayer) {
                // this object should now be included into the game
                self.timeCallbackId =  self.layer.timeScheduler.addCallback(function() {
                    var dT = self._finishedCallback();
                    return dT
                },Infinity);

                self._checkQueue();
            }
            else {
                // remove this object from the game:
                if (self.timeCallbackId) {
                    self.getMap().timeScheduler.removeCallback(self.timeCallbackId);
                    self.timeCallbackId = null;
                }
            }
        });



    };

    proto.resetHelpers = function(){
        if (this.parent.embedded()) {
            this._fillBuildQueue(this.buildQueueIds());
            this._resetResourceRequests();
            this._fillDueAndStartedTimes();
        }
    };

    proto.addEventToQueue = function (evt) {
        if (this.startedTime()==0){
            // if this building is completely new
            console.log("initialize lastUpdateTime");
            this.startedTime(evt.startedTime);
            this.lastUpdateTime(evt.startedTime);
        }
        this.buildQueueIds.push(evt._id);

        this._fillBuildQueue(this.buildQueueIds());
        this._resetResourceRequests();
        this._fillDueAndStartedTimes();

        if (this.parent.embedded()) {
            this._checkQueue();
        }
    };

    proto.removeItemFromQueue = function (idx) {
        this.buildQueueIds.splice(idx, 1);
        this.buildQueue.splice(idx, 1);
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
        var len=this.buildQueue.length;

        if (len > 0) {
            var evt = this.buildQueue[0];

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
            else if (evt.type=="PlaceObjectEvent"){
                var buildTime =this.parent.blocks.Unit.deployTime;
            }
            else if (evt.type=="DisplaceObjectEvent"){
                var buildTime =this.parent.blocks.Unit.deployTime;
            }

            var newBuildTime = (1-this.lastPercentageBuild())*buildTime/this.lastEffectivity();

            this.dueTime = this.lastUpdateTime()+newBuildTime;
        }
        else {
            this.dueTime = Infinity;
        }

        this.getMap().timeScheduler.setDueTime(this.timeCallbackId, this.dueTime);
        console.log("in UpgradeProduction of mapObject "+this.parent.objType.className+" replace user due time to : " + this.dueTime);
    };



    proto._removeRequestsObjects = function() {

        // first remove all previous requests:
        for (var i = 0, len = this.requestObjects.length; i < len; i++) {
            if (this.requestObjects[i].requestObj) {
                this.requestObjects[i].requestObj.remove();
            }
        }
        this.requestObjects = [];
    };


    proto._resetResourceRequests = function() {

        // first remove all previous requests:
        this._removeRequestsObjects();

        // calculate required resources:
        var buildTime = this.parent.buildTime;
        var resIds = this.parent.objType.requiredResourceIds;

        if (resIds && resIds.length > 0){
            // initialize array for request objects
            for (var i = 0; i<resIds.length; i++){
                var amountPerHour = this.parent.objType.requiredResourceAmount[i]/buildTime*1000*60*60
                this.requestObjects.push({
                    id: resIds[i],
                    amountPerHour: amountPerHour,
                    requestObj: null
                });
            }

            var self = this;
            this.requestObjects.forEach(function(element) {
                var reqChangesPerHour = element.amountPerHour;
                var requestObj = element.requestObj;
                if (!requestObj){
                    var onUpdateEffective = function(effChangePerHour, id, reqObj){
                        console.log("effChangePerHour:"+effChangePerHour);
                        element.requestObj = reqObj;
                        self._updatedResourceInputs();
                        self._fillDueAndStartedTimes();
                    };
                    self.parent.blocks.ResourceManager.reqChangePerHour(element.id, -reqChangesPerHour, onUpdateEffective);
                }
            });
        }
        else {
            this.lastEffectivity(1);
            this._updatedResourceInputs();
        }


    };

    proto._updatedResourceInputs = function () {

        var buildTime = this.parent.buildTime;
        // var requiredResourceIds = this.parent.objType.requiredResourceIds;
        // var requiredResourceAmount = this.parent.objType.requiredResourceAmount;
        var currentTime = this.getMap().currentTime;
        var timePassed = currentTime-this.lastUpdateTime();

        var addInProductionSinceLastTime = (timePassed  / buildTime) * this.lastEffectivity();

        var newPercentageBuild = this.lastPercentageBuild() + addInProductionSinceLastTime;
        this.lastUpdateTime(currentTime);
        console.log(newPercentageBuild);
        this.lastPercentageBuild(newPercentageBuild);

        if (this.requestObjects.length > 0) {
            var allEffectivity = [];
            this.requestObjects.forEach(function (element) {
                if (element.requestObj) {
                    allEffectivity.push(-element.requestObj.effChangePerHour / element.amountPerHour);
                }
                else {
                    allEffectivity.push(0);
                }
            });
            this.lastEffectivity(Math.min.apply(null, allEffectivity));
        }
        else {
            this.lastEffectivity(1);
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
            else if (evt.type=="PlaceObjectEvent"){
                this.parent.setState(State.CONSTRUCTION);
                console.log("Start reassembling of Map Object " +this.parent._id() + "");
            }
            // dismantle map Object
           else if (evt.type=="DisplaceObjectEvent"){
                this.parent.setState(State.CONSTRUCTION);
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
        var dueTime = this.dueTime;

        if (!evt) {
            this._removeRequestsObjects();
            this.startedTime(0);
            return Infinity;
        }

        console.log("in UpgradeProduction of mapObject "+this.parent.objType.className+" finished building "+evt.type);

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
            this.parent.afterFinishedBuilding();
            console.log("I finished building a " + this.parent.objTypeId() + " at coordinates ("+ this.parent.x()+","+this.parent.y()+")");
        }
        // place map Object
        else if (evt.type=="PlaceObjectEvent"){
            // set map object state to dismantle
            this.parent.setState(State.NORMAL);
            console.log("Map Object map on place");
        }
        // dismantle map Object
        else if (evt.type=="DisplaceObjectEvent"){
            // set map object state to dismantle
            this.parent.setState(State.HIDDEN);
            var item =  this.layer.mapData.items.get(this.parent.subItemId());
            console.log("Dismantling of Map Object: "+this.parent._id()+" done. Now start moving upwards...");
            item.blocks.Movable.placeToParking(dueTime);
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
        this._removeRequestsObjects();
        var queueIsEmpty = this.removeItemFromQueue(0);
        if (queueIsEmpty){
            this.startedTime(0);
            return Infinity;
        }
        else {
            this._fillDueAndStartedTimes();  // update Time scheduler
            this._checkQueue();
            return false;
        }
    };

    proto.progress= function(){
        var currentTime  = Date.now();
        var newBuild = (currentTime - this.lastUpdateTime()) * this.lastEffectivity() / this.parent.buildTime;
        var percent = (this.lastPercentageBuild() + newBuild) * 100;
        return percent;
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UpgradeProduction.prototype.finalizeBlockClass('UpgradeProduction');
    exports.UpgradeProduction = UpgradeProduction

})(typeof exports === 'undefined' ? window : exports);
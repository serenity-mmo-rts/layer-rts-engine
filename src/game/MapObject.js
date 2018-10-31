var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
    var GameData = require('./GameData').GameData;
    var ItemModel = require('./Item').ItemModel;
    var GameList = require('./GameList').GameList;

    ko = require('../client/lib/knockout-3.3.0.debug.js');
    var UserObject = require('./mapObjects/UserObject').UserObject;
    var Environment = require('./mapObjects/Environment').Environment;
    var HubNode = require('./mapObjects/HubNode').HubNode ;
    var HubConnectivity = require('./mapObjects/HubConnectivity').HubConnectivity ;
    var TechProduction = require('./mapObjects/TechProduction').TechProduction;
    var UpgradeProduction = require('./mapObjects/UpgradeProduction').UpgradeProduction;
    var Sublayer = require('./mapObjects/Sublayer').Sublayer;
    var ResourceStorageManager = require('./mapObjects/ResourceStorageManager').ResourceStorageManager;
    var ResourceStorage = require('./mapObjects/ResourceStorage').ResourceStorage;
    var ResourceProduction = require('./mapObjects/ResourceProduction').ResourceProduction;
    var EnergyManager = require('./mapObjects/EnergyManager').EnergyManager;
    var FeatureManager = require('./mapObjects/FeatureManager').FeatureManager;
    var SoilProduction = require('./mapObjects/SoilPuller').SoilProduction;
    var WorkingPlace = require('./mapObjects/WorkingPlace').WorkingPlace;
    var Connection = require('./mapObjects/Connection').Connection;
    var ProductivityCalculator = require('./mapObjects/ProductivityCalculator').ProductivityCalculator;
    var Tower = require('./mapObjects/Tower').Tower;
    var Unit = require('./mapObjects/Unit').Unit;
    var Technologies = require('./user/Technologies').Technologies;

    var AbstractBlock = require('./AbstractBlock').AbstractBlock;
    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
    var State = require('./AbstractBlock').State;
}


(function (exports) {


    /*
     constructor(gameData,initObj)
     or
     constructor(parent,type)
     or
     constructor(parent,initObj)
     */
    var MapObject = function (arg1, arg2) {

        this.embedded = ko.observable(false);
        this.blockObject = { isBlocked: false };

        var parent;
        var type;
        var initObj;
        if (arg1.constructor.name === "GameData") {
            // assume first argument is gameData and second argument is initObj:
            throw new Error("this method to create new instances is deprecated!");
            this.gameData = arg1;
            initObj = arg2;
            type = this.gameData.objectTypes.get(initObj.objTypeId) || null;
            if (this.gameData.layers.get(initObj.mapId)) {
                parent = this.gameData.layers.get(initObj.mapId).mapData.mapObjects;
            }
            else {
                parent = this.gameData.layers.get(initObj.inactiveMapId).mapData.mapObjects;
            }
        }
        else if (arg1.constructor.name === "GameList" && arg2.constructor.name === "ObjectType") {
            parent = arg1;
            type = arg2;
            this.gameData = parent.getGameData();
        }
        else {
            parent = arg1;
            initObj = arg2;
            this.gameData = parent.getGameData();
            type = this.gameData.objectTypes.get(initObj.objTypeId);
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        this.activeOnLayer = false;
        this.blocks = {};
        this.gameData = this.getGameData();
        this.onChangeCallback = {};
        this.map = this.getMap();
        this.treeItem = null;

        //this.axes = null; //created if needed for complex collision detection if one of two objects is not aligned with map axes
        //this.rect = null; //created if needed for simple collision detection if both objects are aligned with map axes
        this.items = {};

        if (type){
            this.objTypeId(type._id);
            this.objType = type;
            this.createBuildingBlocks();
        }


        if (initObj){
            this.load(initObj);
        }

        this.state.subscribe(function(newVal){
            console.log(" mapobject.state changed to "+newVal)
        });

    }

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    MapObject.prototype = Object.create(AbstractBlock.prototype);
    var proto = MapObject.prototype;
    proto.constructor = MapObject;


   // MapObject.mapObjectStates = mapObjectStates;


    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            className: "plantation",
            initWidth: 40,
            initHeight: 40,
            allowOnMapTypeId: "cityMapType01",
            name: "tree plantation 2",
            spritesheetId: "objectsSprite",
            spriteFrame: 14,
            iconSpritesheetId: "objectsSprite",
            iconSpriteFrame: 15,
            buildTime: 1000
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
                _id: 0,
                mapId: 0,
                inactiveMapId: 0,
                objTypeId: 0
            },
            {x: 0},
            {y: 0},
            {width: this.initWidth},
            {height: this.initHeight},
            {ori: 0},
            {state: State.TEMP},
            {sublayerId: null},
            {subItemId: null},
            {mapGeneratorParams: null},
            {needsTobePlaced: false},

        ];
    };

    proto.setPointers = function(){

        this.map = this.getMap();

        if (this.map._id()==this.mapId()) {
            this.activeOnLayer = true;
        }
        else {
            this.activeOnLayer = false;
        }
        this.objType = this.gameData.objectTypes.get(this.objTypeId());

        // call all setPointer functions of the building blocks:
        for (var blockName in this.blocks) {
            this.blocks[blockName].setPointers();
        }

        var self= this;
        this.embedded.subscribe(function(newValue) {
            self.checkTreeInsert();
        });

        this.resetHelpers();

    };

    proto.checkTreeInsert = function(){
        if(this.embedded()){
            if (this.activeOnLayer && this.state !=State.HIDDEN) {
                this.getMap().mapData.addObjectToTree(this);
            }
        }
        else {
            // remove this object from game (i.e. clean up)
            if (this.hasOwnProperty("treeItem")) {
                this.getMap().mapData.removeObjectFromTree(this);
            }
        }

    }

    proto.resetHelpers = function () {
        this.checkTreeInsert();
    };


    // overwrite super class method and call super.method... TODO: this could be moved into AbstractBlock.
    proto.setInitTypeVars = function() {
        AbstractBlock.prototype.setInitTypeVars.call(this);
        for (var blockName in this.blocks) {
            this.blocks[blockName].setInitTypeVars();
        }
    };

    proto.setState = function(state) {
        this.state(state);
        this.checkTreeInsert();
        this.notifyChange();
    };

    proto.notifyChange = function() {
        for (var key in this.onChangeCallback){
            this.onChangeCallback[key]();
        }
    };

    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    /*proto.notifyStateChange = function(){
        this.map.mapData.mapObjects.notifyStateChange(this._id());
    };*/

    proto.getLevel = function() {
        if (this.blocks.hasOwnProperty("UserObject")) {
            return this.blocks.UserObject.getLevel();
        }
        else {
            return 0;
        }
    };

    proto.addItem = function (item){
        this.items[item._id()] = item;
    };

    proto.removeItem = function (itemId){
        if(this.items.hasOwnProperty(itemId)){
           delete this.items[itemId];
        }
    };

    proto.getItems = function (){
        return this.items;
    };

    proto.addCallback = function(key,callback){
        this.onChangeCallback[key] = callback;
    };

    proto.removeCallback = function(key){
        delete this.onChangeCallback[key];
    };

    proto.createBuildingBlocks = function() {
        this.blocks = {};
        for (var blockName in this.objType.blocks) {
            this.blocks[blockName] = createBlockInstance(blockName,this,this.objType.blocks[blockName]);
        }
    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
     MapObject.prototype.finalizeBlockClass('MapObject');
 //   exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
    var GameData = require('./GameData').GameData;
    var ItemModel = require('./Item').ItemModel;
    var GameList = require('./GameList').GameList;


    var UserObject = require('./mapObjects/UserObject').UserObject;
    var Environment = require('./mapObjects/Environment').Environment;
    var HubNode = require('./mapObjects/HubNode').HubNode ;
    var HubConnectivity = require('./mapObjects/HubConnectivity').HubConnectivity ;
    var TechProduction = require('./mapObjects/TechProduction').TechProduction;
    var UpgradeProduction = require('./mapObjects/UpgradeProduction').UpgradeProduction;
    var Sublayer = require('./mapObjects/Sublayer').Sublayer;
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
}


(function (exports) {

    var mapObjectStates = {};
    mapObjectStates.TEMP = 0;
    mapObjectStates.WORKING = 1;
    mapObjectStates.FINISHED = 2;
    mapObjectStates.UPDATING =3;
    mapObjectStates.HIDDEN =4;


    /*
     constructor(gameData,initObj)
     or
     constructor(parent,type)
     */
    var MapObject = function (arg1, arg2) {

        var parent;
        var type;
        var initObj;
        if (arg1.constructor.name === "GameData") {
            // assume first argument is gameData and second argument is initObj:
            this.gameData = arg1;
            initObj = arg2;
            type = this.gameData.objectTypes.get(initObj.objTypeId) || null;

            if (this.gameData.layers.get(initObj.mapId)) {
                parent = this.gameData.layers.get(initObj.mapId).mapData.mapObjects;
            }
            else {
                parent = this.gameData.layers.get(initObj.targetMapId).mapData.mapObjects;
            }
        }
        else {
            parent = arg1;
            type = arg2;
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        this._blocks = {};
        this.gameData = this.getGameData();
        this.onChangeCallback = {};
        this.map = this.getMap();
        this.axes = null; //created if needed for complex collision detection if one of two objects is not aligned with map axes
        this.rect = null; //created if needed for simple collision detection if both objects are aligned with map axes
        this.items = {};

        if (type){
            this.objTypeId(type._id);
            this.objType = type;
            this.createBuildingBlocks();
        }


        if (arg1.constructor.name === "GameData"){
            // assume first argument is gameData and second argument is initObj:
            this.load(initObj);
        }

    }

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    MapObject.prototype = Object.create(AbstractBlock.prototype);
    var proto = MapObject.prototype;
    proto.constructor = MapObject;


    proto.mapObjectStates = mapObjectStates;


    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            _className: "plantation",
            _initWidth: 40,
            _initHeight: 40,
            _allowOnMapTypeId: "cityMapType01",
            _name: "tree plantation 2",
            _spritesheetId: "objectsSprite",
            _spriteFrame: 14,
            _iconSpritesheetId: "objectsSprite",
            _iconSpriteFrame: 15,
            _buildTime: 1000
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
                targetMapId: 0,
                objTypeId: 0
            },
            {x: 0},
            {y: 0},
            {width: this._initWidth},
            {height: this._initHeight},
            {ori: 0},
            {state: mapObjectStates.TEMP},
            {sublayerId: null},
            {subItemId: null},
            {mapGeneratorParams: null}

        ];
    };

    proto.setPointers = function(){

        this.map = this.getMap();
        this.objType = this.gameData.objectTypes.get(this.objTypeId());

        // call all setPointer functions of the building blocks:
        for (var blockName in this._blocks) {
            this._blocks[blockName].setPointers();
        }

        var self= this;
        this.embedded.subscribe(function(newValue) {
            // set embedded variable of all blocks
            for (var blockName in self._blocks) {
                self._blocks[blockName].embedded(newValue);
            }
        });

    };


    proto.setInitTypeVars = function() {
        AbstractBlock.prototype.setInitTypeVars.call(this);
        for (var blockName in this._blocks) {
            this._blocks[blockName].setInitTypeVars();
        }
    };

    proto.setState = function(state) {
        this.state(state);
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
        if (this._blocks.hasOwnProperty("UserObject")) {
            return this._blocks.UserObject.getLevel();
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
        this._blocks = {};
        for (var blockName in this.objType._blocks) {
            this._blocks[blockName] = createBlockInstance(blockName,this,this.objType._blocks[blockName]);
        }
    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    MapObject.prototype.finalizeBlockClass('MapObject');
    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

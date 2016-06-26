var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
    var GameData = require('./GameData').GameData;
    var ItemModel = require('./Item').ItemModel;
    var GameList = require('./GameList').GameList;
    var Vector = require('./layer/Vector').Vector;

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
    var SoilProduction = require('./mapObjects/SoilProduction').SoilProduction;
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
            parent = this.gameData.layers.get(initObj.mapId).mapData.mapObjects;
        }
        else {
            parent = arg1;
            type = arg2;
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        if (type){
            this.objTypeId(type._id);
        }
        this._blocks = {};
        this.gameData = this.getGameData();
        this.onChangeCallback = {};
        this.map = this.getMap();
        this.objType = type;
        this.axes = null; //created if needed for complex collision detection if one of two objects is not aligned with map axes
        this.rect = null; //created if needed for simple collision detection if both objects are aligned with map axes
        this.items = {};

        this.createBuildingBlocks();




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

        ];
    };

    proto.setPointers = function(){

        this.map = this.gameData.layers.get(this.mapId());
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
    proto.notifyStateChange = function(){
        this.map.mapData.mapObjects.notifyStateChange(this._id());
    };

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
        var idx = this.items.indexOf(itemId)
        this.items.splice(idx,1);
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

    proto.getAxes = function() {
        this.axes = new Array(2);
        this.axes[0] = new Vector(1, 0);
        this.axes[1] = new Vector(0, -1);
        if(this.ori() != 0) {
            this.axes[0].rotate(this.ori());
            this.axes[1].rotate(this.ori());
        }
        return this.axes;
    };

    proto.getRect = function() {
        this.rect = {
            left:   this.x()-this.width()/2,
            top:    this.y()-this.height()/2,
            right:  this.x()+this.width()/2,
            bottom: this.y()+this.height()/2
        };
        return this.rect;
    };

    proto.setSubItem = function(subItemId) {
        this.subItemId(subItemId);
        this.removeItem(subItemId);
    };

    proto.getSubItem = function(subItemId) {
        return this.subItemId();
    };

    proto.isColliding = function(b) {

        if (this.ori()==0 && b.ori()==0) {
            // do a more simple and faster check if both boxes are aligned with x and y axes of map

            var r1 = this.getRect();
            var r2 = b.getRect();

            if (r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top) {
                return false;
            }
            else {
                return true;
            }

        }

        // for the following more complex check see the references:
        // see http://jsbin.com/esubuw/4/edit?html,js,output
        // see http://www.gamedev.net/page/resources/_/technical/game-programming/2d-rotated-rectangle-collision-r2604

        var axesA = this.getAxes();
        var axesB = b.getAxes();

        var posA = new Vector(this.x(), this.y());
        var posB = new Vector(b.x(), b.y());

        var t = new Vector(b.x(), b.y());
        t.subtract(posA);
        var s1 = new Vector(t.dot(axesA[0]), t.dot(axesA[1]));

        var d = new Array(4);
        d[0] = axesA[0].dot(axesB[0]);
        d[1] = axesA[0].dot(axesB[1]);
        d[2] = axesA[1].dot(axesB[0]);
        d[3] = axesA[1].dot(axesB[1]);

        var ra = 0, rb = 0;

        ra = this.width() * 0.5;
        rb = Math.abs(d[0])*b.width()*0.5 + Math.abs(d[1])*b.height()*0.5;
        if(Math.abs(s1.x) > ra+rb) {
            return false;
        }

        ra = this.height() * 0.5;
        rb = Math.abs(d[2])*b.width()*0.5 + Math.abs(d[3])*b.height()*0.5;
        if(Math.abs(s1.y) > ra+rb) {
            return false;
        }


        t.set(posA);
        t.subtract(posB);
        var s2 = new Vector(t.dot(axesB[0]), t.dot(axesB[1]));


        ra = Math.abs(d[0])*this.width()*0.5 + Math.abs(d[2])*this.height()*0.5;
        rb = b.width()*0.5;
        if(Math.abs(s2.x) > ra+rb) {
            return false;
        }

        ra = Math.abs(d[1])*this.width()*0.5 + Math.abs(d[3])*this.height()*0.5;
        rb = b.height()*0.5;
        if(Math.abs(s2.y) > ra+rb) {
            return false;
        }

        // collision detected:
        return true;
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    MapObject.prototype.finalizeBlockClass('MapObject');
    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

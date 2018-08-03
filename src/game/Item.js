var node = !(typeof exports === 'undefined');

if (node) {
    ko = require('../client/lib/knockout-3.3.0.debug.js');

    var Class = require('./Class').Class;
    var Combat = require('./items/Combat').Combat;
    var Commander = require('./items/Commander').Commander;
    var Feature = require('./items/Feature').Feature;
    var InventoryItem = require('./items/InventoryItem').InventoryItem;
    var Movable = require('./items/Movable').Movable;
    var SubObject = require('./items/SubObject').SubObject;
    var FeatureManager = require('./mapObjects/FeatureManager').FeatureManager;

    var AbstractBlock = require('./AbstractBlock').AbstractBlock;
    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
    var State = require('./AbstractBlock').State;
}

(function (exports) {

    /*
     constructor(gameData,initObj)
     or
     constructor(parent,type)
     */
    var Item = function (arg1, arg2) {

        this.embedded = ko.observable(false);
        var parent;
        var type;
        var initObj;
        if (arg1.constructor.name === "GameData"){
            // assume first argument is gameData and second argument is initObj:
            this.gameData = arg1;
            initObj = arg2;
            type = this.gameData.itemTypes.get(initObj.itemTypeId);
            if (this.gameData.layers.get(initObj.mapId)) {
                parent = this.gameData.layers.get(initObj.mapId).mapData.items;
            }
            else {
                parent = this.gameData.layers.get(initObj.targetMapId).mapData.items;
            }
        }
        else {
            parent = arg1;
            type = arg2;
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        this.activeOnLayer = false;
        this.itemTypeId(type._id);
        this.blocks = {};
        this.onChangeCallback = null;
        this.mapObj = null;
        this.gameData = this.getGameData();
        this.map = this.getMap();
        this.itemType = this.gameData.itemTypes.get(initObj.itemTypeId);

        this.createBuildingBlocks();

        if (arg1.constructor.name === "GameData"){
            // assume first argument is gameData and second argument is initObj:
            this.load(initObj);
        }


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Item.prototype = Object.create(AbstractBlock.prototype);
    var proto = Item.prototype;
    proto.constructor = Item;

//    Item.itemStates = itemStates;


    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            className: "Item",
            allowOnMapTypeId: null,
            allowOnObjTypeId: null,
            name: "activationItem",
            iconSpritesheetId: "itemSprite",
            iconSpriteFrame: 4,
            buildMenuTooltip: "this is awesome",
            buildTime: 10000
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
                itemTypeId: 0
            },
            {objectId: 0},
            {subObjectId: null},
            {x: 0},
            {y: 0},
            {width:0 },
            {height: 0},
            {ori: 0},
            {state: State.TEMP},
            {level: 1}

        ];
    };

    proto.applyItemToMap = function (x,y,w,h,o) {
        this.x(x);
        this.y(y);
        this.width(w);
        this.height(h);
        this.ori(o);

    };


    proto.getLevel = function () {
        return this.level();
    };

    proto.setState = function (state) {
        this.state(state);
        if (this.mapObj){
            this.mapObj.notifyChange();
        }

    };

    proto.setLevel = function (lvl, curTime) {
        if (lvl != this.level()) {
            this.level(lvl);
            this.mapObj.notifyChange();
            this.setInitTypeVars();
        }
    };

    proto.setInitTypeVars = function() {
        AbstractBlock.prototype.setInitTypeVars.call(this);
        for (var blockName in this.blocks) {
            this.blocks[blockName].setInitTypeVars();
        }
    };

    proto.updateId = function (newId) {
        if (this.mapObj != null) {
            delete this.mapObj.items[this._id()];
            this.mapObj.items[this._id()] = this;
        }
        this._id(newId);
    };

    proto.setPointers = function () {
        var self = this;
        this.map = this.getMap();

        if (this.map._id()==this.mapId()){
            this.activeOnLayer = true;
        }

        this.itemType = this.gameData.itemTypes.get(this.itemTypeId());
        if (this.state() != State.BLOCKED && this.objectId()){
            this.mapObj = this.map.mapData.mapObjects.get(this.objectId());
            this.x(this.mapObj.x());
            this.y(this.mapObj.y());
            this.mapObj.addItem(this);
            this._id.subscribe(function(newValue){
                self.mapObj.addItem(self);
            }, this);
        }
        else if (this.subObjectId()){
            var obj = this.getMap().mapData.mapObjects.get(this.subObjectId());
            this.x(obj.x());
            this.y(obj.y());
        }

        // call all setPointer functions of the building blocks:
        for (var blockName in this.blocks) {
            this.blocks[blockName].setPointers();
        }

        var self= this;
        this.embedded.subscribe(function(newValue) {
            // set embedded variable of all blocks
            //for (var blockName in self.blocks) {
            //    self.blocks[blockName].embedded(newValue);
            //}
            if (!newValue){
                if (this.mapObj){
                    self.mapObj.removeItem(self._id());
                }

                self.getMap().mapData.removeItem(self);
            }

        });
    };

    proto.addToParentObject = function (objectId,timeStamp) {
        this.objectId(objectId);
        this.mapObj = this.map.mapData.mapObjects.get(this.objectId());
        this.mapObj.addItem(this);
        if (this.blocks.hasOwnProperty("Feature")){
            this.blocks.Feature.restartExecution(timeStamp);
        }
    };


    proto.removeFromParentObject = function (timeStamp) {
       if (this.mapObj){
           this.mapObj.removeItem(this._id());
           this.objectId(null);
           this.mapObj = null;
       }

        if (this.blocks.hasOwnProperty("Feature")){
            this.blocks.Feature.removeItemFromFeatureManagers(timeStamp);
        }
    };
    proto.removePointers = function () {
        for (var blockName in this.itemType.blocks) {
            this.blocks[blockName].removePointers();
        }
    };

    proto.createBuildingBlocks = function () {
        this.blocks = {};
        for (var blockName in this.itemType.blocks) {
            this.blocks[blockName] = createBlockInstance(blockName, this, this.itemType.blocks[blockName]);
        }
    };

    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    /*proto.notifyStateChange = function () {
        this.map.mapData.items.notifyStateChange(this._id());
    };*/


    //exports.itemStates = itemStates;
//    exports.itemStates = itemStates;

    Item.prototype.finalizeBlockClass('Item');
    exports.Item = Item;

})(typeof exports === 'undefined' ? window : exports);
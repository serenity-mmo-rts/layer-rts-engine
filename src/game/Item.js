var node = !(typeof exports === 'undefined');

if (node) {
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
}

(function (exports) {

    var itemStates = {};
    itemStates.TEMP = 0; // as long as item in only in production cue
    itemStates.CONSTRUCTION = 1; // during item production,
    itemStates.NORMAL = 2; // normal phase
    itemStates.UPDATING =3; // during item updating
    itemStates.HIDDEN = 4; // item not rendered but in game data
    itemStates.BLOCKED = 5; // item rendered in greyscale, cannot be used
    /*
     constructor(gameData,initObj)
     or
     constructor(parent,type)
     */
    var Item = function (arg1, arg2) {

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

        this.itemTypeId(type._id);
        this._blocks = {};
        this._onChangeCallback = null;
        this._mapObj = null;
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

    Item.itemStates = itemStates;


    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            _className: "ProductivityUpgrade",
            _allowOnMapTypeId: null,
            _allowOnObjTypeId: null,
            _name: "activationItem",
            _iconSpritesheetId: "itemSprite",
            _iconSpriteFrame: 4,
            _buildMenuTooltip: "this is awesome",
            _buildTime: [10000,10000,10000,10000,10000]
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
            {_objectId: 0},
            {subObjectId: null},
            {x: 0},
            {y: 0},
            {width:0 },
            {height: 0},
            {ori: 0},
            {state: itemStates.TEMP},
            {_level: 1}

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
        return this._level();
    };

    proto.setState = function (state) {
        this.state(state)
        this._mapObj.notifyChange();
    };

    proto.setLevel = function (lvl, curTime) {
        if (lvl != this._level()) {
            this._level(lvl);
            this._mapObj.notifyChange();
        }
    };

    proto.updateId = function (newId) {
        if (this._mapObj != null) {
            delete this._mapObj.items[this._id()];
            this._mapObj.items[this._id()] = this;
        }
        this._id(newId);
    };

    proto.setPointers = function () {
        var self = this;
        this.map = this.getMap();
        this._itemType = this.gameData.itemTypes.get(this.itemTypeId());
        if (this._objectId()){
            this._mapObj = this.map.mapData.mapObjects.get(this._objectId());
            this.x(this._mapObj.x());
            this.y(this._mapObj.y());
            this._mapObj.addItem(this);
            this._id.subscribe(function(oldValue){
                self._mapObj.removeItem(oldValue);
            }, this, "beforeChange");
            this._id.subscribe(function(newValue){
                self._mapObj.addItem(self);
            }, this);

        }
        else if (this.subObjectId()){
            var obj = this.map.mapData.mapObjects.get(this.subObjectId());
            this.x(obj.x());
            this.y(obj.y());
        }



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

    proto.addToParentObject = function (objectId,timeStamp) {
        this._objectId(objectId);
        this._mapObj = this.map.mapData.mapObjects.get(this._objectId());
        this._mapObj.addItem(this);
        if (this._blocks.hasOwnProperty("Feature")){
            this._blocks.Feature.startExecution(timeStamp);
        }
    };


    proto.removeFromParentObject = function (timeStamp) {
       if (this._mapObj){
           this._mapObj.removeItem(this._id());
           this._objectId(null);
           this._mapObj = null;
       }

        if (this._blocks.hasOwnProperty("Feature")){
            this._blocks.Feature.removeItemFromFeatureManagers(timeStamp);
        }
    };
    proto.removePointers = function () {
        for (var blockName in this.itemType._blocks) {
            this._blocks[blockName].removePointers();
        }
    };

    proto.createBuildingBlocks = function () {
        this._blocks = {};
        for (var blockName in this.itemType._blocks) {
            this._blocks[blockName] = createBlockInstance(blockName, this, this.itemType._blocks[blockName]);
        }
    };

    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    /*proto.notifyStateChange = function () {
        this.map.mapData.items.notifyStateChange(this._id());
    };*/


    //exports.itemStates = itemStates;
    exports.itemStates = itemStates;
    exports.Item = Item;


})(typeof exports === 'undefined' ? window : exports);
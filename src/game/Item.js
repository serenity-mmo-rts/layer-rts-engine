var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var Combat = require('./items/Combat').Combat;
    var Commander = require('./items/Commander').Commander;
    var Feature = require('./items/Feature').Feature;
    var InventoryItem = require('./items/InventoryItem').InventoryItem;
    var Movable = require('./items/Movable').Movable;
    var SubObject = require('./items/SubObject').SubObject;
    var FeatureManager = require('./mapObjects/FeatureManager').FeatureManager;

    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
}

(function (exports) {

    var itemStates = {};
    itemStates.TEMP = 0;
    itemStates.WORKING= 1;
    itemStates.FINSEHD = 2;

    var Item = function (gameData,initObj){


        // serialized
        this._state=itemStates.TEMP;
        this._id=null;
        this._objectId= null;
        this._itemTypeId = null;
        this._mapId= null;
        this._level=1;
        this._onChangeCallback= null;
        this._blocks = {};

        //not serialized
        this.map = null;
        this._mapObj= null;
        this.gameData = gameData;
        this.itemType = this.gameData.itemTypes.get(initObj._itemTypeId);

        //load state if argument was supplied:
        if (Item.arguments.length == 2) {
            this.load(initObj);
        }


    };

    Item.prototype= {

        getLevel: function() {
            return this._level;
        },

        setState: function(state) {
            this._state = state;
            this._mapObj.notifyChange();
        },

        setLevel: function(lvl,curTime) {
            if (lvl!=this._level){
                this._level = lvl;
                this._mapObj.notifyChange();
            }
        },

        updateId: function(newId) {
            if (this._mapObj != null) {
                delete this._mapObj.items[this._id];
                this._mapObj.items[this._id] = this;
            }
            this._id = newId;
        },

        setPointers : function(){
            this.map = this.gameData.layers.get(this._mapId);
            this._itemType = this.gameData.itemTypes.get(this._itemTypeId);
            this._mapObj =  this.map.mapData.mapObjects.get(this._objectId);
            this._mapObj.addItem(this);

            // call all setPointer functions of the building blocks:
            for (var blockName in this._blocks) {
                this._blocks[blockName].setPointers();
            }
        },

        createBuildingBlocks: function() {
            this._blocks = {};
            for (var blockName in this.itemType._blocks) {
                this._blocks[blockName] = createBlockInstance(blockName,this,this.itemType._blocks[blockName]);
            }
        },

        /**
         * call this function if a state variable has changed to notify db sync later.
         */
        notifyStateChange: function(){
            this.map.mapData.items.notifyStateChange(this._id);
        },


        save: function () {

            var blocks = {};
            for (var key in this._blocks) {
                blocks[key]= this._blocks[key].save();
            }

            var o = {_id: this._id,
                _itemTypeId: this._itemTypeId,
                _objectId: this._objectId,
                _mapId: this._mapId,
                a:[this._level,
                    this._state,
                    blocks
                ]

            };

            return o;
        },


        load: function (o) {

            if (o.hasOwnProperty("a")) {
                // load state from a previously saved json:
                this._id = o._id;
                this._itemTypeId = o._itemTypeId;
                this._objectId = o._objectId;
                this._mapId = o._mapId;
                this._level = o.a[0];
                this._state = o.a[1];
                this._blocks = o.a[2];
            }
            else {
                // initialize state from json:
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }

            if (typeof this._id != 'string' && this._id !== undefined) {
                this._id = this._id.toHexString();
            }

            var blockStatesJson = this._blocks;

            // call block constructors
            this.createBuildingBlocks();

            // load state
            for (var blockName in this.itemType._blocks) {
                if (blockStatesJson[blockName] !== undefined) {
                    this._blocks[blockName].load(blockStatesJson[blockName]);
                }
            }

        }

    };


    //exports.itemStates = itemStates;
    exports.itemStates = itemStates;
    exports.Item = Item;


})(typeof exports === 'undefined' ? window : exports);
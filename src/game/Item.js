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
        this._level=0;
        this._onChangeCallback= null;
        this._blocks = {};

        //not serialized
        this._mapObj= null;
        this.gameData = gameData;

        // deserialize event from json objectet
        this.load(initObj);
        //this.updateItemProperties();

    };

    Item.prototype= {

        setState: function(state) {
            this._state = state;
            this._mapObj.notifyChange();
        },


        setLevel: function(lvl) {
            if (lvl!=this._level){
                this._level = lvl;
                this._mapObj.notifyChange();
            }
        },


        setPointers : function(){
            this._mapObj =  this.gameData.layers.get(this._mapId).mapData.mapObjects.get(this._objectId);
            this._itemType = this.gameData.itemTypes.get(this._itemTypeId);
        },




        createBuildingBlocks: function(o) {

            var buildingBlockState = this._blocks;

            for (var blockName in this._itemType._blocks) {

                var blockStateVars = {};
                // check if we already have a state to initialize the building block with:
                if (buildingBlockState.hasOwnProperty(blockName)) {
                    blockStateVars = buildingBlockState[blockName];
                }

                if (blockName == "Combat") {
                    this._blocks[blockName] = new Combat(this,this._blocks[blockStateVars]);
                }
                else if (blockName == "Commander") {
                    this._blocks[blockName] = new Commander(this,blockStateVars);
                }
                else if (blockName == "Feature") {
                    this._blocks[blockName] = new Feature(this,blockStateVars);
                }
                else if (blockName == "FeatureManager") {
                    this._blocks[blockName] = new FeatureManager(this, blockStateVars);
                }
                else if (blockName == "InventoryItem") {
                    this._blocks[blockName] = new InventoryItem(this,blockStateVars);
                }
                else if (blockName == "Movable") {
                    this._blocks[blockName] = new Movable(this,blockStateVars);
                }
                else if (blockName == "SubObject") {
                    this._blocks[blockName] = new SubObject(this,blockStateVars);
                }
                else {
                    console.error("Tried to create item block " + blockName + " which is not registered as a valid buildingBlock.")
                }
            }

            this.recalculateTypeVariables();

        },

        recalculateTypeVariables: function(){

            // loop over all blocks:
            for (var blockName in this._itemType._blocks) {
           // loop over all type variables of that block:
               for (var blockTypeVar in this._itemType._blocks[blockName]) {
                    this._blocks[blockName][blockTypeVar] = this._itemType._blocks[blockName][blockTypeVar];
                }
            }

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
            this._id = o._id;
            this._itemTypeId = o._itemTypeId;
            this._objectId = o._objectId;
            this._mapId = o._mapId;

            if (o.hasOwnProperty("a")) {
                this._level = o.a[0];
                this._state = o.a[1];
                this._blocks = o.a[2];
            }


            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }

            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }

            this.setPointers();
            this.createBuildingBlocks(o);


        }

    };


    //exports.itemStates = itemStates;
    exports.itemStates = itemStates;
    exports.Item = Item;


})(typeof exports === 'undefined' ? window : exports);
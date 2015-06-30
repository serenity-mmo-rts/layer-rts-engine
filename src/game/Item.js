var node = !(typeof exports === 'undefined');

if (node) {
    var Class= require('./Class').Class;
    var Combat = require('./items/Combat').Combat;
    var Commander = require('./items/Commander').Commander;
    var Feature = require('./items/Feature').Feature;
    var InventoryItem = require('./items/InventoryItem').InventoryItem;
    var Movable = require('./items/Movable').Movable;
    var SubObject = require('./items/SubObject').SubObject;
}

(function (exports) {



    var Item = function (gameData,initObj){

        var itemStates = {};
        itemStates.TEMP = 0;
        itemStates.WORKING= 1;
        itemStates.FINSEHD = 2;
        // serialized
        this._id=null;
        this._objectId= null;
        this._itemTypeId = null;
        this._mapId= null;

        this._state=itemStates.TEMP;
        this._level=0;
        this._onChangeCallback= null;

        //not serialized
        this._mapObj= null;
        this._initProperties= {};
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


        updateItemProperties: function() {
            var initProp = this.gameData.itemTypes.get(this._itemTypeId)._initProperties;
            for(var key in initProp) {
                this._initProperties[key] = initProp[key][this._level];
            }
        },


        setPointers : function(){
           this._mapObj =  this.gameData.layers.get(this._mapId).mapObjects.get(this._objectId);
        },


        createBuildingBlocks: function(blocks){

            var Objects = this.gameData.itemTypes.get(blocks.objTypeId)._buildingBlocks;
            var BuildingBlocks  = Object.keys(Objects);

            for (var i =0;i<BuildingBlocks.length;i++){
                var name = BuildingBlocks[i];
                var blockObj = Objects[name];
                if (name == "Combat") {
                    this._blocks[name] = new Combat(this,this._blocks[name]);
                }
                else if (name == "Commander") {
                    this._blocks[name] = new Commander(this,blockObj);
                }
                else if (name == "Feature") {
                    this._blocks[name] = new Feature(this,blockObj);
                }
                else if (name == "InventoryItem") {
                    this._blocks[name] = new InventoryItem(this,blockObj);
                }
                else if (name == "Movable") {
                    this._blocks[name] = new Movable(this,blockObj);
                }
                else if (name == "SubObject") {
                    this._blocks[name] = new SubObject(this,blockObj);
                }
            }

        },


        save: function () {

            var blocks = [];
            for (var i=0; i<this._blocks.length; i++) {
                blocks.push(this._blocks[i].save());
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
                if (this._feature == null){
                    this.createFeature();
                }
            }

            if (typeof this._id != 'string') {
                this._id = this._id.toHexString();
            }

            this.createBuildingBlocks(this._blocks);
            this.setPointers();

        }

    };


    //exports.itemStates = itemStates;
    exports.Item = Item;
    exports.itemStates = itemStates;

})(typeof exports === 'undefined' ? window : exports);
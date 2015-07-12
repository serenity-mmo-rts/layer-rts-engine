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
    var ResourceProduction = require('./mapObjects/ResourceProduction').ResourceProduction;
    var EnergyManager = require('./mapObjects/EnergyManager').EnergyManager;
    var SoilProduction = require('./mapObjects/SoilProduction').SoilProduction;
    var WorkingPlace = require('./mapObjects/WorkingPlace').WorkingPlace;
    var ProductivityCalculator = require('./mapObjects/ProductivityCalculator').ProductivityCalculator;
}


(function (exports) {

    var mapObjectStates = {};
    mapObjectStates.TEMP = 0;
    mapObjectStates.WORKING = 1;
    mapObjectStates.FINISHED = 2;
    mapObjectStates.UPDATING =3;


    var MapObject = Class.extend({
        /**
         * Creates an instance of a MapObject.
         *
         * @constructor (init)
         * @this {MapObject}
         * gameData includes the whole data of the game
         * initObj object includes the properties for a new map Object
         * @return {none}
         */
        init: function MapObject(gameData,initObj) {
            // serialized:
            this._id = 0;
            this.mapId = null;
            this.objTypeId = null;
            this.x = null;
            this.y = null;
            this.width = null; // optional
            this.height = null; // optional
            this.state =  mapObjectStates.TEMP;
            this._blocks = {};
            this._deployedItems= [];
            this.ori = 0; // orientation/rotation of map object (.i.e. for connections)



            // not serialized:
            this.gameData = gameData;
            this.onChangeCallback = {};
            this.objType = null;
            this.axes = null; //created if needed for complex collision detection if one of two objects is not aligned with map axes
            this.rect = null; //created if needed for simple collision detection if both objects are aligned with map axes


            // init:
            if (MapObject.arguments.length == 2) {
                this.load(initObj);
            }


        },


        setState: function(state) {
            this.state = state;
            //this.notifyChange();
        },

        notifyChange: function() {
            // if (this.onChangeCallback) this.onChangeCallback();
            for (var key in this.onChangeCallback){
                this.onChangeCallback[key]();
            }
        },

        addItem: function (item){
            this._deployedItems.push(item);
        },

        addFeature: function (feature){
            this._appliedFeatures.push(feature);
        },

        getItems: function (){
            return this._deployedItems;
        },

        addCallback: function(key,callback){
            this.onChangeCallback[key] = callback;
        },

        removeCallback: function(key){
            delete this.onChangeCallback[key];
        },

        setPointers : function(items){

            this.map= this.gameData.layers.get(this._mapId);
            this.type=this.gameData.objectTypes.get(this.objTypeId);


            if (items==!undefined) {
                for (var i =1; i<items.length; i++){
                    this.addItem(items[i])
                }
            }
        },


        createBuildingBlocks: function(o) {

            var buildingBlockState = this._blocks;

            for (var blockName in this.objType._blocks) {

                var blockStateVars = {};
                // check if we already have a state to initialize the building block with:
                if (buildingBlockState.hasOwnProperty(blockName)) {
                    blockStateVars = buildingBlockState[blockName];
                }

                if (blockName == "UserObject") {
                    this._blocks[blockName] = new UserObject(this, blockStateVars);
                }
                else if (blockName == "Environment") {
                    this._blocks[blockName] = new Environment(this, blockStateVars);
                }
                else if (blockName == "ResourceProduction") {
                    this._blocks[blockName] = new ResourceProduction(this, blockStateVars);
                }
                else if (blockName == "SoilProduction") {
                    this._blocks[blockName] = new SoilProduction(this, blockStateVars);
                }
                else if (blockName == "HubNode") {
                    this._blocks[blockName] = new HubNode(this, blockStateVars);
                }
                else if (blockName == "HubConnectivity") {
                    this._blocks[blockName] = new HubConnectivity(this, blockStateVars);
                }
                else if (blockName == "ProductivityCalculator") {
                    this._blocks[blockName] = new ProductivityCalculator(this, blockStateVars);
                }
                else if (blockName == "EnergyManager") {
                    this._blocks[blockName] = new EnergyManager(this, blockStateVars);
                }
                else if (blockName == "WorkingPlace") {
                    this._blocks[blockName] = new WorkingPlace(this, blockStateVars);
                }
                else if (blockName == "TechProduction") {
                    this._blocks[blockName] = new TechProduction(this, blockStateVars);
                }
                else if (blockName == "UpgradeProduction") {
                    this._blocks[blockName] = new UpgradeProduction(this, blockStateVars);
                }
                else if (blockName == "Sublayer") {
                    this._blocks[blockName] = new Sublayer(this, blockStateVars);
                }
                else {
                    console.error("Tried to create block " + blockName + " which is not registered as a valid buildingBlock.")
                }
            }

            this.recalculateTypeVariables();

        },

        recalculateTypeVariables: function(){

            // TODO: At the moment the following is just a hack. Probably this should be done by the FeatureManager which has to change these type properties according to the applied features...

            // loop over all blocks:
            for (var blockName in this.objType._blocks) {
                // loop over all type variables of that block:
                for (var blockTypeVar in this.objType._blocks[blockName]) {
                    this._blocks[blockName][blockTypeVar] = this.objType._blocks[blockName][blockTypeVar];
                }
            }

        },


        getAxes: function() {
            this.axes = new Array(2);
            this.axes[0] = new Vector(1, 0);
            this.axes[1] = new Vector(0, -1);
            if(this.ori != 0) {
                this.axes[0].rotate(ori);
                this.axes[1].rotate(ori);
            }
            return this.axes;
        },

        getRect: function() {
            this.rect = {
                left:   this.x-this.width/2,
                top:    this.y-this.height/2,
                right:  this.x+this.width/2,
                bottom: this.y+this.height/2
            };
            return this.rect;
        },

        isColliding: function(b) {

            if (this.ori==0 && b.ori==0) {
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

            var posA = new Vector(this.x, this.y);
            var posB = new Vector(b.x, b.y);

            var t = new Vector(b.x, b.y);
            t.subtract(posA);
            var s1 = new Vector(t.dot(axesA[0]), t.dot(axesA[1]));

            var d = new Array(4);
            d[0] = axesA[0].dot(axesB[0]);
            d[1] = axesA[0].dot(axesB[1]);
            d[2] = axesA[1].dot(axesB[0]);
            d[3] = axesA[1].dot(axesB[1]);

            var ra = 0, rb = 0;

            ra = this.width * 0.5;
            rb = Math.abs(d[0])*b.width*0.5 + Math.abs(d[1])*b.height*0.5;
            if(Math.abs(s1.x) > ra+rb) {
                return false;
            }

            ra = this.height * 0.5;
            rb = Math.abs(d[2])*b.width*0.5 + Math.abs(d[3])*b.height*0.5;
            if(Math.abs(s1.y) > ra+rb) {
                return false;
            }


            t.set(posA);
            t.subtract(posB);
            var s2 = new Vector(t.dot(axesB[0]), t.dot(axesB[1]));


            ra = Math.abs(d[0])*this.width*0.5 + Math.abs(d[2])*this.height*0.5;
            rb = b.width*0.5;
            if(Math.abs(s2.x) > ra+rb) {
                return false;
            }

            ra = Math.abs(d[1])*this.width*0.5 + Math.abs(d[3])*this.height*0.5;
            rb = b.height*0.5;
            if(Math.abs(s2.y) > ra+rb) {
                return false;
            }

            // collision detected:
            return true;
        },



        save: function () {

            var blocks = {};
            for (var key in this._blocks) {
                blocks[key]= this._blocks[key].save();
            }

            var items= [];
            for (var i=0; i<this._deployedItems.length; i++) {
                items.push(this._deployedItems[i]._id);
            }



            var o = {_id: this._id,
                mapId: this.mapId,
                objTypeId: this.objTypeId,
                a: [this.x,
                    this.y,
                    this.width,
                    this.height,
                    this.ori,
                    this.state,
                    blocks,
                    items
                ]};

            return o;
        },


        load: function (o) {

            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.mapId = o.mapId;
                this.objTypeId = o.objTypeId;
                this.x = o.a[0];
                this.y = o.a[1];
                this.width = o.a[2];
                this.height = o.a[3];
                this.ori = o.a[4]
                this.state = o.a[5];
                this._blocks = o.a[6];
                var items = o.a[7];
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

            this.objType = this.gameData.objectTypes.get(this.objTypeId);
            this.setPointers(items);
            this.createBuildingBlocks(o);

        }

    });


    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

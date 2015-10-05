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

    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
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
            this.objTypeId = initObj.objTypeId;
            this.x = null;
            this.y = null;
            this.width = null; // optional
            this.height = null; // optional
            this.state =  mapObjectStates.TEMP;
            this._blocks = {};
            this.ori = 0; // orientation/rotation of map object (.i.e. for connections)


            // not serialized:
            this.gameData = gameData;
            this.onChangeCallback = {};
            this.objType = this.gameData.objectTypes.get(initObj.objTypeId);
            this.axes = null; //created if needed for complex collision detection if one of two objects is not aligned with map axes
            this.rect = null; //created if needed for simple collision detection if both objects are aligned with map axes
            this.items = {};


            if (MapObject.arguments.length == 2) {


                // init:
                if(!initObj.hasOwnProperty("width")){
                    this.height = this.objType._initHeight;
                    this.width = this.objType._initWidth;
                }


                this.load(initObj);
            }




        },


        setPointers : function(){

            this.map = this.gameData.layers.get(this._mapId);
            this.objType = this.gameData.objectTypes.get(this.objTypeId);

            // call all setPointer functions of the building blocks:
            for (var blockName in this._blocks) {
                if(typeof this._blocks[blockName].setPointers === 'function') {
                    this._blocks[blockName].setPointers();
                }
            }

        },



        setState: function(state) {
            this.state = state;
            this.notifyChange();
        },

        notifyChange: function() {
            for (var key in this.onChangeCallback){
                this.onChangeCallback[key]();
            }
        },

        //addItem: function (item){
        //    this._deployedItems.push(item);
        //},

        getItems: function (){
            return this.items;
        },

        addCallback: function(key,callback){
            this.onChangeCallback[key] = callback;
        },

        removeCallback: function(key){
            delete this.onChangeCallback[key];
        },



        createBuildingBlocks: function() {

            var buildingBlockState = this._blocks;

            this._blocks = {};

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
                    this._blocks[blockName] = createBlockInstance(blockName,this,this.objType._blocks[blockName]);
                }
                else if (blockName == "ResourceStorage") {
                    this._blocks[blockName] = new ResourceStorage(this, blockStateVars);
                }
                else if (blockName == "HubConnectivity") {
                    this._blocks[blockName] = createBlockInstance(blockName,this,this.objType._blocks[blockName]);
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
                else if (blockName == "Connection") {
                    this._blocks[blockName] = new Connection(this, blockStateVars);
                }
                else if (blockName == "UpgradeProduction") {
                    this._blocks[blockName] = new UpgradeProduction(this, blockStateVars);
                }
                else if (blockName == "FeatureManager") {
                    this._blocks[blockName] = new FeatureManager(this, blockStateVars);
                }
                else if (blockName == "Tower") {
                    this._blocks[blockName] = new Tower(this, blockStateVars);
                }
                else if (blockName == "Sublayer") {
                    this._blocks[blockName] = new Sublayer(this, blockStateVars);
                }
                else {
                    console.error("Tried to create block " + blockName + " which is not registered as a valid buildingBlock.")
                }
            }



        },


        getAxes: function() {
            this.axes = new Array(2);
            this.axes[0] = new Vector(1, 0);
            this.axes[1] = new Vector(0, -1);
            if(this.ori != 0) {
                this.axes[0].rotate(this.ori);
                this.axes[1].rotate(this.ori);
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
                ]};

            return o;
        },


        /**
         * loads the state variables either from a previously serialized machine-readable-object or from a human-readable JSON object.
         * @param o
         */
        load: function (o) {

            if (o.hasOwnProperty("a")) {

                // previously saved...

                this._id = o._id;
                this.mapId = o.mapId;
                this.objTypeId = o.objTypeId;
                this.x = o.a[0];
                this.y = o.a[1];
                this.width = o.a[2];
                this.height = o.a[3];
                this.ori = o.a[4];
                this.state = o.a[5];
                this._blocks = o.a[6];
            }
            else {

                // initialize state from

                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }

            if (this._id != 0) {
                if (typeof this._id != 'string') {
                    this._id = this._id.toHexString();
                }

                var blockStatesJson = this._blocks;

                // call block constructors
                this.createBuildingBlocks();

                // load state
                for (var blockName in this.objType._blocks) {
                    if (blockStatesJson[blockName] !== undefined) {
                        this._blocks[blockName].load(blockStatesJson[blockName]);
                    }
                }
            }

        }

    });


    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

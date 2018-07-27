var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractBlock = require('./AbstractBlock').AbstractBlock;
    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
    var GameList = require('./GameList').GameList;
    var TimeScheduler = require('./layer/TimeScheduler').TimeScheduler;
    var EventScheduler = require('./layer/EventScheduler').EventScheduler;
    var MapData = require('./layer/MapData').MapData;
    var MapProperties = require('./layer/MapProperties').MapProperties;
    var CityGenerator = require('./layer/CityGenerator').CityGenerator;
    var PlanetGenerator = require('./layer/PlanetGenerator').PlanetGenerator;
    var SolarGenerator = require('./layer/SolarGenerator').SolarGenerator;
    var GalaxyGenerator = require('./layer/GalaxyGenerator').GalaxyGenerator;
    var HubSystem = require('./layer/HubSystem').HubSystem;
}

(function (exports) {


    /*
    var Layer = function (gameData, initObj) {

        this.lockObject = {isLocked: false};

        // serialized:
        this._id = 0;
        this.parentObjId = null;
        this.width = 0;
        this.height = 0;
        this.xPos = null;
        this.yPos = null;
        this.mapTypeId = null;
        this.parentMapId = null;
        this.mapGeneratorParams = null;

        var seed = (1 << 30);

        // not serialized:
        this.timeScheduler = new TimeScheduler(gameData);
        this.eventScheduler = new EventScheduler(gameData, this);
        this.mapData = new MapData(gameData, this);
        this.hubSystem = new HubSystem(gameData, this);
        this.mapProperties = new MapProperties('3', this.mapData.width, this.mapData.height);
        this.gameData = gameData;
        this.mutatedChilds = {};

        // init:
        if (Layer.arguments.length == 2) {
            this.load(initObj);
        }

        switch (this.mapTypeId) {

            case "cityMapType01":
                this.mapGenerator = new CityGenerator(this);
                break;
            case "moonMapType01":
                this.mapGenerator = new PlanetGenerator(this);
                break;
            case "solarMapType01":
                this.mapGenerator = new SolarGenerator(this);
                break;
            case "galaxyMapType01":
                this.mapGenerator = new GalaxyGenerator(this);
                break;
        }

        // this.mapGenerator.init();

    };
    */


    var Layer = function (arg1, arg2) {
        var parent;
        var type;
        var initObj;
        if (arg1.constructor.name === "GameData") {
            // assume first argument is gameData and second argument is initObj:
            this.gameData = arg1;
            initObj = arg2;
            type = this.gameData.layerTypes.get(initObj.mapTypeId) || null;
            parent = this.gameData.layers;
        }
        else {
            parent = arg1;
            type = arg2;
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        this.blocks = {};
        this.gameData = this.getGameData();
        this.map = this;
        this.currentTime = null;

        if (type){
            this.mapTypeId(type._id);
            this.mapType = type;
            this.createBuildingBlocks();
        }

        // TODO: move into blocks:
        this.timeScheduler = new TimeScheduler(this.gameData,this);
        this.eventScheduler = new EventScheduler(this.gameData,this);
        this.mapData = new MapData(this.gameData, this);
        //this.hubSystem = new HubSystem(this.gameData, this);
        this.mapProperties = new MapProperties('3',this.mapData.width,this.mapData.height);

        if (arg1.constructor.name === "GameData"){
            // assume first argument is gameData and second argument is initObj:
            this.load(initObj);
        }

        switch (this.mapTypeId()) {
            case "cityMapType01":
                this.mapGenerator = new CityGenerator(this);
                break;
            case "moonMapType01":
                this.mapGenerator = new PlanetGenerator(this);
                break;
            case "solarMapType01":
                this.mapGenerator = new SolarGenerator(this);
                break;
            case "galaxyMapType01":
                this.mapGenerator = new GalaxyGenerator(this);
                break;
        }

    };


    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Layer.prototype = Object.create(AbstractBlock.prototype);
    var proto = Layer.prototype;
    proto.constructor = Layer;



    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            name: "city",
            scale: null,
            ratioWidthHeight: 2,
            bgColor: null,
            groundImage: null,
            groundImageScaling: null,
            groundDragScaling: 1,
            buildCategories: []
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
                parentObjId : 0,
                parentMapId: 0,
                mapTypeId: 0
            },
            {width: 0},
            {height: 0},
            {xPos: null},
            {yPos: null},
            {mapGeneratorParams: 0}
        ];
    };



    proto.initialize = function () {
        // now call setPointers() for everything
        this.mapData.setPointers(); // this will call setPointer() on all mapObjects and items
        this.eventScheduler.events.setPointers();

        // now embed into game:
        this.mapData.mapObjects.each(function(mapObj){
            mapObj.embedded(true);
        });
        this.mapData.items.each(function(item){
            item.embedded(true);
        });
    };

    /*
    proto.save = function () {
        var o = {
            _id: this._id,
            a: [this.parentObjId,
                this.width,
                this.height,
                this.mapTypeId,
                this.parentMapId,
                this.mapGeneratorParams]
        };
        return o;
    };

    proto.load = function (o) {
        if (o.hasOwnProperty("a")) {
            this._id = o._id;
            this.parentObjId = o.a[0];
            this.width = o.a[1];
            this.height = o.a[2];
            this.mapTypeId = o.a[3];
            this.parentMapId = o.a[4];
            this.mapGeneratorParams = o.a[5];
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
        this.mapData.rebuildQuadTree();
    };
    */

    proto.createSublayer = function (x, y, sublayerId, parentObjId) {

        var newCityMap = new Layer(this.gameData, {
            _id: sublayerId,
            parentObjId: parentObjId,
            width: 10000,
            height: 10000,
            mapTypeId: "cityMapType01",
            parentMapId: this._id,
            mapGeneratorParams: this.mapData.mapObjects.get(parentObjId).blocks.Sublayer.mapGeneratorParams
        });

        this.gameData.layers.add(newCityMap);
    };




    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.notifyStateChange = function(childKey){

        if (childKey) {
            this.mutatedChilds[childKey] = true;
        }

    };

    /**
     * reset the states to oldValue here and in all mutatedChilds recursively.
     */
    /*
    proto.revertChanges = function(){

        // first lock all the state variables, so that during revert the change of one state variables cannot change another state variable:
        this.lockObject.isLocked = true;

        // do the revert recursively
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].revertChanges();
                    }
                    else {
                        // this key is a sub building block
                        this.blocks[key].revertChanges();
                    }
                }
            }
        this.lockObject.isLocked = false;

        this.mutatedChilds = {};

    };
    */


    /**
     * delete all the oldValue fields here and in all mutatedChilds recursively.
     */
    /*
    proto.newSnapshot = function(){

            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].newSnapshot();
                    }
                    else {
                        // this key is a sub building block
                        this.blocks[key].newSnapshot();
                    }
                }
            }

        this.mutatedChilds = {};

    };
    */



    // overwrite super class method and call super.method... TODO: this could be moved into AbstractBlock.
    proto.setInitTypeVars = function() {
        AbstractBlock.prototype.setInitTypeVars.call(this);
        for (var blockName in this.blocks) {
            this.blocks[blockName].setInitTypeVars();
        }
    };


    proto.createBuildingBlocks = function() {
        this.blocks = {};
        for (var blockName in this.mapType.blocks) {
            this.blocks[blockName] = createBlockInstance(blockName,this,this.mapType.blocks[blockName]);
        }
    };


    Layer.prototype.finalizeBlockClass('Layer');
    exports.Layer = Layer;

})(typeof exports === 'undefined' ? window : exports);
//})(node ? exports : window);

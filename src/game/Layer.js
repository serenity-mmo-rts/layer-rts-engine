var node = !(typeof exports === 'undefined');

if (node) {
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
    var Layer = function (gameData, initObj) {
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
        this.eventScheduler = new EventScheduler(gameData);
        this.mapData = new MapData(gameData, this);
        this.hubSystem = new HubSystem(gameData, this);
        this.mapProperties = new MapProperties('3',this.mapData.width,this.mapData.height);
        this.gameData = gameData;
        this.lockObject = { isLocked: false };
        this.mutatedChilds = {};

        // init:
        if (Layer.arguments.length == 2) {
            this.load(initObj);
        }

        switch (this.mapTypeId){

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

    var proto = Layer.prototype;



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

    proto.createSublayer = function (x, y, sublayerId, parentObjId) {

        var newCityMap = new Layer(this._gameData, {
            _id: sublayerId,
            parentObjId: parentObjId,
            width: 10000,
            height: 10000,
            mapTypeId: "cityMapType01",
            parentMapId: this._id,
            mapGeneratorParams: this.mapData.mapObjects.get(parentObjId)._blocks.Sublayer.mapGeneratorParams
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
    proto.revertChanges = function(){

        if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].revertChanges();
                    }
                    else {
                        // this key is a sub building block
                        this._blocks[key].revertChanges();
                    }
                }
            }
        }

        this.mutatedChilds = {};

    };


    /**
     * delete all the oldValue fields here and in all mutatedChilds recursively.
     */
    proto.newSnapshot = function(){

        if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].newSnapshot();
                    }
                    else {
                        // this key is a sub building block
                        this._blocks[key].newSnapshot();
                    }
                }
            }
        }

        this.mutatedChilds = {};

    };




    exports.Layer = Layer;

})(typeof exports === 'undefined' ? window : exports);
//})(node ? exports : window);

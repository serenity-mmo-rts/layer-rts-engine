var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
    var GameData = require('./GameData').GameData;
    var ItemModel = require('./Item').ItemModel;
    var GameList = require('./GameList').GameList;

    var UserObject = require('./mapObjects/UserObject').UserObject;
    var Environment = require('./mapObjects/Environment').Environment;
    var HubNode = require('./mapObjects/HubNode').HubNode ;
    var TechProduction = require('./mapObjects/TechProduction').TechProduction;
    var Sublayer = require('./mapObjects/Sublayer').Sublayer;
    var ResourceProduction = require('./mapObjects/ResourceProduction').ResourceProduction;
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

        // not serialized:
        this.items= [];//new GameList(gameData,ItemModel,false,false);
        this.gameData = gameData;
        this.onChangeCallback = {};


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



        addCallback: function(key,callback){
            this.onChangeCallback[key] = callback;
        },

        removeCallback: function(key){
            delete this.onChangeCallback[key];
        },


    save: function () {


        var blocks = [];
        for (var i=0; i<this._blocks.length; i++) {
            blocks.push(this._blocks[i].save());
        }


        var o = {_id: this._id,
            mapId: this.mapId,
            objTypeId: this.objTypeId,
            a: [this.x,
                this.y,
                this.width,
                this.height,
                this.state,
                blocks]};



        return o;
    },

        /**
         * Saves a MapObject.
         *
         * @constructor (init)
         * @this {MapObject}
         * @param (MapObejct)
         * @return {one}
         */
        load: function (o) {




            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.mapId = o.mapId;
                this.objTypeId = o.objTypeId;
                this.x = o.a[0];
                this.y = o.a[1];
                this.width = o.a[2];
                this.height = o.a[3];
                this.state = o.a[4];
                this._blocks = o.a[5];
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


            var Objects = this.gameData.objectTypes.get(o.objTypeId)._buildingBlocks;
            var BuildingBlocks  = Object.keys(Objects);

            for (var i =0;i<BuildingBlocks.length;i++){
                var name = BuildingBlocks[i];
                var blockObj = Objects[name];
                if (name == "UserObject") {
                    this._blocks[name] = new UserObject(this,this._blocks[name]);
                }
                else if (name == "Environment") {
                    this._blocks[name] = new Environment(this,blockObj);
                }
                else if (name == "SoilPuller") {
                    this._blocks[name] = new SoilPuller(this,blockObj);
                }
                else if (name == "ResourcePusher") {
                    this._blocks[name] = new ResourcePusher(this,blockObj);
                }
                else if (name == "ResourcePuller") {
                    this._blocks[name] = new ResourcePuller(this,blockObj);
                }
                else if (name == "ResourceProduction") {
                    this._blocks[name] = new ResourceProduction(this,blockObj);
                }
                else if (name ==  "HubNode") {
                    this._blocks[name] = new HubNode(this,blockObj);
                }
                else if (name ==  "TechProduction") {
                    this._blocks[name] = new TechProduction(this,blockObj);
                }
                else if (name ==  "Sublayer") {
                    this._blocks[name] = new Sublayer(this,blockObj);
                }
            }


        },


        setPointers : function(){

        }
    });


    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

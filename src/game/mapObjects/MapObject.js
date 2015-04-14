var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var ItemModel = require('../ItemModel').ItemModel;
    var GameList = require('../GameList').GameList;
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

        // not serialized:
        this.items= [];//new GameList(gameData,ItemModel,false,false);
        this.gameData = gameData;
        this.onChangeCallback;

        // init:
        if (MapObject.arguments.length == 2) {
            this.load(initObj);
        }
    },

        setState: function(state) {
            this.state = state;
            this.notifyChange();
        },

        notifyChange: function() {
            if (this.onChangeCallback) this.onChangeCallback();
        },

        addItem: function (item){
            this.items.push(item);
        },

    /**
     * Saves a MapObject.
     *
     * @constructor (init)
     * @this {MapObject}
     * @param (none)
     * @return {MapObject}
     */
    save: function () {
        var o = {_id: this._id,
            mapId: this.mapId,
            objTypeId: this.objTypeId,
            a: [this.x,
                this.y,
                this.width,
                this.height,
                this.state]};
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
        },


        setPointers : function(){

        }
    });


    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

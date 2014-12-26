var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;

}



(function (exports) {

    var mapObjectStates = {};
    mapObjectStates.TEMP = 0;
    mapObjectStates.WORKING = 1;
    mapObjectStates.FINISHED = 2;


    var MapObject = Class.extend({
    /**
     * Creates an instance of a MapObject.
     *
     * @constructor (init)
     * @this {MapObject}
     * @param
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

        // not serialized:
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
            a: [this.objTypeId,
                this.x,
                this.y,
                this.width,
                this.height]};
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
                this.objTypeId = o.a[0];
                this.x = o.a[1];
                this.y = o.a[2];
                this.width = o.a[3];
                this.height = o.a[4];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }
    });


    exports.mapObjectStates = mapObjectStates;
    exports.MapObject = MapObject;

})(typeof exports === 'undefined' ? window : exports);

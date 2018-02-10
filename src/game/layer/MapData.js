var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var Vector = require('./Vector').Vector;
    var QuadTreeCollision = require('./QuadTreeCollision').QuadTreeCollision;
    var Bounds = require('./QuadTreeCollision').Bounds;
}

(function (exports) {

    var MapData = function (gameData, layer) {
        // serialized:

        // not serialized:
        this.layer = layer;
        this.mapObjects = new GameList(gameData, MapObject, false, false, this);
        this.items = new GameList(gameData, Item, false, false, this);
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null;
        this.itemChangedCallback = null;
        this.events = {};

    };

    var proto = MapData.prototype;


    /**
     * get the gameData
     * @returns {*}
     */
    proto.getGameData = function() {
        return this.gameData;
    };

    /**
     * get the map
     * @returns {*}
     */
    proto.getMap = function() {
        return this.layer;
    };

    proto.createTreeObject = function (mapObject) {
        var width;
        var height;
        if (mapObject.hasOwnProperty('width') && mapObject.width() != null) {
            width = mapObject.width();
        }
        else {
            width = this.gameData.objectTypes.get(mapObject.objTypeId())._initWidth;
        }
        if (mapObject.hasOwnProperty('height') && mapObject.height() != null) {
            height = mapObject.height();
        }
        else {
            height = this.gameData.objectTypes.get(mapObject.objTypeId())._initHeight;
        }

        var treeItem = new Bounds().initRectByCenter(
            mapObject.x(),
            mapObject.y(),
            width,
            height,
            mapObject.ori());
        treeItem.obj = mapObject;
        treeItem.type = 'obj';

        return treeItem;
    };

    /**
     * add a listener for a specific area in the map
     * @param callback
     * @param x
     * @param y
     * @param width
     * @param height
     * @param orientation
     * @param listenForObj Boolean check if the callback should listen for newly added objects
     * @param listenForItem Boolean true if callback should listen for newly added items
     */
    proto.listenForChangesInArea = function(callback, x, y, width, height, orientation, listenForObj, listenForItem){

        var treeItem = new Bounds().initRectByCenter(
            x,
            y,
            width,
            height,
            orientation);

        if (listenForObj && listenForItem) {
            treeItem.type = 'listenAll';
        }
        else if (listenForObj){
            treeItem.type = 'listenObj';
        }
        else {
            treeItem.type = 'listenItem';
        }

        treeItem.callback = callback;

    };


    proto.addObject = function (mapObject) {
        //check if object is already in list:
        if (this.mapObjects.hashList.hasOwnProperty(mapObject._id())) {
            console.log("map object was already in list.")
        }
        else {
            //addObjectToMapData:
            this.mapObjects.add(mapObject);

            // notify map listeners:
            var treeItem = this.createTreeObject(mapObject);
            var collidingBounds = this.quadTree.retrieve(treeItem,function(bounds) {
                return bounds.type == "listenAll" || bounds.type == "listenObj";
            });
            for (var i=collidingBounds.length-1; i>=0; i--){
                collidingBounds[i].callback();
            }

            //addObjectToTree:
            this.quadTree.insert(treeItem);
        }

        if (this.objectChangedCallback) {
            this.objectChangedCallback(mapObject);
        }
    };

    /**
     * this function assumes that all the rest of the layer is already loaded. The function will create all pointers between objects
     */
    proto.setPointers = function () {
        this.mapObjects.each(function (mapObject) {
            mapObject.setPointers()
        });
        this.items.each(function (item) {
            item.setPointers()
        });
    };

    proto.removeObject = function (mapObject) {
        //check if object is in list:
        if (this.mapObjects.hashList.hasOwnProperty(mapObject._id())) {
            this.mapObjects.deleteById(mapObject._id());
        }
        if (this.objectChangedCallback) {
            this.objectChangedCallback(mapObject);
        }
    };


    proto.addItem = function (item) {
        //check if item is already in list:
        if (this.items.hashList.hasOwnProperty(item._id())) {
            console.log("item was already in list.")
        }
        else {
            //addObjectToMapData:
            this.items.add(item);
        }


    };

    proto.removeItem = function (item) {
        //check if object is already in list:
        if (this.items.hashList.hasOwnProperty(item._id())) {
            delete this.items.deleteById(item._id());
        }

    };

    proto.rebuildQuadTree = function () {

        var bounds = new Bounds().initRectByCenter(0, 0, this.layer.width, this.layer.height, 0);
        var periodicBounds = false;
        var maxDepth = 10;
        var maxChildren = 5;
        this.quadTree = new QuadTreeCollision(bounds, periodicBounds, maxChildren, maxDepth);

        for (var id in this.mapObjects.hashList) {
            var treeItem = this.createTreeObject(this.mapObjects.hashList[id]);
            this.quadTree.insert(treeItem);
        }

    };

    /**
     * check if a mapObject is colliding with any other objects in the layer
     * @param mapObject The mapObject to test for collisions
     * @returns {Array} An array of other mapObjects that are colliding with the given mapObject
     */
    proto.collisionDetection = function (mapObject) {
        // retrieve from quad tree all candidates:
        var testBounds = this.createTreeObject(mapObject);
        var collidingBounds = this.quadTree.retrieve(testBounds);
        var collidingItems = [];
        for (var i=collidingBounds.length-1; i>=0; i--){
            collidingItems.push(collidingBounds[i].obj);
        }
        return collidingItems;
    };



    proto.getObjectsInRange = function (coord, range, type) {

        var testBounds = new Bounds().initCircle(coord[0],coord[1],range);
        var collidingBounds = this.quadTree.retrieve(testBounds);
        var inRange = [];
        for (var i=collidingBounds.length-1; i>=0; i--){
            var obj = collidingBounds[i];
            var dx = obj.x() - coord[0];
            var dy = obj.y() - coord[1];
            if (type == 0) { // all objects
                if (dx * dx + dy * dy < range * range) {
                    inRange.push(obj);
                }
            }
            else if (type == 1) { // take only user objects
                if (obj._blocks.hasOwnProperty("UserObject") && dx * dx + dy * dy < range * range) {
                    inRange.push(obj);
                }
            }
        }
        return inRange;
    };


    exports.MapData = MapData;

})(node ? exports : window);

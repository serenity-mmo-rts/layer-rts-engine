var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;
    var Vector = require('./Vector').Vector;
    var QuadTreeCollision = require('./QuadTreeCollision').QuadTreeCollision;
    var Bounds = require('./QuadTreeCollision').Bounds;
    var ko = require('../../client/lib/knockout-3.3.0.debug.js');
}

(function (exports) {

    var MapData = function (gameData, layer) {
        // serialized:

        // not serialized:
        this.layer = layer;
        this.lockObject = layer.lockObject;
        this.mapObjects = new GameList(gameData, MapObject, false, false, this, 'mapObjects');
        this.items = new GameList(gameData, Item, false, false, this, 'items');
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null;
        this.itemChangedCallback = null;
        this.events = {};

        this.mutatedChilds = {};
        this.isMutated = false;
        this.parent = layer;

        this.blockname = 'mapData';



    };

    var proto = MapData.prototype;

    MapData.COLLISION_OBJ = 0;
    MapData.COLLISION_ITEM = 1;
    MapData.COLLISION_LISTEN_ALL = 2;
    MapData.COLLISION_LISTEN_OBJ = 3;
    MapData.COLLISION_LISTEN_ITEM = 4;



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
            width = this.gameData.objectTypes.get(mapObject.objTypeId()).initWidth;
        }
        if (mapObject.hasOwnProperty('height') && mapObject.height() != null) {
            height = mapObject.height();
        }
        else {
            height = this.gameData.objectTypes.get(mapObject.objTypeId()).initHeight;
        }

        var treeItem = new Bounds().initRectByCenter(
            mapObject.x(),
            mapObject.y(),
            width,
            height,
            mapObject.ori());
        treeItem.obj = mapObject;
        mapObject.treeItem = treeItem;
        treeItem.type = MapData.COLLISION_OBJ;

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
    proto.addListenerForArea = function(callback, bounds, listenForObj, listenForItem, executeOnce){


        if (listenForObj && listenForItem) {
            bounds.type = MapData.COLLISION_LISTEN_ALL;
        }
        else if (listenForObj){
            bounds.type = MapData.COLLISION_LISTEN_OBJ;
        }
        else {
            bounds.type = MapData.COLLISION_LISTEN_ITEM;
        }

        bounds.callback = callback;
        this.quadTree.insert(bounds);

        // Shall we execute once in the beginning for all items in range?
        if (executeOnce) {
            var preCollisionCheck;
            if (listenForObj && listenForItem) {
                preCollisionCheck = function(bounds){
                    return bounds.type == MapData.COLLISION_OBJ || bounds.type == MapData.COLLISION_ITEM;
                };
            }
            else if (listenForObj){
                preCollisionCheck = function(bounds){
                    return bounds.type == MapData.COLLISION_OBJ;
                };
            }
            else {
                preCollisionCheck = function(bounds){
                    return bounds.type == MapData.COLLISION_ITEM;
                };
            }
            var collidingBounds = this.quadTree.retrieve( bounds, preCollisionCheck );
            var collidingItems = [];
            for (var i=collidingBounds.length-1; i>=0; i--){
                callback('adding', collidingBounds[i].obj);
            }
        }

        return bounds;

    };

    proto.removeListenerForArea = function(treeItem){
        this.quadTree.remove(treeItem);
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
                return bounds.type == MapData.COLLISION_LISTEN_ALL || bounds.type == MapData.COLLISION_LISTEN_OBJ;
                return bounds.type == MapData.COLLISION_LISTEN_ALL || bounds.type == MapData.COLLISION_LISTEN_OBJ;
            });
            for (var i=collidingBounds.length-1; i>=0; i--){
                collidingBounds[i].callback('adding',mapObject);
            }

            //addObjectToTree:
            mapObject.treeItem = treeItem;
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
        this.rebuildQuadTree();
        this.mapObjects.each(function (mapObject) {
            mapObject.setPointers();
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

        // remove from quadtree
        this.quadTree.remove(mapObject.treeItem);
        var collidingBounds = this.quadTree.retrieve(mapObject.treeItem,function(bounds) {
            return bounds.type == MapData.COLLISION_LISTEN_ALL || bounds.type == MapData.COLLISION_LISTEN_OBJ;
        });
        for (var i=collidingBounds.length-1; i>=0; i--){
            collidingBounds[i].callback('removing',mapObject);
        }
        delete mapObject["treeItem"];

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

        for (var _id in this.mapObjects.hashList) {
            var treeItem = this.createTreeObject(this.mapObjects.hashList[_id]);
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
        var collidingBounds = this.quadTree.retrieve(testBounds,function(bounds) {
            return bounds.type == MapData.COLLISION_OBJ || bounds.type == MapData.COLLISION_ITEM;
        });
        var collidingItems = [];
        for (var i=collidingBounds.length-1; i>=0; i--){
            collidingItems.push(collidingBounds[i].obj);
        }
        return collidingItems;
    };



    proto.getObjectsInRange = function (coord, range, type) {

        var testBounds = new Bounds().initCircle(coord[0],coord[1],range);
        var collidingBounds = this.quadTree.retrieve(testBounds,function(bounds) {
            return bounds.type == MapData.COLLISION_OBJ || bounds.type == MapData.COLLISION_ITEM;
        });
        var inRange = [];
        for (var i=collidingBounds.length-1; i>=0; i--){
            var obj = collidingBounds[i].obj;
            if (ko.isObservable(obj.x)){
                var dx = obj.x() - coord[0];
            }
            else{
                var dx = obj.x - coord[0];
            }
            if (ko.isObservable(obj.y)){
                var dy = obj.y() - coord[1];
            }
            else{
                var dy = obj.y - coord[1];
            }

            if (type == 0) { // all objects
                if (dx * dx + dy * dy < range * range) {
                    inRange.push(obj);
                }
            }
            else if (type == 1) { // take only user objects
                if (obj.blocks.hasOwnProperty("UserObject") && dx * dx + dy * dy < range * range) {
                    inRange.push(obj);
                }
            }
        }
        return inRange;
    };



    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.notifyStateChange = function(childKey){

        if (childKey) {
            this.mutatedChilds[childKey] = true;
        }

        // Now notify the parent:
        if (!this.isMutated) {
            this.isMutated = true;
            if (this.hasOwnProperty("_id")) {
                // if this is a game instance with an _id. For example item or mapObject:
                this.parent.notifyStateChange(this._id());
            }
            else {
                // if this is a building block without _id. For example UpgradeProdcution:
                this.parent.notifyStateChange(this.blockname);
            }
        }

    };

    /**
     * reset the states to oldValue here and in all mutatedChilds recursively.
     */
    proto.revertChanges = function(){

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

        this.isMutated = false;
        this.mutatedChilds = {}

    };


    /**
     * delete all the oldValue fields here and in all mutatedChilds recursively.
     */
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

        this.isMutated = false;
        this.mutatedChilds = {}

    };





    exports.MapData = MapData;

})(node ? exports : window);

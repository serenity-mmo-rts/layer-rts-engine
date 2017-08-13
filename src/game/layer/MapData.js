var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var MapObject = require('../MapObject').MapObject;
    var Item = require('../Item').Item;

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


    }

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

        // now calculate the width and heigth in the global map coordinate system after rotating the object by ori:
        if (mapObject.hasOwnProperty('ori') && mapObject.ori() != 0) {
            var cosOri = Math.cos(mapObject.ori());
            var sinOri = Math.sin(mapObject.ori());
            var w = mapObject.width();
            var h = mapObject.height();
            width = Math.abs(cosOri * w + sinOri * h);
            height = Math.abs(sinOri * w + cosOri * h);
        }

        var treeItem = {
            x: mapObject.x() - width / 2,
            y: mapObject.y() - height / 2,
            width: width,
            height: height,
            obj: mapObject
        }
        return treeItem;
    };


    proto.addObject = function (mapObject) {
        //check if object is already in list:
        if (this.mapObjects.hashList.hasOwnProperty(mapObject._id)) {
            console.log("map object was already in list.")
        }
        else {
            //addObjectToMapData:
            this.mapObjects.add(mapObject);

            //addObjectToTree:
            var treeItem = this.createTreeObject(mapObject);
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
        if (this.mapObjects.hashList.hasOwnProperty(mapObject._id)) {
            this.mapObjects.deleteById(mapObject._id);
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
        this.quadTree = new window.QuadTree({
            x: -this.layer.width / 2,
            y: -this.layer.height / 2,
            width: this.layer.width,
            height: this.layer.height
        }, false);

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
        var testItem = this.createTreeObject(mapObject);
        var candidates = this.quadTree.retrieve(testItem);

        var collidingItems = [];

        // detect collisions with candidates:
        var ids = {};
        for (var i = 0, l = candidates.length; i < l; i++) {
            var candidate = candidates[i];
            if (mapObject.isColliding(candidate.obj)) {
                if (!ids.hasOwnProperty(candidate.obj._id)) {
                    collidingItems.push(candidate.obj);
                    ids[candidate.obj._id] = null;
                }
            }

        }

        return collidingItems;
    };

    proto.getObjectsInRange = function (coord, range, type) {
        var mapObj = new MapObject(this.gameData, {
            x: coord[0],
            y: coord[1],
            width: range * 2,
            height: range * 2,
            mapId: this.layer._id
        });
        var inRange = [];
        var collidingMapObjects = this.collisionDetection(mapObj);
        for (var index in collidingMapObjects) {
            var dx = collidingMapObjects[index].x() - mapObj.x();
            var dy = collidingMapObjects[index].y() - mapObj.y();
            if (type == 0) { // all objects
                if (dx * dx + dy * dy < range * range) {
                    inRange.push(collidingMapObjects[index]);
                }
            }
            else if (type == 1) { // take only user objects
                if (collidingMapObjects[index]._blocks.hasOwnProperty("UserObject") && dx * dx + dy * dy < range * range) {
                    inRange.push(collidingMapObjects[index]);
                }
            }

        }
        return inRange;
    };


    exports.MapData = MapData;

})(node ? exports : window);

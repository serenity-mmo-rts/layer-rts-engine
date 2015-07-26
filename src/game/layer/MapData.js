var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('../GameList').GameList;
    var MapObject = require('../MapObject').MapObject;
    var ItemModel = require('../Item').ItemModel;

}

(function (exports) {

    var MapData = function (gameData,layer) {
        // serialized:

        // not serialized:
        this.layer = layer;
        this.mapObjects = new GameList(gameData,MapObject,false,false);
        this.items = new GameList(gameData,ItemModel,false,false);
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null;
        this.itemChangedCallback = null;


    }

    MapData.prototype = {

        createTreeObject: function (mapObject) {
            var width;
            var height;
            if (mapObject.hasOwnProperty('width') && mapObject.width != null) {
                width = mapObject.width;
            }
            else {
                width = this.gameData.objectTypes.get(mapObject.objTypeId)._initWidth;
            }
            if (mapObject.hasOwnProperty('height') && mapObject.height != null) {
                height = mapObject.height;
            }
            else {
                height = this.gameData.objectTypes.get(mapObject.objTypeId)._initHeight;
            }

            var treeItem = {
                x: mapObject.x - width / 2,
                y: mapObject.y - height / 2,
                width: width,
                height: height,
                obj: mapObject
            }
            return treeItem;
        },




        addObject: function (mapObject) {
            //check if object is already in list:
            if (this.mapObjects.hashList.hasOwnProperty(mapObject._id)) {
                console.log("map object was already in list.")
            }
            else {
                //addObjectToMapData:
                this.mapObjects.hashList[mapObject._id] = mapObject;

                //addObjectToTree:
                var treeItem = this.createTreeObject(mapObject);
                this.quadTree.insert(treeItem);
            }

            if (this.objectChangedCallback) {
                this.objectChangedCallback(mapObject);
            }
        },

        removeObject: function (mapObject) {
            //check if object is already in list:
            if (this.mapObjects.hashList.hasOwnProperty(mapObject._id)) {
                delete this.mapObjects.hashList[mapObject._id];
                //var treeItem = this.createTreeObject(mapObject);
                //this.quadTree.remove(treeItem);
            }
            if (this.objectChangedCallback) {
                this.objectChangedCallback(mapObject);
            }
        },


        addItem: function (item) {
            //check if item is already in list:
            if (this.items.hashList.hasOwnProperty(item._id)) {
                console.log("item was already in list.")
            }
            else {
                //addObjectToMapData:
                this.items.hashList[item._id] = item;
            }



        },

        removeItem: function (item) {
            //check if object is already in list:
            if (this.items.hashList.hasOwnProperty(item._id)) {
                delete this.items.hashList[item._id];

            }

        },

        rebuildQuadTree: function() {
            this.quadTree = new window.QuadTree({x: -this.layer.width / 2, y: -this.layer.height / 2, width: this.layer.width, height: this.layer.height}, false);

            for (var id in this.mapObjects.hashList) {
                var treeItem = this.createTreeObject(this.mapObjects.hashList[id]);
                this.quadTree.insert(treeItem);
            }

        },

        /**
         * check if a mapObject is colliding with any other objects in the layer
         * @param mapObject The mapObject to test for collisions
         * @returns {Array} An array of other mapObjects that are colliding with the given mapObject
         */
        collisionDetection: function (mapObject) {
            // retrieve from quad tree all candidates:
            var testItem = this.createTreeObject(mapObject);
            var candidates = this.quadTree.retrieve(testItem);

            var collidingItems = [];

            // detect collisions with candidates:
            var ids = {};
            for (var i = 0, l = candidates.length; i < l; i++) {
                var candidate = candidates[i];
                if (mapObject.isColliding(candidate.obj)) {
                    if (!ids.hasOwnProperty(candidate.obj._id)){
                        collidingItems.push(candidate.obj);
                        ids[candidate.obj._id] = null;
                    }
                }

            }

            return collidingItems;
        },

        getObjectsInRange: function (coord,range,type) {
            var mapObj = {
                x: coord[0],
                y: coord[1],
                width: range*2,
                height: range*2
            }
            var inRange = [];
            var collidingMapObjects = this.collisionDetection(mapObj);
            for (var index in collidingMapObjects) {
                var dx = collidingMapObjects[index].x - mapObj.x;
                var dy = collidingMapObjects[index].y - mapObj.y;
                if (type ==0){ // all objects
                    if( dx*dx + dy*dy < range*range) {
                        inRange.push(collidingMapObjects[index]);
                    }
                }
                else if (type==1){ // take only user objects
                    if (collidingMapObjects[index].hasOwnProperty("userId")&& dx*dx + dy*dy < range*range){
                        inRange.push(collidingMapObjects[index]);
                    }
                }

            }
            return inRange;
        }

    }


    exports.MapData = MapData;

})(node ? exports : window);

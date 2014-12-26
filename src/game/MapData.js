var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var MapObject = require('./mapObjects/MapObject').MapObject;
    var EventScheduler = require('./events/EventScheduler').EventScheduler;
}

(function (exports) {
    var MapData = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.width = 0;
        this.height = 0;
        this.mapTypeId = null;

        // not serialized:
        this.mapObjects = new GameList(gameData,MapObject);
        this.eventScheduler = new EventScheduler(gameData);
        this.quadTree = null;
        this.gameData = gameData;
        this.objectChangedCallback = null


        // init:
        if (MapData.arguments.length == 2) {
            this.load(initObj);
        }

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

        rebuildQuadTree: function() {
            this.quadTree = new window.QuadTree({x: -this.width / 2, y: -this.height / 2, width: this.width, height: this.height}, false);

            for (var id in this.mapObjects.hashList) {
                var treeItem = this.createTreeObject(this.mapObjects.hashList[id]);
                this.quadTree.insert(treeItem);
            }

        },

        collisionDetection: function (mapObject) {

            function boundsToRect(b) {
                return {
                    left:   b.x,
                    top:    b.y,
                    right:  b.x+b.width,
                    bottom: b.y+b.height
                };
            }

            function intersectBounds(r1, r2) {

                return !(r2.left > r1.right ||
                    r2.right < r1.left ||
                    r2.top > r1.bottom ||
                    r2.bottom < r1.top);
            }

            var testItem = this.createTreeObject(mapObject);
            var testItemRect=boundsToRect(testItem);

            var items = this.quadTree.retrieve(testItem);

            var collidingItems = [];

            // detect collision:

            for (var i = 0, l = items.length; i < l; i++) {
                var item = items[i];

                // TODO: collisionType = 0; // 0=NoCollision, 1=overlapping, 2=item in testItem, 3=testItem in item

                if (intersectBounds(testItemRect, boundsToRect(item))) {
                //if (item.x < testItem.x + testItem.width && item.x + item.width > testItem.x &&
                //    item.y < testItem.y + testItem.height && item.y + item.height > testItem.y) {
                    collidingItems.push(item.obj);
                }

            }
            //TODO: detect orientations etc.

            return collidingItems;
        },

        save: function () {
            var o = {_id: this._id,
                a: [this.width,
                    this.height,
                    this.mapTypeId]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this.width = o.a[0];
                this.height = o.a[1];
                this.mapTypeId = o.a[2];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
            this.rebuildQuadTree();
        }
    }

    exports.MapData = MapData;

})(node ? exports : window);

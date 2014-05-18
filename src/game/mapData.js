var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var MapObject = require('./MapObject').MapObject;
}

(function (exports) {
    var MapData = function (gameData,initObj) {
        // serialized:
        this._id = 0;
        this.width = 0;
        this.height = 0;
        this.mapTypeId = null;
        this.mapObjects = new GameList(gameData,MapObject);

        // not serialized:
        this.quadTree = null;
        this.gameData = gameData;

        // init:
        if (MapData.arguments.length == 2) {
            this.load(initObj);
        }

    }

    MapData.prototype = {


        setMapSize: function (width, height) {
            this.quadTree = new window.QuadTree({x: -this.width / 2, y: -this.height / 2, width: this.width, height: this.height}, false);
        },

        createTreeObject: function (mapObject) {
            var width;
            var height;
            if (mapObject.hasOwnProperty('width')) {
                width = mapObject.width;
            }
            else {
                width = this.gameData.objectTypes[mapObject.objTypeId].width;
            }
            if (mapObject.hasOwnProperty('height')) {
                width = mapObject.height;
            }
            else {
                width = this.gameData.objectTypes[mapObject.objTypeId].height;
            }

            var treeItem = {
                x: mapObject.x - mapObject.width / 2,
                y: mapObject.y - mapObject.height / 2,
                width: width,
                height: height,
                obj: mapObject
            }
            return treeItem;
        },

        addObjectToTree: function (mapObject) {
            var treeItem = createTreeObject(mapObject);
            quadTree.insert(treeItem);
        },

        addObjectToMapData: function (mapObject) {
            this.mapObjects.hashList[mapObject._id] = mapObject;
        },

        addObject: function (mapObject) {
            this.addObjectToTree(mapObject);
            this.addObjectToMapData(mapObject);
        },

        collisionDetection: function (mapObject) {
            var testItem = this.createTreeObject(mapObject);
            var items = quadTree.retrieve(testItem);

            var collidingItems = [];

            // detect collision:

            for (var i = 0, l = items.length; i < l; i++) {
                var item = items[i].obj;

                // TODO: collisionType = 0; // 0=NoCollision, 1=overlapping, 2=item in testItem, 3=testItem in item

                if (item.x < testItem.x + testItem.width && item.x + item.width > testItem.x &&
                    item.y < testItem.y + testItem.height && item.y + item.height > testItem.y) {
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
                    this.mapTypeId,
                    this.mapObjects.save()]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                var a = o.a;
                this.width = o.a[0];
                this.height = o.a[1];
                this.mapTypeId = o.a[2];
                this.mapObjects.load(o.a[3]);
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }
    }

    exports.MapData = MapData;

})(node ? exports : window);

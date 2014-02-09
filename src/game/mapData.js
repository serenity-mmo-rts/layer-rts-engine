var MapData = function(objDesc) {
    this._id;
    this.width;
    this.height;
    this.mapId;
    this.mapTypeId;
    var quadTree = new window.QuadTree({x:0, y:0, width:this.width, height:this.height},false);
    this.mapObjects = {};

    if (MapData.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                if (key=="mapObjects") {
                    if(objDesc.mapObjects instanceof GameList) {
                        this.mapObjects = objDesc.mapObjects;
                    }
                    else {
                        this.mapObjects = new GameList(MapObject.prototype,objDesc.mapObjects);
                    }
                    for (obj in this.mapObjects) {
                        addObjectToTree(obj);
                    }
                }
                else {
                    this[key] = objDesc[key];
                }
            }
        }
    }
    else {
        this.mapObjects = new GameList(MapObject.prototype);
    }

    function addObjectToTree(mapObject) {
        var treeItem = {
            x: mapObject.x,
            y: mapObject.y,
            width: mapObject.width,
            height: mapObject.height,
            obj: mapObject
        }
        quadTree.insert(treeItem);
    }
}

MapData.prototype.collisionDetection = function (mapObject) {

    var items = quad.retrieve({x:mapObject.x, y:mapObject.y, height:mapObject.height, width:mapObject.width});

    //TODO: detect orientations etc.

    return items;
}
var MapData = function(objDesc) {
    this._id;
    this.width = objDesc.width;
    this.height = objDesc.height;
    this.mapId;
    this.mapTypeId;
    var quadTree = new window.QuadTree({x:-this.width/2, y:-this.height/2, width:this.width, height:this.height},false); //private variable
    this.mapObjects = {};

    ////////////////////////////////////////////////////////////////
    // Privileged Member Functions: (they need to access quadTree)
    ////////////////////////////////////////////////////////////////

    this.addObjectToTree = function(mapObject) {
        var treeItem = {
            x: mapObject.x-mapObject.width/2,
            y: mapObject.y-mapObject.height/2,
            width: mapObject.width,
            height: mapObject.height,
            obj: mapObject
        }
        quadTree.insert(treeItem);
    }

    this.collisionDetection = function (mapObject) {

        var items = quadTree.retrieve({x:mapObject.x-mapObject.width/2, y:mapObject.y-mapObject.height/2, height:mapObject.height, width:mapObject.width});

        //TODO: detect orientations etc.

        return items;
    }

    this.getQuadTree = function () {
        return quadTree;
    }

    if (MapData.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                if (key=="mapObjects") {
                    if(objDesc.mapObjects instanceof GameList) {
                        this.mapObjects = objDesc.mapObjects;
                    }
                    else {
                        this.mapObjects = new GameList(MapObject,objDesc.mapObjects);
                    }
                    for (obj_id in this.mapObjects.hashList) {
                        this.addObjectToTree(this.mapObjects.hashList[obj_id]);
                    }
                }
                else {
                    this[key] = objDesc[key];
                }
            }
        }
    }
    else {
        this.mapObjects = new GameList(MapObject);
    }




}
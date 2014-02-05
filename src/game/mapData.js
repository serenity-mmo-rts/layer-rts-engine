var MapData = function() {
    this.width;
    this.height;
    this.mapId;
    this.mapTypeId;
    this.quadTree = new QuadTree({x:0, y:0, width:width, height:height},false);
    this.objects = {}; //use objId as key for fast access
}

MapData.prototype.collisionDetection = function (object) {

    var items = quad.retrieve({x:object.x, y:object.y, height:object.height, width:object.width});
    return items;
}
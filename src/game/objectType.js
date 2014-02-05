var ObjectType = function(typeid,width,height) {
    this.typeid = typeid;
    this.width = width;
    this.height= height;
    this.allowOnMapTypeId = [];
    this.hasChildMapTypeId;
    this.name;

    this.getArea = function () {
        return this.width*this.height;
    }
}
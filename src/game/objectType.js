var ObjectType = function() {
    this._id;
    this.width;
    this.height;
    this.allowOnMapTypeId = [];
    this.hasChildMapTypeId;
    this.name;
    this.spritesheetId;
    this.spriteFrame;
}

ObjectType.prototype.getArea = function () {
    return this.width * this.height;
}
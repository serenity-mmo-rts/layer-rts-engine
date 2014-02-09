var ObjectType = function(objDesc) {
    this._id;
    this.initWidth;
    this.initHeight;
    this.allowOnMapTypeId = [];
    this.hasChildMapTypeId;
    this.name;
    this.spritesheetId;
    this.spriteFrame;

    if (ObjectType.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                this[key] = objDesc[key];
            }
        }
    }
}

ObjectType.prototype.getArea = function () {
    return this.width * this.height;
}
var MapType = function(objDesc) {
    this._id;
    this.name;
    this.scale;
    this.bgColor;
    this.groundImage;
    this.groundImageScaling;

    if (MapType.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                this[key] = objDesc[key];
            }
        }
    }
}

var MapObject = function(objDesc) {
    this._id;
    this.x;
    this.y;
    this.objTypeId;
    this.userId;

    if (MapObject.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                this[key] = objDesc[key];
            }
        }
    }
}


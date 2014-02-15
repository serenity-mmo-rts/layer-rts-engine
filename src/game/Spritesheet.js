var Spritesheet = function(objDesc) {
    this._id;
    this.images;
    this.frames;
    //this.animations;

    if (Spritesheet.arguments.length == 1) {
        for(var key in objDesc) {
            if(objDesc.hasOwnProperty(key)) {
                this[key] = objDesc[key];
            }
        }
    }
}
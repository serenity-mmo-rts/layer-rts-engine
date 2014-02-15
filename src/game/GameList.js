// ClassType should be a class with field _id which is used as key in the list

var GameList = function(ClassType, objDesc) {
    this.hashList = {};
    this.ClassType = ClassType;

    if (GameList.arguments.length == 2) {
        if ( objDesc instanceof Array ) { // objDesc is an Array of <ClassType> or an Array of JsonFormated <ClassType>
            for (var i = 0, length = objDesc.length; i<length; i++) {
                var objInstance = new this.ClassType(objDesc[i]);
                this.hashList[objInstance._id] = objInstance;
            }
        }
        else { // objDesc is a GameList but in jsonFormat
            if (objDesc.hasOwnProperty('hashList')) {
                for(var propt in objDesc.hashList){
                    this.hashList[propt] = new this.ClassType(objDesc.hashList[propt]);
                }
            }
            else {
                for(var propt in objDesc){
                    this.hashList[propt] = new this.ClassType(objDesc[propt]);
                }
            }
        }
    }
}

GameList.prototype.add = function(objDesc) {
    if ( objDesc instanceof this.ClassType.constructor ) {
        this.hashList[objDesc._id] = objDesc;
        return this.hashList[objDesc._id];
    }
    else {
        var objInstance = new this.ClassType(objDesc);
        this.hashList[objInstance._id] = objInstance;
        return this.hashList[objInstance._id];
    }
}
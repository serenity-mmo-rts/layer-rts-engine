// ClassType should be a class with field _id which is used as key in the list

(function (exports) {

    var GameList = function (gameData,ClassType,initObj) {
        // serialized:
        this.hashList = {};

        // not serialized:
        this.ClassType = ClassType;
        this.gameData = gameData;

        // init:
        if (GameList.arguments.length == 3) {
            this.load(initObj);
        }
    }

    GameList.prototype = {
        add: function(o) {
            if (o instanceof this.ClassType) {
                //console.log("adding to GameList by appending object")
                this.hashList[o._id] = o;
                return this.hashList[o._id];
            }
            else {
                //console.log("adding to GameList with copying")
                var objInstance = new this.ClassType(this.gameData,o);
                this.hashList[objInstance._id] = objInstance;
                return this.hashList[objInstance._id];
            }
        },

        get: function(id) {
            return this.hashList[id];
        },

        each: function(func) {
            for (var k in this.hashList) {
                func(this.hashList[k]);
            }
        },

        save: function () {
            var asArray = [];
            for (var k in this.hashList) {
                asArray.push(this.hashList[k].save());
            }
            return asArray;
        },

        load: function (o) {
            if (o instanceof Array) { // o is an Array of <ClassType> or an Array of JsonFormated <ClassType>
                for (var i = 0, length = o.length; i < length; i++) {
                    var objInstance = new this.ClassType(this.gameData,o[i]);
                    this.hashList[objInstance._id] = objInstance;
                }
            }
            else { // o is a GameList but in jsonFormat
                if (o.hasOwnProperty('hashList')) {
                    for (var propt in o.hashList) {
                        this.hashList[propt] = new this.ClassType(this.gameData,o.hashList[propt]);
                    }
                }
                else {
                    for (var propt in o) {
                        this.hashList[propt] = new this.ClassType(this.gameData,o[propt]);
                    }
                }
            }
        }
    }

    exports.GameList = GameList;

})(typeof exports === 'undefined' ? window : exports);

var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
}


// ClassType should be a class with field _id which is used as key in the list

(function (exports) {

    var GameList = function (gameData,ClassType,initObj,factoryMethod) {


        // serialized:
        this.hashList = {};

        // not serialized:
        this.factoryMethod = factoryMethod || false;
        this.ClassType = ClassType;
        this.gameData = gameData;

        // init:
        if (initObj) {
            this.load(initObj);
        }
    }

    GameList.prototype = {
        add: function(o) {
            if (o instanceof Class || o instanceof this.ClassType) {
                //console.log("adding to GameList by appending object")
                this.hashList[o._id] = o;
                return this.hashList[o._id];
            }
            else {
                //console.log("adding to GameList with copying")
                if (this.factoryMethod) {
                    var objInstance = this.factoryMethod(this.gameData,o);
                }
                else {
                    var objInstance = new this.ClassType(this.gameData,o);
                }
                this.hashList[objInstance._id] = objInstance;
                return this.hashList[objInstance._id];
            }

        },

        updateId: function(oldId, newId) {
            var tmpObj = this.hashList[oldId];
            this.deleteById(oldId)
            tmpObj._id = newId;
            return this.add(tmpObj);
        },

        deleteById: function(id) {
            delete this.hashList[id];
        },

        delete: function(o) {
            if (o instanceof this.ClassType) {
                delete this.hashList[o._id];
            }
            else {
                delete this.hashList[o._id];
            }

        },

        get: function(id) {
            return this.hashList[id];
        },

        length: function() {
            // TODO: implement browser check or use underscore and _.size(object) or _.keys(object).length
            // for all old browsers:
            var count = 0;
            for (k in this.hashList) if (this.hashList.hasOwnProperty(k)) count++;
            return count;
            // faster version, but only working in Node, Chrome, IE 9+, FF 4+, or Safari 5+:
            //return Object.keys(this.hashList).length;
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
                    if(this.factoryMethod) {
                        var objInstance = this.factoryMethod(this.gameData,o[i]);
                    }
                    else {
                        var objInstance = new this.ClassType(this.gameData,o[i]);
                    }
                    this.hashList[objInstance._id] = objInstance;
                }
            }
            else { // o is a GameList but in jsonFormat
                if (o.hasOwnProperty('hashList')) {
                    for (var propt in o.hashList) {
                        if(this.factoryMethod) {
                            this.hashList[propt] = this.factoryMethod(this.gameData,o.hashList[propt]);
                        }
                        else {
                            this.hashList[propt] = new this.ClassType(this.gameData,o.hashList[propt]);
                        }
                    }
                }
                else {
                    for (var propt in o) {
                        if(this.factoryMethod) {
                            this.hashList[propt] = this.factoryMethod(this.gameData,o[propt]);
                        }
                        else {
                            this.hashList[propt] = new this.ClassType(this.gameData,o[propt]);
                        }
                    }
                }
            }
        }
    }

    exports.GameList = GameList;

})(typeof exports === 'undefined' ? window : exports);

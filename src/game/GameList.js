var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('./Class').Class;
    var ko = require('../client/lib/knockout-3.3.0.debug.js');
}


// ClassType should be a class with field _id which is used as key in the list

(function (exports) {

    var GameList = function (gameData, ClassType, initObj, factoryMethod, parent, childKey) {


        // serialized:
        this.hashList = {};

        // not serialized:
        this.factoryMethod = factoryMethod || false;
        this.ClassType = ClassType;
        this.gameData = gameData;
        this.parent = parent;
        this.mutatedChilds = {};
        this.sinceSnapshotRemoved = [];
        this.sinceSnapshotAdded = [];
        this.childKey = childKey;

        if (parent) {
            this.lockObject = parent.lockObject;
        }


        // init:
        if (initObj) {
            this.load(initObj);
        }
    };

    var proto = GameList.prototype;


    /**
     * get the gameData
     * @returns {*}
     */
    proto.getGameData = function() {
        if (this.hasOwnProperty("gameData")){
            return this.gameData;
        }
        else {
            return this.parent.getGameData();
        }
    };

    /**
     * get the map
     * @returns {*}
     */
    proto.getMap = function() {
        if (this.hasOwnProperty("map")){
            return this.map;
        }
        else {
            return this.parent.getMap();
        }
    };

    /*
     this function also calls embedded(true) of the objects
     */
    proto.add = function (o) {



        if (o instanceof Class || o instanceof this.ClassType) {
            var id;

            if (ko.isObservable(o._id)) {
                id = o._id();
            }
            else {
                id = o._id;
            }
            if (this.hashList.hasOwnProperty(id)) {
                console.log("warning: this id already exists in GameList. Overwriting...");
            }
            //console.log("adding to GameList by appending object")
            this.hashList[id] = o;
            if (!this.lockObject.isLocked) {
                this.mutatedChilds[id] = true;
                this.sinceSnapshotAdded.push(o);
            }
            if (typeof o.embedded === "function") {
                o.embedded(true);
            }
            return this.hashList[id];
        }
        else {
            console.log("warning: adding to GameList with copying")
            if (this.factoryMethod) {
                var objInstance = this.factoryMethod(this.gameData, o);
            }
            else {
                var objInstance = new this.ClassType(this.gameData, o);
            }
            if (!this.lockObject.isLocked) {
                this.mutatedChilds[objInstance._id()] = true;
                this.sinceSnapshotAdded.push(objInstance);
            }
            if (typeof objInstance.embedded === "function") {
                objInstance.embedded(true);
            }
            return this.add(objInstance);
        }





    };

    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.notifyStateChange = function(childKey){

        if (childKey) {
            if (this.hashList.hasOwnProperty(childKey)) {
                this.mutatedChilds[childKey] = true;
            }
        }

        // Now notify the parent:
        if (!this.isMutated) {
            this.isMutated = true;
            if (typeof this.parent.notifyStateChange === "function") {
                this.parent.notifyStateChange(this.childKey);
            }

        }

    };


    proto.newSnapshot = function() {
        // delete all the oldValue fields here and in all mutatedChilds recursively.
        if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    this.hashList[key].newSnapshot();
                }
            }
        }
        this.mutatedChilds = {};
        this.sinceSnapshotRemoved = [];
        this.sinceSnapshotAdded = [];
        this.isMutated = false;
    };



    proto.revertChanges = function() {
        // reset the states to oldValue here and in all mutatedChilds recursively.
        //if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    this.hashList[key].revertChanges();
                }
            }
        //}
        this.mutatedChilds = {};

        for (var i=this.sinceSnapshotRemoved.length-1; i>=0; i--) {
            this.add(this.sinceSnapshotRemoved[i]);
            //this.sinceSnapshotRemoved[i].embedded(true);
        }
        this.sinceSnapshotRemoved = [];
        // TODO the above add operations should not change this.sinceSnapshotAdded!!!!

        for (var i=this.sinceSnapshotAdded.length-1; i>=0; i--) {
            this.delete(this.sinceSnapshotAdded[i]);
            //this.sinceSnapshotAdded[i].embedded(false);
        }
        this.sinceSnapshotAdded = [];
        this.sinceSnapshotRemoved = [];
        this.isMutated = false;
    };


    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.getAndResetStateChanges = function () {
        var oldStateChanges = this.mutatedChilds;
        //this.mutatedChilds = {};
        this.newSnapshot();
        return oldStateChanges;
    };


    proto.updateId = function (oldId, newId) {

        if (this.hashList.hasOwnProperty(oldId)) {
            var tmpObj = this.hashList[oldId];
            this.deleteById(oldId);
            var id;
            if (ko.isObservable(tmpObj._id)) {
                tmpObj._id(newId);
            }
            else {
                tmpObj._id = newId;
            }
            return this.add(tmpObj);
        }
        else {
            return false;
        }
    };

    proto.deleteById = function (id) {
        if (!this.lockObject.isLocked) {
            this.sinceSnapshotRemoved.push(this.hashList[id]);
        }


        if (typeof this.hashList[id].embedded === "function") {
            this.hashList[id].embedded(false);
        }

        delete this.hashList[id];
    };

    proto.delete = function (o) {

        if (!this.lockObject.isLocked) {
            this.sinceSnapshotRemoved.push(o);
        }

        if (ko.isObservable(o._id)) {
            delete this.hashList[o._id()];
        }
        else {
            delete this.hashList[o._id];
        }

        if (typeof o.embedded === "function") {
            o.embedded(false);
        }

    };

    proto.get = function (id) {
        return this.hashList[id];
    };

    proto.length = function () {
        // TODO: implement browser check or use underscore and _.size(object) or _.keys(object).length
        // for all old browsers:
        var count = 0;
        for (k in this.hashList) if (this.hashList.hasOwnProperty(k)) count++;
        return count;
        // faster version, but only working in Node, Chrome, IE 9+, FF 4+, or Safari 5+:
        //return Object.keys(this.hashList).length;
    };

    proto.toArray = function () {
        var newArray = []
        for (var key in this.hashList) {
            newArray.push(this.hashList[key]);
        }
        return newArray;
    };

    proto.each = function (func) {
        for (var k in this.hashList) {
            func(this.hashList[k]);
        }
    };

    proto.setPointers = function () {
        for (var k in this.hashList) {
            this.hashList[k].setPointers();
        }
    };

    proto.save = function () {
        var asArray = [];
        for (var k in this.hashList) {
            asArray.push(this.hashList[k].save());
        }
        return asArray;
    };

    proto.saveIds = function (idsObj) {
        var asArray = [];
        for (var k in idsObj) {
            asArray.push(this.hashList[k].save());
        }
        return asArray;
    };

    proto.load = function (o) {
        if (o instanceof Array) { // o is an Array of <ClassType> or an Array of JsonFormated <ClassType>
            for (var i = 0, length = o.length; i < length; i++) {
                if (this.factoryMethod) {
                    var objInstance = this.factoryMethod(this.gameData, o[i]);
                }
                else {
                    var objInstance = new this.ClassType(this.gameData, o[i]);
                }
                if (ko.isObservable(objInstance._id)) {
                    this.hashList[objInstance._id()] = objInstance;
                }
                else {
                    this.hashList[objInstance._id] = objInstance;
                }

            }
        }
        else { // o is a GameList but in jsonFormat
            if (o.hasOwnProperty('hashList')) {
                for (var propt in o.hashList) {
                    if (this.factoryMethod) {
                        this.hashList[propt] = this.factoryMethod(this.gameData, o.hashList[propt]);
                    }
                    else {
                        this.hashList[propt] = new this.ClassType(this.gameData, o.hashList[propt]);
                    }
                }
            }
            else {
                for (var propt in o) {
                    if (this.factoryMethod) {
                        this.hashList[propt] = this.factoryMethod(this.gameData, o[propt]);
                    }
                    else {
                        this.hashList[propt] = new this.ClassType(this.gameData, o[propt]);
                    }
                }
            }
        }
    };


    exports.GameList = GameList;

})(typeof exports === 'undefined' ? window : exports);

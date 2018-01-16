var node = !(typeof exports === 'undefined');
var ko;
if (node) {
    ko = require('../client/lib/knockout-3.3.0.debug.js');
}

/**
 * This is our custom extension to knockout, which logs all state changes
 * @param target this is the knockout observable
 * @param options = {parent: the parent entity in the hierarchy, key: how to identify this observable from the parent}
 * @returns {*}
 */
ko.extenders.logChange = function(target, options) {
    target.oldValue = null;
    target.mutatedChilds = [];
    target.notifyStateChange = function(childKey) {
        target.mutatedChilds[childKey] = true;
        options.parent.notifyStateChange(options.key);
    };
    target.newSnapshot = function() {
        // delete all the oldValue fields here and in all mutatedChilds recursively.
        if (target.mutatedChilds.length > 0) {
            for (var key in target.mutatedChilds) {
                if(target.mutatedChilds.hasOwnProperty(key)){
                    target[key].newSnapshot();
                }
            }
            target.oldValue = null;
        }
    };
    target.revertChanges = function() {
        // reset the states to oldValue here and in all mutatedChilds recursively.
        if (target.mutatedChilds.length > 0) {
            for (var key in target.mutatedChilds) {
                if(target.mutatedChilds.hasOwnProperty(key)){
                    target[key].revertChanges();
                }
            }
            target(target.oldValue);
            target.oldValue = null;
        }
    };
    target.subscribe(function(oldValue) {
        // only save if the old value is not yet set, because we want to keep the old value based on the last snapshot:
        if (target.oldValue == null) {
            target.oldValue = oldValue;
            //options.parent.mutatedChilds[options.key] = target;
            options.parent.notifyStateChange(options.key);
        }
    }, null, "beforeChange");
    return target;
};


(function (exports) {

    var registeredBlockClasses = {};


    function createBlockInstance(blockname, parent, type) {

        if (!registeredBlockClasses.hasOwnProperty(blockname)){
            console.error("Tried to create block " + blockname + " which is not registered as a valid buildingBlock.")
            return null;
        }

        var block = new registeredBlockClasses[blockname](parent,type);
        return block;

    };


    var AbstractBlock = function(parent, type) {

        this.parent = parent;
        this.type = type;
        this.embedded = ko.observable(false);
        this.blockname = null;
        this.mutatedChilds = {};

        this.setInitTypeVars();
        this.setInitStateVars();

    };

    var proto = AbstractBlock.prototype;


    /**
     * This function defines the default type variables and returns them as an object.
     */
    proto.defineTypeVars = function() {
        return {

        };
    };


    /**
     * This function defines the default state variables and returns them as an array of objects where each object contains the state-variable-name as key and the default as value.
     */
    proto.defineStateVars = function() {
        return [

        ];
    };

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

    /**
     * This function sets the type vars first with the hardcoded defaults and then overwrites them with the given this.type
     */
    proto.setInitTypeVars = function() {
        this._typeCache = this.defineTypeVars();

        var typeDef = this.type;
        if (typeDef instanceof Array) {
            var myLevel = this.parent.getLevel();
            if (typeDef.length < myLevel){
                typeDef = typeDef[typeDef.length-1];
            }
            else {
                typeDef = typeDef[myLevel-1];
            }
        }

        // overwrite
        for (var typeVarName in typeDef) {
            if (typeDef.hasOwnProperty(typeVarName))
                this._typeCache[typeVarName] = typeDef[typeVarName];
        }

        return this;
    };

    proto.resetState = function() {

        // TODO: use oldValue in all state variables to reset to the previous snapshot:



    };

    /**
     * This function sets the state vars first with the hardcoded defaults and then overwrites them with the given this.type
     */
    proto.setInitStateVars = function() {




        // recursive function to create deep observable objects / arrays:
        function makeObservable(data) {
            var vm;
            var dataType;
            if (data) {
                dataType = data.constructor;
                if (dataType === Array) {

                    // create an observable array with observable elements
                    vm = ko.observableArray();
                    for (var arr in data) {
                        if (data.hasOwnProperty(arr)) {
                            // make each element of array observable
                            var elm = makeObservable(data[arr]);
                            var newLen = vm.push(elm);
                            elm.extend({logChange: {parent: vm, key: newLen}});
                        }
                    }
                }
                else if (dataType === Object) {

                    // create an observable object and add all sub-elements as observable elements:
                    vm = ko.observable({});
                    for (var prop in data) {
                        if (data.hasOwnProperty(prop)) {

                            // recursive call to create observable sub-object:
                            vm()[prop] = makeObservable(data[prop]);
                            vm()[prop].extend({logChange: {parent: vm, key: prop}})

                        }
                    }
                }
                else {

                    // just create a normal observable:
                    vm = ko.observable(data);
                }
            }
            else {
                // data type unclear:
                vm = ko.observable(data);
            }
            return vm;
        }

        //var viewModel = makeObservable(data, {});
        var states = this.defineStateVars();
        for (var i=0; i<=states.length; i++) {
            for (var stateVarName in states[i]) {
                //this[stateVarName] = states[i][stateVarName];
                this[stateVarName] = makeObservable(states[i][stateVarName]);
                this[stateVarName].extend({logChange: {parent: this, key: stateVarName}})
            }
        }

        return this;

    };


    proto.finalizeBlockClass = function( blockname ) {

        // set type variable getters and setters:
        var typeVars = this.defineTypeVars();
        for (var typeVarName in typeVars) {
            if (typeVars.hasOwnProperty(typeVarName)) {
                var self = this;
                // define getter and setter methods for the type variables
                (function(typeVarName) {
                    Object.defineProperty(self, typeVarName, {
                        get: function () {
                            return this._typeCache[typeVarName];
                        },
                        set: function (val) {
                            console.error("it is not allowed to set type variables.");
                            //throw new Error("it is not allowed to set type variables.");
                        }
                    });
                })(typeVarName);
            }
        }

        this.blockname = blockname;

        Object.seal(this);

        registeredBlockClasses[blockname] = this.constructor;

        return this;
    };



    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.notifyStateChange = function(childKey){

        if (childKey) {
            this.mutatedChilds[childKey] = true;
        }

        // Now notify the parent:

        if (this.hasOwnProperty("_id")) {
            // if this is a game instance with an id. For example item or mapObject:
            this.parent.notifyStateChange(this._id());
        }
        else {
            // if this is a building block without id. For example UpgradeProdcution:
            this.parent.notifyStateChange(this.constructor.prototype.blockname);
        }

    };

    /**
     * TODO: reset the states to oldValue here and in all mutatedChilds recursively.
     */
    proto.revertChanges = function(){

        if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].revertChanges();
                    }
                    else {
                        // this key is a sub building block
                        this._blocks[key].revertChanges();
                    }
                }
            }
        }

    };


    /**
     * TODO: delete all the oldValue fields here and in all mutatedChilds recursively.
     */
    proto.newSnapshot = function(){

        if (this.mutatedChilds.length > 0) {
            for (var key in this.mutatedChilds) {
                if(this.mutatedChilds.hasOwnProperty(key)){
                    if (key in this) {
                        // this key is a ko.observable
                        this[key].newSnapshot();
                    }
                    else {
                        // this key is a sub building block
                        this._blocks[key].newSnapshot();
                    }
                }
            }
        }

    };


    /**
     * This function sets member variable pointers to other game instances and sets pointers at other instances to this instance.
     *
     */
    proto.setPointers = function(){
        // for example:
        // this.objType = this.mapObject.objectType;
        // this.parent.gameData.layers(...).mapData.objects.get('id8272389).pointer = this._id;
    };

    proto.removePointers = function(){

    };

    /**
     * this function automatically saves all state variables to a key-compressed format.
     * @returns {{a: Array}}
     */
    proto.save = function () {

        var o = {
            a: []
        };

        var states = this.defineStateVars();
        var ArrLen = states.length;

        for (var i=0; i < ArrLen; i++) {
            var stateVarNames = Object.keys(states[i]);
            if (stateVarNames.length > 1) {

                // save these variables directly with their corresponding name:
                for (var stateVarName in states[i]){
                    o[stateVarName] = ko.toJS(this[stateVarName]);
                }

            }
            else {

                // compress these keys:
                o.a[i] = ko.toJS(this[stateVarNames[0]]);

            }
        }

        return o;
    };

    proto.load = function (o) {

        // TODO: the state encoding could be somehow precached during class finalization...

        var states = this.defineStateVars();
        var ArrLen = states.length;

        if (o.hasOwnProperty("a")) {

            for (var i=0; i < ArrLen; i++) {
                var stateVarNames = Object.keys(states[i]);
                if (stateVarNames.length > 1) {
                    // load these variables directly with their corresponding name:
                    for (var stateVarName in states[i]){
                        this[stateVarName](o[stateVarName]);
                    }
                }
                else {
                    // uncompress these keys:
                    this[stateVarNames[0]](o.a[i]);
                }
            }



        }
        else {

            this.setInitStateVars();

            for (var key in o) {

                // TODO: check if the supplied arguments are really state variables...
                if (o.hasOwnProperty(key)) {
                    if ( this.hasOwnProperty(key) )
                        this[key](o[key]);
                }
            }
        }
    };

    exports.createBlockInstance = createBlockInstance;
    exports.AbstractBlock = AbstractBlock;

})(typeof exports === 'undefined' ? window : exports);


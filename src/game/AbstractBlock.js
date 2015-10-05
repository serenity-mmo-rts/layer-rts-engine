var node = !(typeof exports === 'undefined');
if (node) {
}


(function (exports) {

    var registeredBlockClasses = {};


    function createBlockInstance(blockname, parent, type) {

        var block = new registeredBlockClasses[blockname](parent,type);
        return block;

    };


    var AbstractBlock = function(parent, type) {

        this.parent = parent;
        this.type = type;

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
     * This function sets the type vars first with the hardcoded defaults and then overwrites them with the given this.type
     */
    proto.setInitTypeVars = function() {
        this._typeCache = this.defineTypeVars();

        // overwrite
        for (var typeVarName in this.type) {
            if (this.type.hasOwnProperty(typeVarName))
                this._typeCache[typeVarName] = this.type[typeVarName];
        }

        return this;
    };

    /**
     * This function sets the type vars first with the hardcoded defaults and then overwrites them with the given this.type
     */
    proto.setInitStateVars = function() {

        var states = this.defineStateVars();
        for (var i=0; i<=states.length; i++) {
            for (var stateVarName in states[i]) {
                this[stateVarName] = states[i][stateVarName];
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
                            throw new Error("it is not allowed to set type variables.");
                        }
                    });
                })(typeVarName);
            }
        }

        Object.seal(this);

        registeredBlockClasses[blockname] = this.constructor;

        return this;
    };



    /**
     * call this function if a state variable has changed to notify db sync later.
     */
    proto.notifyStateChange = function(){

        this.parent.game.changedObjects[this.parent._id] = true;

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
                    o[stateVarName] = this[stateVarName];
                }

            }
            else {

                // compress these keys:
                o.a[i] = this[stateVarNames[0]];

            }
        }

        return o;
    };

    proto.load = function (o) {

        var states = this.defineStateVars();
        var ArrLen = states.length;

        if (o.hasOwnProperty("a")) {


            for (var i=0; i < ArrLen; i++) {
                var stateVarNames = Object.keys(states[i]);
                if (stateVarNames.length > 1) {

                    // load these variables directly with their corresponding name:
                    for (var stateVarName in states[i]){
                        this[stateVarName] = o[stateVarName];
                    }

                }
                else {

                    // compress these keys:
                    this[stateVarNames[0]] = o.a[i];

                }
            }



        }
        else {
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    if ( states.hasOwnProperty() )
                    this[key] = o[key];
                }
            }
        }
    };

    exports.createBlockInstance = createBlockInstance;
    exports.AbstractBlock = AbstractBlock;

})(typeof exports === 'undefined' ? window : exports);


var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var State = require('../AbstractBlock').State;
    var MapObject = require('../MapObject').MapObject;

}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var SoilPuller = function (parent, type) {

        var self = this;

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // helper vars:
        this.reqObjects = [];

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    SoilPuller.prototype = Object.create(AbstractBlock.prototype);
    var proto = SoilPuller.prototype;
    proto.constructor = SoilPuller;


    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            ressourceTypeIds: [],
            ressourceMaxInPerHour: []
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {soilEffectiveIn: []}, // in amount per sec
            {soilAvailable: []}
        ];
    };


    proto.setPointers = function () {
        var self = this;

        this.parent.state.subscribe(function(newValue){
            console.log("parent.state changed: so recalculate soil effective in...");
            self.resetSoilProduction();
        });

        this.resetHelpers();

    };


    proto.resetHelpers = function () {

        this.resetResourceRequests();

    };

    proto.resetSoilProduction = function() {

        var self = this;
        var soilEffectiveIn;

        if (this.parent.state()==State.NORMAL) {
            // ok, start production:
            soilEffectiveIn = this.ressourceMaxInPerHour;
        }
        else {
            // halt production, because some other process is running:
            soilEffectiveIn = [];
            for (var i=0, len=this.ressourceTypeIds.length; i<len; i++) {
                soilEffectiveIn.push(0);
            }

        }

        // set state:
        this.soilEffectiveIn(soilEffectiveIn);

        this.resetResourceRequests();

    };

    proto.resetResourceRequests = function() {

        var soilEffectiveIn = this.soilEffectiveIn();

        // first remove all previous requests:
        for (var i=0, len=this.reqObjects.length; i<len; i++) {
            this.reqObjects[i].remove();
        }
        this.reqObjects = [];

        // now add again all requests:
        for (var i=0, len=soilEffectiveIn.length; i<len; i++) {
            var reqObject = this.parent.blocks.ResourceManager.reqChangePerHour(
                this.ressourceTypeIds[i],
                soilEffectiveIn[i],
                function(newEffective, resTypeId){
                    console.log("this soilPuller is producing "+resTypeId+" with a rate of "+newEffective);
                    // TODO: add side effects if not the full MaxInPerSec is used...
                }
            );
            this.reqObjects.push(reqObject);
        }

    };

    /**
     *
     * @param soilTypeId
     * @returns {number}
     */
    proto.getSoilDepletedIn = function(soilTypeId) {
        return this.soilAvailable()[0] / this.soilEffectiveIn()[0];
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    SoilPuller.prototype.finalizeBlockClass('SoilPuller');
    exports.SoilPuller = SoilPuller

})(typeof exports === 'undefined' ? window : exports);

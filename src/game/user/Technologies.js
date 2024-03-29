var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Technologies = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 22;

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Technologies.prototype = Object.create(AbstractBlock.prototype);
    var proto = Technologies.prototype;
    proto.constructor = Technologies;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
        // ~14.3 % average weight
    proto.defineTypeVars = function () {
        return {

        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {researchedTechnologies: []}
        ];
    };

    proto.addTechnology= function (techId) {
        if (! this.lookUpTechnology(techId)){
            this.researchedTechnologies.push(techId);
        }
    };

    proto.removeTechnology= function(techId){
        if (this.lookUpTechnology(techId)) {
            var pos = this.researchedTechnologies.indexOf(techId);
            this.researchedTechnologies.splice(pos, 1);
        }
    };

    proto.lookUpTechnology= function (techId) {
        var pos =  this.researchedTechnologies.indexOf(techId);
        if (pos == -1) {
            return false;
        }
        else{
            return true;
        }
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Technologies.prototype.finalizeBlockClass('Technologies');
    exports.Technologies = Technologies

})(typeof exports === 'undefined' ? window : exports);

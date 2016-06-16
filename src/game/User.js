
var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var User = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    User.prototype = Object.create(AbstractBlock.prototype);
    var proto = User.prototype;
    proto.constructor = User;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
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
            {researchedTechnologies: []},
            {_id: null},
            {name: null}
        ];
    };

    proto.addTechnology= function (techId) {
        var pos =  this._appliedItemIds.indexOf(techId);
        if (pos == -1) {
            this.researchedTechnologies.push(techId);
        }
    };

    proto.removeItemId= function(techId){
        var pos = this._appliedItemIds.indexOf(techId);
        if (this.lookUpTechnology(techId)) {
            this._appliedItemIds.splice(pos, 1);
        }
    };

    proto.lookUpTechnology= function (techId) {
        var pos =  this._appliedItemIds.indexOf(techId);
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
    User.prototype.finalizeBlockClass('User');
    exports.User = User

})(typeof exports === 'undefined' ? window : exports);

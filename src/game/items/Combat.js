var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {


    var Combat = function (parent, type){

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Combat.prototype = Object.create(AbstractBlock.prototype);
    var proto = Combat.prototype;
    proto.constructor = Combat;


    proto.defineTypeVars = function () {
        return {
            defenseAbility: 0,
            attackAbility: 0,
            maxArmor: 0,
            maxHealth: 0,
            attackSpeed: 0,
            attackRange: 0,
            movementSpeed: 0
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {armor: 0},
            {health: 0}
        ];
    };

    proto.setPointers  = function(){
        this.itemId = this.parent._id;
        this.layer= this.parent.gameData.layers.get(this.parent.mapId());
        this.mapObject = this.parent.mapObj;
    };

    proto.removePointers  = function(){

    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Combat.prototype.finalizeBlockClass('Combat');
    exports.Combat = Combat;

})(typeof exports === 'undefined' ? window : exports);

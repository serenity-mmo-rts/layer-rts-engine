var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {


    var Commander = function (parent, type){

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Commander.prototype = Object.create(AbstractBlock.prototype);
    var proto = Commander.prototype;
    proto.constructor = Commander;


    proto.defineTypeVars = function () {
        return {
            maxCommanderEnergy: 0,
            recoveryRate: 0

        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {commanderEnergy: 0}
        ];
    };

    proto.setPointers  = function(){
        this.itemId = this.parent.id;
        this.layer= this.parent.gameData.layers.get(this.parent.mapId());
        this.mapObject = this.parent.mapObj;
    };

    proto.removePointers  = function(){

    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Commander.prototype.finalizeBlockClass('Commander');
    exports.Commander = Commander;

})(typeof exports === 'undefined' ? window : exports);

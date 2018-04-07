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
    var UserObject = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 22;

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    UserObject.prototype = Object.create(AbstractBlock.prototype);
    var proto = UserObject.prototype;
    proto.constructor = UserObject;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            maxHealthPoints: 100,
            points: 0
        };
    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {userId: 0},
            {health: this.maxHealthPoints}
        ];
    };

    proto.getMaxHealthPoints = function() {
        return this.maxHealthPoints;
    };

    proto.getHealthPoints = function(){
        return this.health();
    };


    proto.getPoints = function(){
        return this.points;
    };


    proto.getLevel = function(){
        var level = 1;
        var points = this.points;
        if (points >= 0 && points <10){
            level= 1;
        }
        else if (points >= 10 && points <30){
            level= 2;
        }
        else if(points >= 30 && points <50){
            level= 3;
        }
        else if (points >= 50 && points <100){
            level= 4;
        }
        else if (points >= 100 && points <200){
            level= 5;
        }

        return level
    };

    proto.setHealthPointsToMax = function(){
        this.health(this.getMaxHealthPoints());
    };


    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    UserObject.prototype.finalizeBlockClass('UserObject');
    exports.UserObject = UserObject

})(typeof exports === 'undefined' ? window : exports);

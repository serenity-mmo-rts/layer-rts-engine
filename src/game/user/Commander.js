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
    var Commander = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // Define helper member variables:
        this.helperVar = 22;

    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Commander.prototype = Object.create(AbstractBlock.prototype);
    var proto = Commander.prototype;
    proto.constructor = Commander;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    // ~14.3 % average weight
    proto.defineTypeVars = function () {
        return {
            generalSkills: ["Strength","Intelligence","Agility","Leadership","Personage","Cogency","Strategic-Thinking"],
            combatSkills: ["defenseAbility","attackAbility","maxArmor","maxHealth","attackSpeed","attackRange","movementSpeed","CommanderFatigue","RecoveryRate","Armor","Health"],
            specialSkills: ["Scientific-Reputation","Market-Power","Construction-Expertise","Popularity"],
            careerTypes: ["Merchant", "Pilot", "Soldier", "Researcher", "Explorer", "Manager", "Politician"],
            careerSkillWeights:[[5,17.5,12.5,7.5,15,22.5,20],[5,17.5,12.5,7.5,15,22.5,20],[5,17.5,12.5,7.5,15,22.5,20],
                                [5,17.5,12.5,7.5,15,22.5,20],[5,17.5,12.5,7.5,15,22.5,20],[5,17.5,12.5,7.5,15,22.5,20],
                                [5,17.5,12.5,7.5,15,22.5,20]],
            expPointsToCommanderLevel:[0,10,20,30,40,50,65,80,100,120],
            levelToUpgradePoints:[20,4,4,4,4,4,4,4,3,3]
        };


    };

    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [
            {generalSkillValues: [0,0,0,0,0,0,0,0]},
            {combatSkillValues: [0,0,0,0,0,0,0,0,0,0,0]},
            {specialSkillValues: [0,0,0,50]},
            {experienccePoints:0},
            {level:0}
        ];
    };

    proto.getGeneralSkillValues = function (skillIds) {
        if (arguments.length>0){
            var out = [];
            for (var i=0;i<skillIds.length;i++){
                var pos = this.generalSkills.indexOf(skillIds[i]);
                if (pos != -1) {
                   out.push(this.generalSkillValues()[pos]);
                }
            }
            return out;
        }

        else{
            return this.generalSkillValues
        }

    };

    proto.getCombatSkillValues = function (skillIds) {
        if (arguments.length>0){
            var out = [];
            for (var i=0;i<skillIds.length;i++){
                var pos = this.combatSkills.indexOf(skillIds[i]);
                if (pos != -1) {
                    out.push(this.combatSkillValues()[pos]);
                }
            }
            return out;
        }
        else{
            return this.combatSkillValues()
        }
    };

    proto.getSpecialSkillValues = function (skillIds) {
        if (arguments.length>0){
            var out = [];
            for (var i=0;i<skillIds.length;i++){
                var pos = this.specialSkills.indexOf(skillIds[i]);
                if (pos != -1) {
                    out.push(this.specialSkillValues()[pos]);
                }
            }
            return out;
        }
        else{
            return this.specialSkillValues()
        }
    };
    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Commander.prototype.finalizeBlockClass('Commander');
    exports.Commander = Commander

})(typeof exports === 'undefined' ? window : exports);

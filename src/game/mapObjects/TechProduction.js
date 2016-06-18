var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var User = require('../User').User;
    var Commander = require('../user/Commander').Commander;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the _blocks field of a type class.
     * @constructor
     */
    var TechProduction = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    TechProduction.prototype = Object.create(AbstractBlock.prototype);
    var proto = TechProduction.prototype;
    proto.constructor = TechProduction;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return [
            {producableTechnologies: []}
        ]
    };


    /**
     * This function defines the default state variables and returns them as an array. The ordering in the array is used to serialize the states.
     * Within this function it is possible to read the type variables of the instance using this.typeVarName.
     * @returns {[{stateVarName: defaultValue},...]}
     */
    proto.defineStateVars = function () {
        return [

        ];
    };


    /** This function checks whether the requirements for the production of a certain technology are given or not.
     * It checks for required Technologies, required Items and required Skills.
     * @param techId
     * @returns {boolean}
     */
    proto.checkTechRequirements= function (techId) {
        var canTech = true;
        var alreadyExisting =  User.lookUpTechnology(techId);

        if (!alreadyExisting){

            // required Techs
            var requiredTechnologies = this.gameData.technologyTypes.get(techId)._requiredTechnologies;
            for (var i=0;i<requiredTechnologies.length; i++){
                var reqTechId = requiredTechnologies[i];
                var alreadyTeched = User.lookUpTechnology(reqTechId);
                if (alreadyTeched == false){
                    canTech = false;
                }
            }

            // required Items
            var requiredItemIds = this.gameData.technologyTypes.get(techId)._requiredItemIds;
            var requiredItemLevels = this.gameData.technologyTypes.get(techId)._requiredItemLevels;
            var availableItemIds = this.parent.getItems();
            var availableItemTypeIds = [];
            for (var i=0;i<availableItemIds.length; i++){
                var itemTypeId= this.map.mapData.items.get(availableItemIds[i]).itemTypeId;
                availableItemTypeIds.push(itemTypeId);
            }
            for (var i=0;i<requiredItemIds.length; i++){
                var reqItemId = requiredItemIds[i];
                var reqItemlvl = requiredItemLevels[i];

                var pos = availableItemTypeIds.indexOf(reqItemId);
                if (pos == -1) {
                    canTech = false;
                }
                else {

                    if (pos instanceof Array) {
                        for (var k =0; k<pos.length;k++){
                            var levelOfAvailableItem =  this.map.mapData.items.get(availableItemIds[pos[k]])._level;
                            if (levelOfAvailableItem<reqItemlvl){
                                canTech = false;
                            }
                        }
                    }
                    else{
                        var levelOfAvailableItem =  this.map.mapData.items.get(availableItemIds[pos])._level;
                        if (levelOfAvailableItem<reqItemlvl){
                            canTech = false;
                        }
                    }
                }
            }

            // required Skills
            var requiredSkillIds = this.gameData.technologyTypes.get(techId)._requiredSkillIds;
            var requiredSkillPoints = this.gameData.technologyTypes.get(techId)._requiredSkillPoints;
            var availableSkillPoints= Commander.getGeneralSkillValues(requiredSkillIds);
            for (var i=0;i<requiredSkillPoints.length; i++){
                if (availableSkillPoints[i]<requiredSkillPoints[i]){
                    canTech = false;
                }
            }

            return canTech
        }
        else {return false}

    };

    proto.setPointers= function (techId) {
        this.gameData = this.getGameData();
        this.map = this.getMap();
    };




    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    TechProduction.prototype.finalizeBlockClass('TechProduction');
    exports.TechProduction = TechProduction

})(typeof exports === 'undefined' ? window : exports);

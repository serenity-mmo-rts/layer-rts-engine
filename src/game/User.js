
var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('./AbstractBlock').AbstractBlock;
    var createBlockInstance = require('./AbstractBlock').createBlockInstance;
    var Skills = require('./user/Skills').Skills;
}

(function (exports) {
    /** Only the server on which the client is connected to needs access to the Layer properties. In other words this is the only server that can read and write.


    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var User = function (arg1, arg2) {

        var parent;
        var type;
        var initObj;
        if (arg1.constructor.name === "GameData") {
            // assume first argument is gameData and second argument is initObj:
            this.gameData = arg1;
            initObj = arg2;
            type = this.gameData.userTypes.get(initObj.userTypeId) || null;
            parent = this.gameData.users;
        }
        else {
            parent = arg1;
            type = arg2;
        }

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        if (type){
            this.userTypeId(type.id);
        }
        this.blocks = {};
        this.gameData = this.getGameData();

        this.userType = type;

        this.createBuildingBlocks();

        if (arg1.constructor.name === "GameData"){
            // assume first argument is gameData and second argument is initObj:
            this.load(initObj);
        }
    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    User.prototype = Object.create(AbstractBlock.prototype);
    var proto = User.prototype;
    proto.constructor = User;

    /**
     * create the sub building blocks
     */
    proto.createBuildingBlocks = function() {
        this.blocks = {};
        for (var blockName in this.userType.blocks) {
            this.blocks[blockName] = createBlockInstance(blockName,this,this.userType.blocks[blockName]);
        }
    };


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
            {
                id: null,
                userTypeId: null,
                loginId: null
            },
            {name: null}
        ];
    };



    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    User.prototype.finalizeBlockClass('User');
    exports.User = User

})(typeof exports === 'undefined' ? window : exports);

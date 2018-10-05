var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var State = require('../AbstractBlock').State;
    var Item = require('./../Item').Item;
}

(function (exports) {

    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var Unit = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);


        // Define helper member variables:
        this.helperVar = 22;
        this.mapId = this.parent.mapId;
        this.timeCallbackId = null;
        this.startedTime = null;
        this.dueTime = null;

        this.gameData = null;
        this.mapObjectId = null;
        this.mapId = null;
        this.layer= null;
        this.mapObject = null;


    };

    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    Unit.prototype = Object.create(AbstractBlock.prototype);
    var proto = Unit.prototype;
    proto.constructor = Unit;

    /**
     * This function defines the default type variables and returns them as an object.
     * @returns {{typeVarName: defaultValue, ...}}
     */
    proto.defineTypeVars = function () {
        return {
            itemTypeId: null,
            deployTime:0
        };
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

    proto.setPointers = function () {

    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    Unit.prototype.finalizeBlockClass('Unit');
    exports.Unit = Unit

})(typeof exports === 'undefined' ? window : exports);

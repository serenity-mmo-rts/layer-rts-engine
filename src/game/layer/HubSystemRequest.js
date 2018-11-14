var node = !(typeof exports === 'undefined');
if (node) {
    var AbstractBlock = require('../AbstractBlock').AbstractBlock;
}

(function (exports) {



    /*****************************
     * HubSystemRequest
     ****************************/


    /**
     * This is a constructor to create a new Hub.
     * @param parent the parent object/item/map of this building block
     * @param {{typeVarName: value, ...}} type the type definition of the instance to be created. Usually the corresponding entry in the blocks field of a type class.
     * @constructor
     */
    var HubSystemRequest = function (parent, type) {

        // Call the super constructor.
        AbstractBlock.call(this, parent, type);

        // helper variables:
        this.mapObj = null; // the mapObj that is requesting

    };


    /**
     * Inherit from AbstractBlock and add the correct constructor method to the prototype:
     */
    HubSystemRequest.prototype = Object.create(AbstractBlock.prototype);
    var proto = HubSystemRequest.prototype;
    proto.constructor = HubSystemRequest;

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
                _id: 0
            },
            { reqPullPerHour: 0},
            { reqPullPriority: 1},  // 0=very important (user adjusted), 1=standard (normal push/pull)
            { reqPullEffective: 0},
            { canPullPerHour: 0},
            { canPullPriority: 2},  // 2=possible but not required (storage objects), 3=possible but better not
            { canPullEffective: 0},
            { reqPushPerHour: 0},
            { reqPushPriority: 1},  // 0=very important (user adjusted), 1=standard (normal push/pull)
            { reqPushEffective: 0},
            { canPushPerHour: 0},
            { canPushPriority: 2},  // 2=possible but not required (storage objects), 3=possible but better not
            { canPushEffective: 0},
            { totalChangePerHour: 0} // positive=push, negative=pull
        ];
    };

    proto.setPointers = function() {
        this.mapObj = this.getMap().mapData.mapObjects.get(this._id())
    };

    proto.resetHelpers = function() {

    };

    proto.notifyIfTotalChanged = function() {
        var totalChangePerHour = this.reqPushEffective() + this.canPushEffective() - this.reqPullEffective() - this.canPullEffective();
        if (this.totalChangePerHour() != totalChangePerHour) {
            this.totalChangePerHour(totalChangePerHour);
            var resTypeId = this.parent.parent._id();
            this.mapObj.blocks.ResourceManager.resList.get(resTypeId).updateHubEffective(totalChangePerHour);
        }
    };

    /**
     * Finalize the class by adding the type properties and register it as a building block, so that the factory method can create blocks of this type.
     */
    HubSystemRequest.prototype.finalizeBlockClass('HubSystemRequest');
    exports.HubSystemRequest = HubSystemRequest

})(typeof exports === 'undefined' ? window : exports);

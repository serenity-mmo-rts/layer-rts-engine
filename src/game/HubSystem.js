
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var GameList = require('../GameList').GameList;
}



(function (exports) {

    var HubSystem = function (mapObj,initObj){


        // do not serialize:
        this.mapObjects = []; // stores all objects of the hub system

    };

    HubSystem.prototype= {
        /**
         * add a new mapObject to the hub system
         * @param objId
         */
        addToHubSystem: function(objId){
            this.mapObjects.push(objId);
        },

        /**
         * this function has to be called if one of the map objects in this hub system changes the desired input or output of the resource resId
         * @param resId
         */
        recalculateResource: function(resId){

            var totalDesiredPush = sum_over_producers(desiredPush);
            var numObjects = this.mapObjects.length;
            for (var i = 0; i < numObjects; i++) {
                this.mapObjects[i].ResourceProduction.
            }
            var totalDesiredPull = sum_over_consumers(desiredPull);

            if (totalDesiredPull > totalDesiredPush) {
                if (storageAmount > 0) {
                    StoragePushToHub = totalDesiredPull - totalDesiredPush;
                    totalPullEffectivity = 1;
                    totalPushEffectivity = 1;
                }
                else {
                    StoragePushToHub = 0;
                    totalPullEffectivity = totalDesiredPush / totalDesiredPull;
                    totalPushEffectivity = 1;
                }
            }
            else {
                if (freeStorageCapacity > 0) {
                    StoragePushToHub = totalDesiredPull - totalDesiredPush; //this is negative --> effective pull
                    totalPullEffectivity = 1;
                    totalPushEffectivity = 1;
                }
                else {
                    StoragePushToHub = 0;
                    totalPullEffectivity = 1;
                    totalPushEffectivity = totalDesiredPull / totalDesiredPush;
                }
            }

            for_each_consumer:
                effective_pull = desiredPull * totalPullEffectivity;
            for_each_producer:
                effective_push = desiredPush * totalPushEffectivity;

        }

    }

    exports.HubSystem = HubSystem;

})(typeof exports === 'undefined' ? window : exports);
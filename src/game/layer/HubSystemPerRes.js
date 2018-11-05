
var HubSystemPerRes = function (storageObject){

    // do not serialize:
    this.consumersReq = {}; // key = mapObjId, value = requested pull
    this.producersReq = {}; // key = mapObjId, value = requested push

    this.consumersEff = {}; // key = mapObjId, value = effective pulled
    this.producersEff = {}; // key = mapObjId, value = effective pushed

    this.storageObject = storageObject;
    this.storageAmount = 0; //TODO
    this.freeStorageCapacity = 100; // TODO
    this.effectiveStoragePushToHub = 0;

};

HubSystemPerRes.prototype= {
    /**
     * add a new mapObject to the hub system
     * @param objId
     */
    requestPull: function(objId, amount){
        this.consumersReq[objId] = amount;
        this.recalculateResource();
        return this.consumersEff[objId];
    },

    /**
     * add a new mapObject to the hub system
     * @param objId
     */
    requestPush: function(objId, amount){
        this.producersReq[objId] = amount;
        this.recalculateResource();
        return this.producersEff[objId];
    },

    /**
     * this function has to be called if one of the map objects in this hub system changes the desired input or output of the resource resId
     * @param resId
     */
    recalculateResource: function(){

        var totalDesiredPush = 0;
        for (var key in this.producersReq) {
            totalDesiredPush += this.producersReq[key];
        }

        var totalDesiredPull = 0;
        for (var key in this.consumersReq) {
            totalDesiredPull += this.consumersReq[key];
        }

        var totalPullEffectivity;
        var totalPushEffectivity;
        if (totalDesiredPull > totalDesiredPush) {
            if (this.storageAmount > 0) {
                this.effectiveStoragePushToHub = totalDesiredPull - totalDesiredPush;
                totalPullEffectivity = 1;
                totalPushEffectivity = 1;
            }
            else {
                this.effectiveStoragePushToHub = 0;
                totalPullEffectivity = totalDesiredPush / totalDesiredPull;
                totalPushEffectivity = 1;
            }
        }
        else {
            if (this.freeStorageCapacity > 0) {
                this.effectiveStoragePushToHub = totalDesiredPull - totalDesiredPush; //this is negative --> effective pull
                totalPullEffectivity = 1;
                totalPushEffectivity = 1;
            }
            else {
                this.effectiveStoragePushToHub = 0;
                totalPullEffectivity = 1;
                totalPushEffectivity = totalDesiredPull / totalDesiredPush;
            }
        }

        for (var key in this.producersReq) {
            this.producersEff[key] = this.producersReq[key] * totalPushEffectivity;
        }

        for (var key in this.consumersReq) {
            this.consumersEff[key] = this.consumersReq[key] * totalPullEffectivity;
        }

    }

};

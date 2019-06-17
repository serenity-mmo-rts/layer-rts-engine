var node = !(typeof exports === 'undefined');
if (node) {
}

(function (exports) {


    /*****************************
     * ResourceRequest
     ****************************/

    var ResourceRequest = function (resStorage, reqChangePerHour, onUpdatedEffective) {
        this.resStorage = resStorage;

        this.reqChangePerHour = reqChangePerHour;
        this.effChangePerHour = 0;
        this.onUpdatedEffective = onUpdatedEffective;

    };
    var proto = ResourceRequest.prototype;

    /**
     * Use this function to change an existing request
     * @param reqChangePerHour
     */
    proto.updateReqChangePerSec = function (reqChangePerHour) {
        this.reqChangePerHour = reqChangePerHour;
        this.resStorage._recalcRessourceInOut();
        return this.effChangePerHour;
    };

    /**
     * This function removes this request
     */
    proto.remove = function () {
        var requests = this.resStorage.requests;
        var idx = requests.indexOf(this);
        if (idx != -1) {
            requests.splice(idx, 1);
            this.resStorage._recalcRessourceInOut();
        }
    };

    exports.ResourceRequest = ResourceRequest

})(typeof exports === 'undefined' ? window : exports);

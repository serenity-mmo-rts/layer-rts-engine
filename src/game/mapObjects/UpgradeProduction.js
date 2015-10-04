
var node = !(typeof exports === 'undefined');
if (node) {
    var Class = require('../Class').Class;
    var GameData = require('../GameData').GameData;
    var MapObject = require('./../MapObject').MapObject;
    var eventStates = require('../events/AbstractEvent').eventStates;
    var BuildUpgradeEvent = require('../events/BuildUpgradeEvent').BuildUpgradeEvent;
    var LevelUpgradeEvent = require('../events/LevelUpgradeEvent').LevelUpgradeEvent;
    var Item = require('./../Item').Item;

}


(function (exports) {



    var UpgradeProduction = function (mapObj,initObj){

        this._freeSlotsAvailable =0;
        this._itemTypeId =null;
        // only ids serialized
        this.buildQueue = [];
        // not serialized
        this._mapObj = mapObj;
        this._mapId = mapObj.mapId;
        this.properties = {};
    };




    UpgradeProduction.prototype= {

        updateStateVars: function(){

        },

        levelUpgrade: function(item){

            var evt = new LevelUpgradeEvent(game);
            evt.setItem(item);
            uc.addEvent(evt);

        },


        startUpgrade: function(itemId){
            var tempId = "tempID"+Math.random();
            var item = new Item(game,{_id: tempId,_objectId:this._mapObj._id,_itemTypeId:itemId,_mapId:this._mapId});
            var evt = new BuildUpgradeEvent(game);
            evt.setItem(item);
            uc.addEvent(evt);
        },

        setPointers : function(){
            var buildQueueIds = this.buildQueue;
            this.buildQueue = [];
            for (var i=0; i<buildQueueIds.length ; i++) {
                this.buildQueue.push(this.gameData.layers.get(this.mapId).eventScheduler.events.get(buildQueueIds[i]));
            }
        },
        

        addItemEventToQueue: function(evt){
            this.buildQueue.push(evt);
        },

        removeItemFromQueue: function(idx){
            this.buildQueue.splice(idx,1);
        },



        checkQueue: function(currentTime) {
            if (this.buildQueue.length>0){
                if(this.buildQueue[0]._state == eventStates.VALID) {
                    this.buildQueue[0].start(currentTime);
                }
            }

        },


        save: function () {

            var buildQueueIds = [];
            for (var i=0; i<this.buildQueue.length ; i++) {
                buildQueueIds.push(this.buildQueue[i]._id);
            }

            var o= {
                a: [this.userId,
                    this.healthPoints,
                    buildQueueIds
                ]};
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a"))
            {
                this.userId = o.a2[0];
                this.healthPoints= o.a2[1];
                this.buildQueue = o.a2[2];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    };

    exports.UpgradeProduction = UpgradeProduction;

})(typeof exports === 'undefined' ? window : exports);


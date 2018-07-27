var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
}

(function (exports) {

    var ResearchEvent = AbstractEvent.extend({

        type: "ResearchEvent",

        //serialized:
        techTypeId: null,
        parentObjectId: null,

        //not serialized
        parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {
            return true
            //return  this.parentObject.blocks.TechProduction.checkTechRequirements(this.techTypeId);
        },

        setParameters: function (techTypeId,parentObject) {
            this.techTypeId = techTypeId;
            this.parentObjectId = parentObject._id();
            this.parentObject = parentObject;
        },

        setPointers: function() {
            this._super( );
            this.parentObject = this.gameData.layers.get(this.mapId).mapData.mapObjects.get(this.parentObjectId);
        },

        executeOnClient: function () {
            this.execute();
        },

        executeOnServer: function () {
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            this.parentObject.blocks.UpgradeProduction.addEventToQueue(this);
        },

        updateFromServer: function (event) {
            this.super(event);
            this.parentObject.blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {
            return true;
        },



        save: function () {
            var o = this._super();
            o.a2 = [this.techTypeId,
                this.parentObjectId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.techTypeId = o.a2[0];
                this.parentObjectId = o.a2[1];
            }
            else {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        this[key] = o[key];
                    }
                }
            }
        }

    });

    exports.ResearchEvent = ResearchEvent;

})(node ? exports : window);

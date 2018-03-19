var node = !(typeof exports === 'undefined');
if (node) {
    var GameData = require('../GameData').GameData;
    var MapObject = require('../MapObject').MapObject;
    var AbstractEvent = require('./AbstractEvent').AbstractEvent;
}

(function (exports) {

    var ResearchEvent = AbstractEvent.extend({

        _type: "ResearchEvent",

        //serialized:
        techTypeId: null,
        _parentObjectId: null,

        //not serialized
        _parentObject: null,

        init: function(gameData, initObj){
            this._super( gameData, initObj );
        },

        isValid: function () {
            return true
            //return  this._parentObject._blocks.TechProduction.checkTechRequirements(this.techTypeId);
        },

        setParameters: function (techTypeId,parentObject) {
            this.techTypeId = techTypeId;
            this._parentObjectId = parentObject._id();
            this._parentObject = parentObject;
        },

        setPointers: function() {
            this._super( );
            this._parentObject = this._gameData.layers.get(this._mapId).mapData.mapObjects.get(this._parentObjectId);
        },

        executeOnClient: function () {
            this.start(Date.now() + ntp.offset());
            this.execute();
        },

        executeOnServer: function () {
            this.start(Date.now());
            this.execute();
        },

        executeOnOthers: function() {
            this.execute();
        },

        execute: function () {
            this._parentObject._blocks.UpgradeProduction.startProduction(this);
        },

        updateFromServer: function (event) {
            this._super(event);
            this._parentObject._blocks.UpgradeProduction.updateDueTime(event);
        },

        revert: function() {
            return true;
        },



        save: function () {
            var o = this._super();
            o.a2 = [this.techTypeId,
                this._parentObjectId
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.techTypeId = o.a2[0];
                this._parentObjectId = o.a2[1];
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

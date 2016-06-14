var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var TechnologyType = AbstractType.extend({
        // serialized:
        _type: "TechnologyType",
        // requirements
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,

        _requiredItemIds: null,
        _requiredItemLevels: null,
        _requiredTechnologies: null,
        _requiredSkillPoints: null,

        _requiredResourceIds: null,
        _requiredResourceAmounts: null,
        _techPoints: null,

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._allowOnMapTypeId,
                    this._allowOnObjTypeId,
                    this._requiredItemIds,
                    this._requiredItemLevels,
                    this._requiredTechnologies,
                    this._requiredSkillPoints,
                    this._requiredResourceIds,
                    this._requiredResourceAmounts,
                    this._techPoints];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this._allowOnMapTypeId = o.a2[0];
                    this._allowOnObjTypeId = o.a2[1];

                    this._requiredItemIds = o.a2[2];
                    this._requiredItemLevels = o.a2[3];
                    this._requiredTechnologies = o.a2[4];
                    this._requiredSkillPoints = o.a2[5];

                    this._requiredResourceIds = o.a2[6];
                    this._requiredResourceAmounts = o.a2[7];
                    this._techPoints = o.a2[8];
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

    exports.TechnologyType = TechnologyType;

})(typeof exports === 'undefined' ? window : exports);


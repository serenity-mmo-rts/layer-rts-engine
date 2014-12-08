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
        _requiredMapObjLvl: null,
        _requiredTechnologies: null,
        _requiredRessources: null,
        _requiredResearchPoints: null,
        // bonuses
        _features: [],

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._allowOnMapTypeId,
                    this._allowOnObjTypeId,
                    this._requiredMapObjLvl,
                    this._requiredTechnologies,
                    this._requiredRessources,
                    this._requiredResearchPoints,
                    this._features];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this._allowOnMapTypeId = o.a2[0];
                    this._allowOnObjTypeId = o.a2[1];
                    this._requiredMapObjLvl = o.a2[2];
                    this._requiredTechnologies = o.a2[3];
                    this._requiredRessources = o.a2[4];
                    this._requiredResearchPoints = o.a2[5];
                    this._features = o.a2[6];
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


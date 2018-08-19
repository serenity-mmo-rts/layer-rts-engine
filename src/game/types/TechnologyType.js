var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var TechnologyType = AbstractType.extend({
        // serialized:
        type: "TechnologyType",
        // requirements
        requiredTechnologies: null,
        requiredItemIds: null,
        requiredItemLevels: null,
        requiredSkillIds: null,
        requiredSkillPoints: null,

        requiredResourceIds: null,
        requiredResourceAmounts: null,
        techPoints: null,

        init: function(arg1, initObj){

            this._super( arg1, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [
                    this.requiredTechnologies,
                    this.requiredItemIds,
                    this.requiredItemLevels,
                    this.requiredSkillIds,
                    this.requiredSkillPoints,
                    this.requiredResourceIds,
                    this.requiredResourceAmounts,
                    this.techPoints];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this.requiredTechnologies = o.a2[0];
                    this.requiredItemIds = o.a2[1];
                    this.requiredItemLevels = o.a2[2];
                    this.requiredSkillIds = o.a2[3];
                    this.requiredSkillPoints = o.a2[4];
                    this.requiredResourceIds = o.a2[5];
                    this.requiredResourceAmounts = o.a2[6];
                    this.techPoints = o.a2[9];
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


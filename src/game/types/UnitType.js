var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var UnitType = AbstractType.extend( {
        // serialized:
        _type: "UnitType",
        // requirements
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _requiredUpgrades: null,
        _requiredTechnologies: null,
        _requiredRessources: null,
        // unit specific
        _healthPoints: null,
        _armor: null,
        _attackPoints: [],
        _defensePoints: [],
        _attackSpeed: [],
        _runningSpeed: null,
        _range: null,
        // parent features
        _features: [],

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },


        save: function () {
            var o = this._super();
            o.a2 = [this.allowOnMapTypeId,
                    this.allowOnObjTypeId,
                    this.requiredUpgrades,
                    this.requiredTechnologies,
                    this.requiredRessources,
                    this.healthPoints,
                    this.armor,
                    this.attackPoints,
                    this.defensePoints,
                    this.attackSpeed,
                    this.runningSpeed,
                    this.range,
                    this.features
                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this.allowOnMapTypeId = o.a[0];
                this.allowOnObjTypeId = o.a[1];
                this.requiredUpgrades = o.a[2];
                this.requiredTechnologies = o.a[3];
                this.requiredRessources = o.a[4];
                this.healthPoints = o.a[5];
                this.armor = o.a[6];
                this.attackPoints = o.a[7];
                this.defensePoints = o.a[8];
                this.attackSpeed = o.a[9];
                this.runningSpeed = o.a[10];
                this.range = o.a[11];
                this.features = o.a[12];

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


    exports.UnitType = UnitType;

})(typeof exports === 'undefined' ? window : exports);

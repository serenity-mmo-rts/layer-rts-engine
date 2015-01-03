var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({

        // static does not change with level
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _runningSpeed: null,
        _range: null,
        // changed by level
        // requirements
        _requiredItemIds: [],
        _requiredTechnologies: [],
        _requiredRessources: [],
        _requiredMapObjLvls: [],
        // unit specific
        _maxHealthPoints: [],
        _maxArmor:[],
        _attackPoints: [],
        _defensePoints: [],
        _attackSpeed: [],
        //others
        _points: [],
        // for Object
        _objectFeatures: [],


        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [this._allowOnMapTypeId,
                this._allowOnObjTypeId,
                this._runningSpeed,
                this._range,
                this._requiredItemIds,
                this._requiredTechnologies,
                this._requiredRessources,
                this._requiredMapObjLvls,
                this._maxHealthPoints,
                this._maxArmor,
                this._attackPoints,
                this._defensePoints,
                this._attackSpeed,
                this._points,
                this._objectFeatures
            ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                this._allowOnMapTypeId = o.a2[0];
                this._allowOnObjTypeId = o.a2[1];
                this._runningSpeed = o.a2[2];
                this._range = o.a2[3];
                this._requiredItemIds = o.a2[4];
                this._requiredTechnologies = o.a2[5];
                this._requiredRessources = o.a2[6];
                this._requiredMapObjLvls = o.a2[7];
                this._maxHealthPoints = o.a2[8];
                this._maxArmor = o.a2[8];
                this._attackPoints = o.a2[10];
                this._defensePoints = o.a2[11];
                this._attackSpeed = o.a2[12];
                this._points = o.a2[13];
                this._objectFeatures = o.a2[14];

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

    exports.ItemType= ItemType;

})(typeof exports === 'undefined' ? window : exports);

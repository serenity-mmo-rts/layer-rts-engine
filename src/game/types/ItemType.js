var node = !(typeof exports === 'undefined');

if (node) {
    var AbstractType= require('./AbstractType').AbstractType;
}

(function (exports) {

    var ItemType = AbstractType.extend({


        _className: null,
        _allowOnMapTypeId: null,
        _allowOnObjTypeId: null,
        _requiredItemIds: [],
        _requiredTechnologies: [],
        _requiredRessources: [],
        _requiredMapObjLvls: [],
        _points: [],
        _actionRadius: [],
        _objectSelectionRadius: [],
        _activationTime: [],
        _canMove: null,
        _canFight: null,
        _canSelectObject: null,
        _canSelectItem: null,
        _canBeActivated: null,
        _unitFeatures: {},
        _objectFeatures: [],
        _itemFeatures: [],

        init: function(gameData, initObj){

            this._super( gameData, initObj );

        },

        save: function () {
            var o = this._super();
            o.a2 = [
                    this._className,
                    this._allowOnMapTypeId,
                    this._allowOnObjTypeId,
                    this._requiredItemIds,
                    this._requiredTechnologies,
                    this._requiredRessources,
                    this._requiredMapObjLvls,
                    this._points,
                    this._actionRadius,
                    this._objectSelectionRadius,
                    this._activationTime,
                    this._canMove,
                    this._canFight,
                    this._canSelectObject,
                    this._canSelectItem,
                    this._canBeActivated,
                    this._unitFeatures,
                    this._objectFeatures,
                    this._itemFeatures
                    ];
            return o;
        },

        load: function (o) {
            this._super(o);
            if (o.hasOwnProperty("a2")) {
                    this._className,
                    this._allowOnMapTypeId = o.a2[0],
                    this._allowOnObjTypeId = o.a2[1],
                    this._requiredItemIds = o.a2[2],
                    this._requiredTechnologies = o.a2[3],
                    this._requiredRessources = o.a2[4],
                    this._requiredMapObjLvls = o.a2[5],
                    this._points = o.a2[6],
                    this._actionRadius = o.a2[7],
                    this._objectSelectionRadius = o.a2[8],
                    this._activationTime = o.a2[9],
                    this._canMove = o.a2[10],
                    this._canFight = o.a2[11],
                    this._canSelectObject = o.a2[12],
                    this._canSelectItem = o.a2[13],
                    this._canBeActivated = o.a2[14],
                    this._unitFeatures = o.a2[15],
                    this._objectFeatures = o.a2[16],
                    this._itemFeatures = o.a2[17]

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

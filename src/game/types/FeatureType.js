var node = !(typeof exports === 'undefined');

if (node) {
    var Class = require('../Class').Class;
}

(function (exports) {

    var FeatureType = Class.extend({

        // general
        _id: 0,
        _name : null,
        _appliedOn: null,
        _infinite:  null,
        _canBeActivated:  null,
        _canBeDepleted:  null,
        _canSelect:  null,
        _canRecharge:  null,
        _numberOfTargets:  null,
        _range:  null,
        _objectSelectionRadius:  null,
        _activationTime:  null,
        _effects: null,



        init: function(gameData, initObj) {
            this._gameData = gameData;
            // deserialize event from json object
            this.load(initObj);
        },


        save: function () {
            var o = {_id: this._id,
                a: [this._name,
                    this._appliedOn,
                    this._infinite,
                    this._canBeActivated,
                    this._canBeDepleted,
                    this._canSelect,
                    this._canRecharge,
                    this._numberOfTargets,
                    this._range,
                    this._objectSelectionRadius,
                    this._activationTime,
                    this._effects
                ]

            };
            return o;
        },

        load: function (o) {
            if (o.hasOwnProperty("a")) {
                this._id = o._id;
                this._name = o.a[0];
                this._infinite = o.a[1];
                this._canBeActivated = o.a[2];
                this._canBeDepleted = o.a[3];
                this._canSelect = o.a[4];
                this._canRecharge = o.a[5];
                this._numberOfTargets = o.a[6];
                this._range = o.a[7];
                this._objectSelectionRadius = o.a[8];
                this._activationTime = o.a[9];
                this._effects = o.a[10];


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


    exports.FeatureType = FeatureType;

})(node ? exports : window);


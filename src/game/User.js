(function (exports) {

    var User = function(gameData,initObj) {
        // serialized:
        this._id = 0;
        this.name = null;

        // not serialized:
        this.gameData = gameData;

        // init:
        if (User.arguments.length == 2) {
            this.load(initObj);
        }
    }

    User.prototype = {


        save: function () {
            var o = {_id: this._id,
                a: [this.name]};
            return o;
        },

        load: function (o) {
            this._id = o._id;
            this.name = o.a[0];
        }
    }

    exports.User = User;

})(typeof exports === 'undefined' ? window : exports);

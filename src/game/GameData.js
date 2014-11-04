
var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var MapType = require('./MapType').MapType;
    var ObjectType = require('./objectType').ObjectType;
    var Spritesheet = require('./Spritesheet').Spritesheet;
    var MapData = require('./MapData').MapData;
    var User = require('./User').User;
}

(function (exports) {
    function GameData(initObj) {
        this.mapTypes = new GameList(this,MapType);
        this.objectTypes = new GameList(this,ObjectType);
        this.spritesheets = new GameList(this,Spritesheet);
        this.maps = new GameList(this,MapData);
        this.users = new GameList(this,User);
        if (GameData.arguments.length == 1) {
            this.load(initObj);
        }
    }

    GameData.prototype = {
        save: function () {
            var a = [
                this.mapTypes.save(),
                this.objectTypes.save(),
                this.spritesheets.save(),
                this.maps.save(),
                this.users.save()
            ];
            return a;
        },

        load: function (a) {
            this.mapTypes.load(a[0]);
            this.objectTypes.load(a[1]);
            this.spritesheets.load(a[2]);
            this.maps.load(a[3]);
            this.users.load(a[4]);
        }
    }

    exports.GameData = GameData;

})(node ? exports : window);


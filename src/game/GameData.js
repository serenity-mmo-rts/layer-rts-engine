
var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var MapType = require('./MapType').MapType;

    var ObjectType = require('./types/ObjectType').ObjectType;
    var RessourceType = require('./types/RessourceType').RessourceType;
    var TechnologyType = require('./types/TechnologyType').TechnologyType;
    var ItemType = require('./types/ItemType').ItemType;
    var UnitType = require('./types/UnitType').UnitType;
    var UpgradeType = require('./types/UpgradeType').UpgradeType;

    var Spritesheet = require('./Spritesheet').Spritesheet;
    var MapData = require('./MapData').MapData;
    var User = require('./User').User;
}


(function (exports) {
    function GameData(initObj) {
        this.mapTypes = new GameList(this,MapType);

        this.objectTypes = new GameList(this,ObjectType);
        this.ressourceTypes = new GameList(this,RessourceType);
        this.technologyTypes = new GameList(this,TechnologyType);
        this.itemTypes = new GameList(this,ItemType);
        this.unitTypes = new GameList(this,UnitType);
        this.upgradeTypes = new GameList(this,UpgradeType);

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
                this.ressourceTypes.save(),
                this.technologyTypes.save(),
                this.itemTypes.save(),
                this.unitTypes.save(),
                this.upgradeTypes.save(),
                this.spritesheets.save(),
                this.maps.save(),
                this.users.save()
            ];
            return a;
        },

        load: function (a) {
            this.mapTypes.load(a[0]);
            this.objectTypes.load(a[1]);
            this.ressourceTypes.load(a[2]);
            this.technologyTypes.load(a[3]);
            this.itemTypes.load(a[4]);
            this.unitTypes.load(a[5]);
            this.upgradeTypes.load(a[6]);
            this.spritesheets.load(a[7]);
            this.maps.load(a[8]);
            this.users.load(a[9]);
        }
    }

    exports.GameData = GameData;

})(node ? exports : window);


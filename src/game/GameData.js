
var node = !(typeof exports === 'undefined');
if (node) {
    var GameList = require('./GameList').GameList;
    var LayerType = require('./types/LayerType').LayerType;

    var ObjectType = require('./types/ObjectType').ObjectType;
    var RessourceType = require('./types/ResourceType').RessourceType;
    var TechnologyType = require('./types/TechnologyType').TechnologyType;
    var ItemType = require('./types/ItemType').ItemType;
    var UserType = require('./types/UserType').UserType;
    //var FeatureType = require('./types/FeatureType').FeatureType;

    var Spritesheet = require('./Spritesheet').Spritesheet;
    var Layer = require('./Layer').Layer;
    var User = require('./User').User;
}


(function (exports) {
    var GameData = function GameData(initObj) {
        this.layerTypes = new GameList(this,LayerType,false,false,this);

        this.objectTypes = new GameList(this,ObjectType,false,false,this);
        this.ressourceTypes = new GameList(this,RessourceType,false,false,this);
        this.technologyTypes = new GameList(this,TechnologyType,false,false,this);
        this.itemTypes = new GameList(this,ItemType,false,false,this);
        this.userTypes = new GameList(this,UserType,false,false,this);

        //this.featureTypes = new GameList(this,FeatureType,false,false,this);
        this.users = new GameList(this,User,false,false,this);

        this.spritesheets = new GameList(this,Spritesheet,false,false,this);
        this.layers = new GameList(this,Layer,false,false,this);

        if (GameData.arguments.length == 1) {
            this.load(initObj);
        }
    }

    GameData.prototype.save = function () {
            var a = [
                this.layerTypes.save(),
                this.objectTypes.save(),
                this.ressourceTypes.save(),
                this.technologyTypes.save(),
                this.itemTypes.save(),
                this.userTypes.save(),
                this.users.save(),
             //   this.featureTypes.save(),
                this.spritesheets.save(),
                this.layers.save()

            ];
            return a;
        };

    GameData.prototype.load = function (a) {
            this.layerTypes.load(a[0]);
            this.objectTypes.load(a[1]);
            this.ressourceTypes.load(a[2]);
            this.technologyTypes.load(a[3]);
            this.itemTypes.load(a[4]);
            this.userTypes.load(a[5]);
            this.users.load(a[6]);
          //  this.featureTypes.load(a[5]);
            this.spritesheets.load(a[7]);
            this.layers.load(a[8]);

        };


    exports.GameData = GameData;

})(node ? exports : window);


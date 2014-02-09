var GameData = function() {
    this.mapTypes = new GameList(MapType.prototype);
    this.objectTypes = new GameList(ObjectType.prototype);
    this.spritesheets = new GameList(Spritesheet.prototype);
    this.maps = new GameList(MapData.prototype);
    this.users = new GameList(User.prototype);
}

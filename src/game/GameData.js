var GameData = function() {
    this.mapTypes = new GameList(MapType);
    this.objectTypes = new GameList(ObjectType);
    this.spritesheets = new GameList(Spritesheet);
    this.maps = new GameList(MapData);
    this.users = new GameList(User);
}

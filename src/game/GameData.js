var GameData = function(json) {
    this.mapTypes = {};
    this.objectTypes = {}; //use objTypeId as key for fast access
    this.spritesheets = {};
    this.maps =  {}; //use mapId as key for fast access;
    this.users = {};

    for(var key in json) {
        if(json.hasOwnProperty(key)) {
            this[key] = json[key];
        }
    }
}
var BuildObjectEvent = function BuildObjectEvent(map){

    this.map = map;
    this.object = this.map.tempObj;
    this.objTypeId = this.object.objTypeId;
    this.userId = this.object.userId;
    this.x = this.object.x;
    this.y = this.object.y;

}

//BuildObjectEvent.prototype = Object.create(AbstractEvent.prototype);
//BuildObjectEvent.prototype.constructor = BuildObjectEvent;

BuildObjectEvent.prototype.initialize = function(){
    this.map.addObjToGame(this);
    this.map.renderObj(this);
}

BuildObjectEvent.prototype.inProcess = function(){


}

BuildObjectEvent.prototype.finished = function(){


}


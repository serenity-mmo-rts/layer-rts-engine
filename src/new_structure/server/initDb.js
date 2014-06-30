var fs = require('fs');

window = {};
eval(fs.readFileSync('../client/lib/QuadTree.js') + '');

initGameData = require('./initGameData');

var mongoClient = require('mongodb').MongoClient;
mongoClient.connect('mongodb://localhost:27017/serenity', {db: {native_parser: true}}, function(err, db) {
    if(!err) {
        console.log("We are connected");
    }

    if (err) throw err;

    var collSpritesheets = db.collection('spritesheets');
    var collMapTypes = db.collection('mapTypes');
    var collObjectType = db.collection('objTypes');
    var collMaps = db.collection('maps');
    var collMapObjects = db.collection('mapObjects');
    var collGameVars = db.collection('gameVars');
    var collUsers = db.collection('users');
    var collSessions = db.collection('sessions');

    // remove all collections:
    collSpritesheets.remove({},function(err, removed){
        collMapTypes.remove({},function(err, removed){
            collObjectType.remove({},function(err, removed){
                collMaps.remove({},function(err, removed){
                    collMapObjects.remove({},function(err, removed){
                        collGameVars.remove({},function(err, removed){
                            collUsers.remove({},function(err, removed){
                                collSessions.remove({},function(err, removed){
                                    addSpritesheets();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    function addSpritesheets() {
        console.log("add sprites")
        var saveData = initGameData.gameData.spritesheets.save();
        collSpritesheets.insert(saveData, function(err,docs) {
            if (err) throw err;
            addMapTypes();
        });
    }



    function addMapTypes() {
        console.log("add map types")
        collMapTypes.insert(initGameData.gameData.mapTypes.save(), function(err,docs) {
            if (err) throw err;
            addObjectTypes();
        });
    }

    function addObjectTypes() {
        console.log("add object types")
        collObjectType.insert(initGameData.gameData.objectTypes.save(), function(err,docs) {
            if (err) throw err;
            addMaps();
        });
    }

    function addMaps() {
        console.log("add maps")
        collMaps.insert(initGameData.gameData.maps.save(), function(err,docs) {
            if (err) throw err;
            addMapObjects();
        });
    }

    function addMapObjects() {
        console.log("add map objects")
        initGameData.gameData.maps.each(function(map) {
            collMapObjects.insert(map.mapObjects.save(), function(err,docs) {
                if (err) throw err;
            });
        });
        addGameVariables();
    }

    function addGameVariables() {
        console.log("add game variables")
        collGameVars.insert(initGameData.gameVars, function(err,docs) {
            if (err) throw err;
            console.log("database is now ready!");
            db.close();
        });
    }
});

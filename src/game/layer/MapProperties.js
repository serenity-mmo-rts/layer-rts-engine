var node = !(typeof exports === 'undefined');
if (node) {


}

(function (exports) {


    var MapProperties= function (seed, mapWidth, mapHeight) {
        this.seed = seed;

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.sources = [];

        this.resTypes = [
            {_id: 0, name: 'Ice-Water', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.07, num: 800},
            {_id: 1, name: 'Carbon', minV: 0.2, maxV: 0.3, minR: 0.1, maxR: 0.2, num: 60},
            {_id: 2, name: 'Iron', minV: 0.05, maxV: 0.3, minR: 0.02, maxR: 0.2, num: 50},
            {_id: 3, name: 'Silicon', minV: 0.2, maxV: 0.7, minR: 0.02, maxR: 0.15, num: 600},
            {_id: 4, name: 'Phosphor', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.2, num: 70},
            {_id: 5, name: 'Nitrogen', minV: 0.2, maxV: 0.5, minR: 0.1, maxR: 0.15, num: 60},
            {_id: 6, name: 'Aluminium', minV: 0.2, maxV: 0.2, minR: 0.02, maxR: 0.1, num: 200},
            {_id: 7, name: 'Lead', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.1, num: 200},
            {_id: 8, name: 'Titanium', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.1, num: 200},
            {_id: 9, name: 'Uranium', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.1, num: 30},
            {_id: 10, name: 'Lithium', minV: 0.2, maxV: 0.5, minR: 0.02, maxR: 0.1, num: 100},
            {_id: 11, name: 'Feldspar', minV: 0.1, maxV: 1, minR: 0.02, maxR: 0.05, num: 300},
            {_id: 12, name: 'Olivine', minV: 0.1, maxV: 1, minR: 0.02, maxR: 0.03, num: 20},
            {_id: 13, name: 'Pyroxene', minV: 0.1, maxV: 1, minR: 0.02, maxR: 0.01, num: 50},
            {_id: 14, name: 'Height', minV: 0.03, maxV: 0.3, minR: 0.01, maxR: 0.06, num: 900}
        ];



        //this.planetMap = new PlanetGenerator(2,200,15,50,20);  // height seed, roughness (in percent from seed), size (2^x edge length with zoom level 1), water Level (in percent min-max height), average temperature

        this.genRes();
    };

    MapProperties.prototype.genRes = function () {

      //  Math.seedrandom(this.seed);

        var rScaling = Math.min(this.mapWidth, this.mapHeight);


        for(var typeId in this.resTypes) {
            var num = this.resTypes[typeId].num;
            var minR = rScaling * this.resTypes[typeId].minR;
            var maxR = rScaling * this.resTypes[typeId].maxR;
            var minV = this.resTypes[typeId].minV;
            var maxV = this.resTypes[typeId].maxV;
            var type = this.resTypes[typeId]._id;

            for (var i = 0; i < num; i++) {
                var r = minR + (maxR - minR) * Math.random();
                var r1 = r * (Math.random()/2); // r1 is the radius of the inner plateau and must be smaller than the outer radius r
                var s = 0.5+Math.random()/2; // s defines the smoothness and should be between 0 and 1
                var x = (this.mapWidth-r) * (Math.random() - 0.5);
                var y = (this.mapHeight-r) * (Math.random() - 0.5);
                var v = minV + (maxV - minV) * Math.random();
                this.sources.push({x:x, y:y, r:r, r1:r1, s:s, v:v, type:type})
            }

        }
    };

    exports.MapProperties = MapProperties;

})(node ? exports : window);
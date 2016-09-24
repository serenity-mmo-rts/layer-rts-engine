
var PlanetGenerator = function(size,seed,roughness) {

    this.size = Math.pow(2,size);
    this.nrOfIterations = size;
    this.seed = seed;
    this.roughness = roughness/100*seed;
    this.map = new Float32Array(this.size * this.size);

    this.loopTime = 0;

    var start =  new Date().getTime();
    this.initMapGeneration();
    var ende =  new Date().getTime();
    var overAllTime = ende-start;
    var heightMap = this.initMapGeneration(roughnessMap);
};


PlanetGenerator.prototype.initMapGeneration = function() {

    var currIteration = 1;
    var currSize = this.size;
    var scale = 1;
    var size = this.size;
    var roughness = this.roughness;

    Math.seedrandom(this.seed);
    var normRand = (Math.random()-0.5)*2; // between -1 and 1
    this.map[0] =this.seed+(normRand*roughness);

    // iterate
    while (currIteration <= this.nrOfIterations) {
        var x = currSize / 2;
        var y = currSize / 2;
        var center = currSize / 2;

        for (y = center; y < size; y += currSize) {
            for (x = center; x < size; x += currSize) {
                var normRand = (Math.random()-0.5)*2; // between -1 and 1
                this.square(x, y, center, normRand*roughness*scale);
            }
        }

        for (y = 0; y < size; y += center) {
            for (x = (y + center) % currSize; x < size; x += currSize) {
                var normRand = (Math.random()-0.5)*2; // between -1 and 1
                this.diamond(x, y, center,normRand*roughness*scale);
            }
        }

        scale /=2;
        currSize /= 2;
        currIteration += 1;
    }
 //   return this.map
};





PlanetGenerator.prototype.square = function(x, y, size, offset) {
    var neighbors = [
        this.getVal(x - size, y - size),   // upper left
        this.getVal(x + size, y - size),   // upper right
        this.getVal(x + size, y + size),   // lower right
        this.getVal(x - size, y + size)    // lower left
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.map[this.size * y + x] = ave + offset;
};

PlanetGenerator.prototype.diamond = function(x, y, size, offset) {
    var neighbors = [
        this.getVal(x, y - size),      // top
        this.getVal(x + size, y),      // right
        this.getVal(x, y + size),      // bottom
        this.getVal(x - size, y)       // left
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.map[this.size * y + x] = ave + offset;
};

PlanetGenerator.prototype.getVal = function(x, y) {
    var size = this.size;
    if (x >=0){
        if(x<=size-1){ // x ok
            if(y >=0 ){
                if( y<=size-1){ // x ok, y ok
                    return this.map[size*y + x ];
                }
                else{ //x ok,  y too big
                    return this.map[size*(y-size)+x];
                }
            }
            else{ //x ok,  y too small
                return this.map[((size+y)*size)+x];
            }
        }
        else{ // x too big
            if(y >=0 ){
                if( y<=this.size-1){ // x too big, y ok
                    return this.map[size*y+(size-x)];
                }
                else{ //x too big, y too big
                    return this.map[0];
                }
            }
        }
    }
    else{ // x too small

        if(y >=0 ){
            if( y<=this.size-1){ // x too small, y ok
                return this.map[((size+x)*size)+y];
            }
        }
    }




/**
    if  (x >=0 && x<=this.size-1 && y >=0 && y<=this.size-1 ){ // not behind edge
        return this.map[this.size*y + x ];
    }
    else if (y < 0 && x  <= this.size-1  &&x >=0){ //  top out
        return this.map[((this.size+y)*this.size)+x];
    }

    else if (x > this.size-1 && y <= this.size-1 && y >=0 ){ // right out
        return this.map[x % this.size  * y];
    }

    else if (y > this.size-1 && x <= this.size-1 && x >=0){ // bottom out
        return this.map[y % this.size * x];
    }

    else if ( x < 0 && y <= this.size-1 &&y >=0){ // left out
        return this.map[((this.size+x)*this.size)+y];
    }

    else if (x > this.size-1 && y > this.size-1){ // right and bottom out
        return this.map[0];
    }
 **/
};


PlanetGenerator.prototype.mapGenerationRoughnessMap = function(roughness) {

    var currIteration = 1;
    var currSize = this.size;
    var scale = 1;
    var size = this.size;

    Math.seedrandom(this.seed);
    this.map[0] = this.seed+roughness[0];

    // iterate
    while (currIteration <= this.nrOfIterations) {
        var x = currSize / 2;
        var y = currSize / 2;
        var center = currSize / 2;

        for (y = center; y < size; y += currSize) {
            for (x = center; x < size; x += currSize) {
                var posi = size * y + x;
                this.square(x, y, center, this.roughness[posi]);
            }
        }

        for (y = 0; y < size; y += center) {
            for (x = (y + center) % currSize; x < size; x += currSize) {
                var posi = size * y + x;
                this.diamond(x, y, center, this.roughness[posi]);
            }
        }

        scale /=2;
        currSize /= 2;
        currIteration += 1;
    }
    //   return this.map
};

PlanetGenerator.prototype.bgMapRenderer = function(){
    var noiseLevel = 0;

    var deepwaterSize = 6;
    var coastwaterSize = 4;
    var beachSize = 2;
    var valleySize = 5;
    var greenSize = 5;
    var mountainSize = 5;
    var halficeSize = 5;
    var iceSize = 20;

    var sumSize = deepwaterSize + coastwaterSize + beachSize + valleySize + greenSize + mountainSize + iceSize;


    var landscape = [];
    landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 120, b: 20}, c2: {r: 50, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 100, g: 120, b: 25, vol: 0.05}, name: "green"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 153, g: 76, b: 0}, c2: {r: 102, g: 51, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});

    var convertToLandscape = function(resDataScaled){
        var resDataScaled = 1-1/(1+resDataScaled);
        var c = {r: 1, g: 1, b: 1};

        var i = 0;
        while (i < landscape.length - 1 && landscape[i].maxV < resDataScaled) {
            i++;
        }
        var minV = (i == 0 ? 0 : landscape[i - 1].maxV);
        var a = (resDataScaled - minV) / (landscape[i].maxV - minV);
        c.r = landscape[i].c1.r * (1 - a) + landscape[i].c2.r * (a);
        c.g = landscape[i].c1.g * (1 - a) + landscape[i].c2.g * (a);
        c.b = landscape[i].c1.b * (1 - a) + landscape[i].c2.b * (a);

        if (landscape[i].cnoise.vol != 0) {
            //Add Noise
            var curNoiseLevel = Math.min(1,Math.max(0, Math.exp( - Math.random() / landscape[i].cnoise.vol )));
            c.r = c.r * (1 - curNoiseLevel) + landscape[i].cnoise.r * curNoiseLevel;
            c.g = c.g * (1 - curNoiseLevel) + landscape[i].cnoise.g * curNoiseLevel;
            c.b = c.b * (1 - curNoiseLevel) + landscape[i].cnoise.b * curNoiseLevel;
        }

        if (noiseLevel) {
            //Add Noise
            c.r += noiseLevel * Math.random();
            c.g += noiseLevel * Math.random();
            c.b += noiseLevel * Math.random();
        }

        return c;
    };
    return convertToLandscape
};

PlanetGenerator.prototype.draw = function(ctx, width, height) {
    var self = this;
    var waterVal = this.size * 0.3;
    for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
            var val = this.get(x, y);
            var top = project(x, y, val);
            var bottom = project(x + 1, y, 0);
            var water = project(x, y, waterVal);
            var style = brightness(x, y, this.get(x + 1, y) - val);
            rect(top, bottom, style);
            rect(water, bottom, 'rgba(50, 150, 200, 0.15)');
        }
    }
    function rect(a, b, style) {
        if (b.y < a.y) return;
        var g = new createjs.Graphics();
        g.setStrokeStyle(1);
        g.beginStroke("#000000");
        g.beginFill("red");
        g.drawCircle(0,0,30);
        var myRect =  myGraphics.beginStroke("red").beginFill("blue").drawRect(20, 20, 100, 50);
    }
    function brightness(x, y, slope) {
        if (y === self.max || x === self.max) return '#000';
        var b = ~~(slope * 50) + 128;
        return ['rgba(', b, ',', b, ',', b, ',1)'].join('');
    }
    function iso(x, y) {
        return {
            x: 0.5 * (self.size + x - y),
            y: 0.5 * (x + y)
        };
    }
    function project(flatX, flatY, flatZ) {
        var point = iso(flatX, flatY);
        var x0 = width * 0.5;
        var y0 = height * 0.2;
        var z = self.size * 0.5 - flatZ + point.y * 0.75;
        var x = (point.x - self.size * 0.5) * 6;
        var y = (self.size - point.y) * 0.005 + 1;
        return {
            x: x0 + x / y,
            y: y0 + z / y
        };
    }
};




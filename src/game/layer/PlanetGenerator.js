
var PlanetGenerator = function(seed,roughness,size,waterLevel,temperature) {

    this.seed = seed;
    this.roughness = roughness/100*seed;
    this.depthAtNormalZoom = size;
    this.stadardEdgeLength = Math.pow(2,this.depthAtNormalZoom);
    this.waterlevel = waterLevel;
    this.temperature = temperature;
    this.mapHeight = [];
    this.mapR = [];
    this.mapG = [];
    this.mapB = [];
    this.mapsCrop = [];
    this.currIteration = 0;
};





PlanetGenerator.prototype.getMatrix = function(xPos,yPos,width,height,n,type) {

    switch (type) {

        case "roughness":
            break;
        case "height":
            return this.getHeight(xPos,yPos,width,height,n);
            break;
        case "temp":
            break;
        case "vegetation":
            break;
        case "rgb":
            this.getHeight(xPos,yPos,width,height,n);
            return this.getRGB(xPos,yPos,width,height,n);
            break;
        case "water":
            break;



    }

};

PlanetGenerator.prototype.getRGB = function(xPos,yPos,width,height,n) {

    var convertToLandscape = (function(){
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

    })();


    this.mapR[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));
    this.mapG[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));
    this.mapB[this.currIteration] = (new Uint8Array(this.sizeX*this.sizeY));

    for (var y = 0;y<this.sizeY;y++){
        var rowIdx = this.sizeY*y;
        for (var x = 0;x<this.sizeX;x++){
            var rgb = convertToLandscape(this.mapHeight[this.currIteration][x+rowIdx]);
            this.mapR[this.currIteration][x+rowIdx] = rgb.r;
            this.mapG[this.currIteration][x+rowIdx] = rgb.g;
            this.mapB[this.currIteration][x+rowIdx] = rgb.b;
        }
    }

    return {r: this.mapR, g: this.mapG, b: this.mapB};


}

PlanetGenerator.prototype.getHeight = function(xPos,yPos,width,height,n) {

    // set initial parameters
    this.currIteration = 1;
    var scale = 1;
    var reshaped = false;
   // this.xSizePercent=1;
   // this.ySizePercent =1;

    // set seed
    Math.seedrandom(this.seed);

    // map for first iteration
    this.mapHeight.push(new Float32Array( this.currIteration * this.currIteration));
    this.mapHeight[0][0] = this.seed;

    this.mapsCrop.push({top: 0, left: 0});

    // iterate
    while (this.currIteration <= n) {

        var currSizeTotal = Math.pow(2, this.currIteration);
        if (reshaped){ // if array already reshaped (not quadratic anymore)

            // determine old of new size of array
            this.oldsizeX = newSizeX;
            this.oldsizeY = newSizeY;
            this.sizeX = newSizeX*2;
            this.sizeY = newSizeY*2;

            // make new array and copy old values into new array
            this.transfer();

            var reqX1 = (Math.floor(currSizeTotal * xPos - this.mapsCrop[this.currIteration-1].left)+currSizeTotal)%currSizeTotal;
            var reqX2 = (Math.ceil(currSizeTotal * (xPos+width) - this.mapsCrop[this.currIteration-1].left)+currSizeTotal)%currSizeTotal;
            var reqY1 = (Math.floor(currSizeTotal * yPos - this.mapsCrop[this.currIteration-1].top)+currSizeTotal)%currSizeTotal;
            var reqY2 = (Math.ceil(currSizeTotal * (yPos+height) - this.mapsCrop[this.currIteration-1].top)+currSizeTotal)%currSizeTotal;
            var newSizeX = (reqX2 - reqX1+1)+4;
            var newSizeY = (reqY2 - reqY1+1)+4;
        }
        else{ // if still quadratic
            // determine old of new size of array
            this.sizeX =  Math.pow(2,this.currIteration);
            this.sizeY=  Math.pow(2,this.currIteration);
            this.oldsizeX=  Math.pow(2,this.currIteration-1);
            this.oldsizeY=  Math.pow(2,this.currIteration-1);

            // make new array and copy old values into new array
            this.transfer();

            // get x and y position, and size of requested area
            var reqX1 = Math.floor(this.sizeX * xPos);
            var reqX2 = Math.ceil(this.sizeX * (xPos + width));
            var reqY1 = Math.floor(this.sizeY * yPos);
            var reqY2 = Math.ceil(this.sizeY * (yPos + height));
            var newSizeX = (reqX2 - reqX1+1)+4;
            var newSizeY = (reqY2 - reqY1+1)+4;
        }


        // Diamond Square
        if (newSizeX+2<this.sizeX || newSizeY+2<this.sizeY){ // if area can be cropped
            var sizeX = this.sizeX;
            var sizeY = this.sizeY;

            // square
            for(var y=reqY1-3;y<=reqY2+3;y+=2 ){
                for(var x=(reqX1-3)-(reqX1-2)%2;x<=reqX2+3;x+=2 ){
                    var normRand = (Math.random()-0.5)*2;
                    this.square(x, y, normRand*this.roughness*scale);
                }
            }

            // diamond
            for(var y=reqY1-2;y<=reqY2+2;y++ ){
                for(var x=(reqX1-2)+(y+1)%2;x<=reqX2+2;x+=2 ){
                    var normRand = (Math.random()-0.5)*2;
                    this.diamond(x, y, normRand*this.roughness*scale);
                }
            }

            // put data into reshaped smaller array
            if (this.currIteration < n){ // crop target area +- 2 as long as its not the last iteration
                var cropper =2
                var croppedMap = new Float32Array(newSizeX*newSizeY);
            }
            else{
                var cropper = 0;
                this.sizeX = newSizeX-5;
                this.sizeY = newSizeY-5;
                var croppedMap = new Float32Array(this.sizeX*this.sizeY);
            }

            var newY = -1;
            for(var y=reqY1-cropper;y<=reqY2+cropper;y++ ){
                newY++;
                var newX = -1;
                for(var x=(reqX1-cropper);x<=reqX2+cropper;x++ ){
                    newX++;
                    croppedMap[(newY*newSizeX)+newX] = this.maps[this.currIteration][sizeY *((y+sizeX)%sizeX) + ((x+sizeX)%sizeX)]
                }
            }
            this.mapHeight[this.currIteration] = croppedMap;



           this.mapsCrop.push({
                top: (((this.mapsCrop[this.currIteration-1].top+reqY1-2)+currSizeTotal)%currSizeTotal)*2,
                left:(((this.mapsCrop[this.currIteration-1].left+reqX1-2)+currSizeTotal)%currSizeTotal)*2
            });

            var reshaped = true;
        }

        else{ // if area is still quadratic
            // square
            for (var y =1; y < this.sizeY; y += 2) {
                for (var x = 1; x < this.sizeX; x += 2) {
                    var normRand = (Math.random()-0.5)*2;
                    this.square(x, y, normRand*this.roughness*scale);
                }
            }
            // diamond
            for (var y = 0; y < this.sizeY; y += 1) {
                for (var x = (y+1)%2; x < this.sizeX; x += 2) {
                    var normRand = (Math.random()-0.5)*2;
                    this.diamond(x, y, normRand*this.roughness*scale);
                }
            }
            var reshaped = false;

            this.mapsCrop.push({
                top: 0,
                left: 0
            });

        }

        scale /=2;
        this.currIteration += 1;
    }

    return this.mapHeight[this.currIteration-1];

};

PlanetGenerator.prototype.getDepthAtNormalZoom =function(){
    return  this.depthAtNormalZoom;
};

PlanetGenerator.prototype.getEdgeLength =function(n){
    return  Math.pow(2,n)
};

PlanetGenerator.prototype.getZoomLevel =function(n){
    return  Math.pow(2,n-this.depthAtNormalZoom);
};

PlanetGenerator.prototype.getCurrentDepth =function(){
    return  this.currIteration;
};

PlanetGenerator.prototype.transfer = function() {

    this.mapHeight.push(new Float32Array(this.sizeX*this.sizeY));
    for (var y = 0;y<this.oldsizeY;y++){
        var oldRowIdx = this.oldsizeY*y;
        var newRowIdx = this.sizeY*(y*2);
        for (var x = 0;x<this.oldsizeX;x++){
            this.mapHeight[this.currIteration][x*2+newRowIdx] = this.mapHeight[this.currIteration-1][x+oldRowIdx];  // check if wrong!!!!
        }
    }
};


PlanetGenerator.prototype.square = function(x, y, offset) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [

        this.mapHeight[this.currIteration][(((sizeX+y-1)%sizeX)*sizeY)+(x-1+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y-1)%sizeX)*sizeY)+(x+1+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y+1)%sizeX)*sizeY)+(x+1+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y+1)%sizeX)*sizeY)+(x-1+sizeX)%sizeX]
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.mapHeight[this.currIteration][sizeY *((y+sizeX)%sizeX) + ((x+sizeX)%sizeX)] = ave + offset;
};

PlanetGenerator.prototype.diamond = function(x, y, offset) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [
        this.mapHeight[this.currIteration][(((sizeX+y-1)%sizeX)*sizeY)+(x+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y)%sizeX)*sizeY)+(x+1+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y+1)%sizeX)*sizeY)+(x+sizeX)%sizeX],
        this.mapHeight[this.currIteration][(((sizeX+y)%sizeX)*sizeY)+(x-1+sizeX)%sizeX]
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.mapHeight[this.currIteration][sizeY *((y+sizeX)%sizeX) + ((x+sizeX)%sizeX)] = ave + offset;
};

PlanetGenerator.prototype.getHeightVal = function(x, y) {
    var size = this.size;
    return this.mapHeight[this.currIteration][(((size+y)%size)*size)+(x+size)%size];
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




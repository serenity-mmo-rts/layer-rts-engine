
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

            // determine new size of array
            this.sizeX = newSizeX*2;
            this.sizeY = newSizeY*2;

            // make new array and copy old values into new array
            var oldsizeX= newSizeX;
            var oldsizeY= newSizeY;
            this.transfer(oldsizeX,oldsizeY);

            // get x and y position, and size of requested area
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

            // make new array and copy old values into new array
            var oldsizeX=  Math.pow(2,this.currIteration-1);
            var oldsizeY=  Math.pow(2,this.currIteration-1);
            this.transfer(oldsizeX,oldsizeY);

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
            for(var y=(reqY1-3)+(reqY1%2);y<=(reqY2+3);y+=2 ){
                for(var x=(reqX1-3)+(reqX1%2);x<=(reqX2+3);x+=2 ){
                    var normRand = (Math.random()-0.5)*2;
                    this.square(x, y, normRand*this.roughness*scale);
                }
            }

            // diamond
            // ((y%2)+2)%2
            for(var y=reqY1-2;y<=reqY2+2;y+=2 ){
                for(var x=(reqX1-2)+(reqX1+reqY1+1)%2;x<=(reqX2+2);x+=2 ){
                    var normRand = (Math.random()-0.5)*2;
                    this.diamond(x, y, normRand*this.roughness*scale);
                }
                for(var x=(reqX1-2)+(reqX1+reqY1+2)%2;x<=(reqX2+2);x+=2 ){
                    var normRand = (Math.random()-0.5)*2;
                    this.diamond(x, y+1, normRand*this.roughness*scale);
                }

            }

            // select only required area in array
            this.crop(2,newSizeX,newSizeY,[reqX1,reqX2,reqY1,reqY2]);
            // crop exact only for last iteration
            if (this.currIteration == n){
                this.crop(0,newSizeX-5,newSizeY-5,[reqX1,reqX2,reqY1,reqY2]);
                this.sizeX = newSizeX-5;
                this.sizeY = newSizeY-5;
            }

            // calculate top left position in global integer values
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

    return this.mapHeight[this.currIteration];

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

PlanetGenerator.prototype.transfer = function(oldSizeX,oldSizeY) {

    this.mapHeight.push(new Float32Array(this.sizeX*this.sizeY));
    for (var y = 0;y<oldSizeY;y++){
        var oldRowIdx = oldSizeX*y;
        var newRowIdx = this.sizeX*(y*2);
        for (var x = 0;x<oldSizeX;x++){
            this.mapHeight[this.currIteration][x*2+newRowIdx] = this.mapHeight[this.currIteration-1][x+oldRowIdx];
        }
    }
};

PlanetGenerator.prototype.crop = function(cropper,newSizeX,newSizeY,cropRegion) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var reqX1 = cropRegion[0];
    var reqX2 = cropRegion[1];
    var reqY1 = cropRegion[2];
    var reqY2 = cropRegion[3];

    // put data into reshaped smaller array
    var croppedMap = new Float32Array(newSizeX*newSizeY);
    var newY = -1;
    for(var y=reqY1-cropper;y<=reqY2+cropper;y++ ){
        newY++;
        var newX = -1;
        for(var x=(reqX1-cropper);x<=reqX2+cropper;x++ ){
            newX++;
            croppedMap[(newY*newSizeX)+newX] = this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)];
        }
    }
    if (cropper>0){
        this.mapHeight[this.currIteration] = croppedMap;
    }
    else{
        this.mapHeight[this.currIteration+1] = croppedMap;
    }

};


/**
PlanetGenerator.prototype.crop = function(cropper,newSizeX,newSizeY,cropRegion) {

    var oldSizeX = this.sizeX;
    var oldSizeY = this.sizeY;
    var reqX1 = cropRegion[0];
    var reqX2 = cropRegion[1];
    var reqY1 = cropRegion[2];
    var reqY2 = cropRegion[3];

    // make new array double double edge length
    this.mapHeight.push(new Float32Array(newSizeX*2*newSizeY*2));

    // transfer data
    var newY = -1;
    for(var y=reqY1-cropper;y<=reqY2+cropper;y++ ){
        newY++;
        var newRowIdx = this.sizeX*(newY*2);
        var newX = -1;
        for(var x=(reqX1-cropper);x<=reqX2+cropper;x++ ){
            newX++;
            this.mapHeight[this.currIteration+1][newRowIdx+newX*2] = this.mapHeight[this.currIteration][((y+oldSizeY)%oldSizeY)*oldSizeX + ((x+oldSizeX)%oldSizeX)];
        }
    }
 }
**/


PlanetGenerator.prototype.square = function(x, y, offset) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [

        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX], // left up
        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right up
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right down
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX] // left down
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = ave + offset;
};

PlanetGenerator.prototype.diamond = function(x, y, offset) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [
        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // top
        this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX],  // right
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // bottom
        this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX]   // left
    ];
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = ave + offset;
};

PlanetGenerator.prototype.getHeightVal = function(x, y) {
    var size = this.size;
    return this.mapHeight[this.currIteration][(((size+y)%size)*size)+(x+size)%size];
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
        var rowIdx = this.sizeX*y;
        for (var x = 0;x<this.sizeX;x++){
            var rgb = convertToLandscape(this.mapHeight[this.currIteration][x+rowIdx]);
            this.mapR[this.currIteration][x+rowIdx] = rgb.r;
            this.mapG[this.currIteration][x+rowIdx] = rgb.g;
            this.mapB[this.currIteration][x+rowIdx] = rgb.b;
        }
    }

    return {r: this.mapR, g: this.mapG, b: this.mapB};


};
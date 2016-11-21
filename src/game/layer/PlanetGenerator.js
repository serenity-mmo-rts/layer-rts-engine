
var PlanetGenerator = function(seed,roughness,size,waterLevel,temperature) {

    this.seed = seed;
    this.roughness = roughness;
    this.depthAtNormalZoom = size;
    this.stadardEdgeLength = Math.pow(2,this.depthAtNormalZoom);
    this.waterlevel = waterLevel;
    this.temperature = temperature;
    this.mapHeight = [];
    this.mapR = [];
    this.mapG = [];
    this.mapB = [];
    this.mapsCrop = [];
    this.requestedAreaIdx = [];
    this.currIteration = 0;
    this.debugLog = false;

    this.minVal = 0;
    this.maxVal = (1 << 31) >>> 0;

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
    this.mapHeight.push(new Uint32Array( this.currIteration * this.currIteration));
    this.mapHeight[0][0] = this.seed;

    this.mapsCrop.push({top: 0, left: 0});

    var targetSizeTotal = Math.pow(2, n);


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
            var reqX1 = (Math.floor(currSizeTotal * xPos / targetSizeTotal - this.mapsCrop[this.currIteration-1].left)+currSizeTotal)%currSizeTotal;
            var reqX2 = (Math.ceil(currSizeTotal * (xPos+width) / targetSizeTotal - this.mapsCrop[this.currIteration-1].left)+currSizeTotal)%currSizeTotal;
            var reqY1 = (Math.floor(currSizeTotal * yPos / targetSizeTotal - this.mapsCrop[this.currIteration-1].top)+currSizeTotal)%currSizeTotal;
            var reqY2 = (Math.ceil(currSizeTotal * (yPos+height) / targetSizeTotal - this.mapsCrop[this.currIteration-1].top)+currSizeTotal)%currSizeTotal;
            var newSizeX = (reqX2 - reqX1+1)+4;
            var newSizeY = (reqY2 - reqY1+1)+4;

            if (this.debugLog) {
                console.log('after transfer:');
                this.dispArray(this.mapHeight[this.currIteration], this.sizeX);
            }

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
            var reqX1 = Math.floor(this.sizeX * xPos / targetSizeTotal);
            var reqX2 = Math.ceil(this.sizeX * (xPos + width) / targetSizeTotal);
            var reqY1 = Math.floor(this.sizeY * yPos / targetSizeTotal);
            var reqY2 = Math.ceil(this.sizeY * (yPos + height) / targetSizeTotal);
            var newSizeX = (reqX2 - reqX1+1)+4;
            var newSizeY = (reqY2 - reqY1+1)+4;

        }

        // after the 4th iteration we constrain the minimum and maximum in the given data range of the 8x8 grid +-10%
        if (this.currIteration==4) {
            this.minVal = Math.min.apply(Math, this.mapHeight[3]);
            this.maxVal = Math.max.apply(Math, this.mapHeight[3]);
            this.range = this.maxVal - this.minVal;

            this.maxVal += Math.ceil(this.range*0.1);
            this.minVal -= Math.floor(this.range*0.1);
            this.range = this.maxVal - this.minVal; // recalculate the range now including 10% buffer
        }

        // Diamond Square
        if (this.currIteration>=4 && (newSizeX+2<this.sizeX || newSizeY+2<this.sizeY)){ // if area can be cropped
            var sizeX = this.sizeX;
            var sizeY = this.sizeY;

            // square
            for(var y=(reqY1-3)+(reqY1%2);y<=(reqY2+3);y+=2 ){
                for(var x=(reqX1-3)+(reqX1%2);x<=(reqX2+3);x+=2 ){
                    this.square(x, y, this.roughness*scale);
                }
            }

            if (this.debugLog) {
                console.log('after square:');
                this.dispArray(this.mapHeight[this.currIteration], this.sizeX);
            }

            // diamond
            // ((y%2)+2)%2
            for(var y=reqY1-2;y<=reqY2+2;y+=2 ){
                for(var x=(reqX1-2)+(reqX1+reqY1+1)%2;x<=(reqX2+2);x+=2 ){
                    this.diamond(x, y, this.roughness*scale);
                }
                for(var x=(reqX1-2)+(reqX1+reqY1+2)%2;x<=(reqX2+2);x+=2 ){
                    this.diamond(x, y+1, this.roughness*scale);
                }

            }

            if (this.debugLog) {
                console.log('after diamond:');
                this.dispArray(this.mapHeight[this.currIteration], this.sizeX);
            }

            // select only required area in array
            this.crop(2,newSizeX,newSizeY,[reqX1,reqX2,reqY1,reqY2]);
            this.requestedAreaIdx.push({reqX1: 2, reqX2: 2, reqY1: newSizeX-2, reqY2: newSizeY-2});

            // crop exact only for last iteration
            /**
            if (this.currIteration == n){
                this.crop(0,newSizeX-5,newSizeY-5,[reqX1,reqX2,reqY1,reqY2]);
                this.sizeX = newSizeX-5;
                this.sizeY = newSizeY-5;
            }
             **/

            // calculate top left position in global integer values
           this.mapsCrop.push({
                top: (((this.mapsCrop[this.currIteration-1].top+reqY1-2)+currSizeTotal)%currSizeTotal)*2,
                left:(((this.mapsCrop[this.currIteration-1].left+reqX1-2)+currSizeTotal)%currSizeTotal)*2
            });

            var reshaped = true;

         //   this.debugArray(newSizeX,newSizeY);

        }

        else{ // if area is still quadratic
            // square
            for (var y =1; y < this.sizeY; y += 2) {
                for (var x = 1; x < this.sizeX; x += 2) {
                    this.square(x, y, this.roughness*scale);
                }
            }

            if (this.debugLog) {
                console.log('after square:');
                this.dispArray(this.mapHeight[this.currIteration], this.sizeX);
            }

            // diamond
            for (var y = 0; y < this.sizeY; y += 1) {
                for (var x = (y+1)%2; x < this.sizeX; x += 2) {
                    this.diamond(x, y, this.roughness*scale);
                }
            }


            if (this.debugLog) {
                console.log('after diamong:');
                this.dispArray(this.mapHeight[this.currIteration], this.sizeX);
            }

            var reshaped = false;
            this.requestedAreaIdx.push({reqX1: reqX1, reqX2: reqX2, reqY1: reqY1, reqY2: reqY2});

            this.mapsCrop.push({
                top: 0,
                left: 0
            });


          //  this.debugArray(this.sizeX,this.sizeY);

        }

        scale /=2;
        this.currIteration += 1;
    }
    this.currIteration -= 1;
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

    this.mapHeight.push(new Uint32Array(this.sizeX*this.sizeY));
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
    var croppedMap = new Uint32Array(newSizeX*newSizeY);
    var newY = -1;
    for(var y=reqY1-cropper;y<=reqY2+cropper;y++ ){
        newY++;
        var newX = -1;
        for(var x=(reqX1-cropper);x<=reqX2+cropper;x++ ){
            newX++;
            croppedMap[(newY*newSizeX)+newX] = this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)];
        }
    }
        this.mapHeight[this.currIteration] = croppedMap;


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
    this.mapHeight.push(new Uint32Array(newSizeX*2*newSizeY*2));

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


PlanetGenerator.prototype.square = function(x, y, scaling) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [

        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX], // left up
        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right up
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right down
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX] // left down
    ];

    
    //var randnum = Math.random();
    //var normRand = (randnum-0.5)*2;
    var randnum = this.randomUint32(neighbors[0],neighbors[1],neighbors[2],neighbors[3]);
    //var normRand = randnum - (1 << 30); // convert the unsigned int to int centered around 0
    //console.log(normRand);
    if (neighbors[0] == 0 ||neighbors[1] == 0 ||neighbors[2] == 0 ||neighbors[3] == 0) {
        var stupid = true;
    }

    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    var newValue = ave + randnum*scaling;

    // check for underflow:
    if (newValue<this.minVal) {
        newValue = this.minVal;
    }

    // check for overflow:
    if (newValue>this.maxVal) {
        newValue = this.maxVal;
    }

    this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;

    //this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = neighbors[0] + 1;
};

PlanetGenerator.prototype.diamond = function(x, y, scaling) {
    var sizeX = this.sizeX;
    var sizeY = this.sizeY;
    var neighbors = [
        this.mapHeight[this.currIteration][(((y-1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // top
        this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX],  // right
        this.mapHeight[this.currIteration][(((y+1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // bottom
        this.mapHeight[this.currIteration][(((y+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX]   // left
    ];

    
    //var randnum = Math.random();
    //var normRand = (randnum-0.5)*2;
    var randnum = this.randomUint32(neighbors[0],neighbors[1],neighbors[2],neighbors[3]);
    //var normRand = randnum - (1 << 30); // convert the unsigned int to int centered around 0
    //console.log(normRand);
    if (neighbors[0] == 0 ||neighbors[1] == 0 ||neighbors[2] == 0 ||neighbors[3] == 0) {
        var stupid = true;
    }
    var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
    
    var newValue = ave + randnum*scaling;

    // check for underflow:
    if (newValue<this.minVal) {
        newValue = this.minVal;
    }

    // check for overflow:
    if (newValue>this.maxVal) {
        newValue = this.maxVal;
    }

    this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;

    //this.mapHeight[this.currIteration][((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = neighbors[0] + 1;
};
PlanetGenerator.prototype.debugArray = function(sizeX,sizeY) {
    console.log('start')
    for (var i = 0;i<sizeY;i++){
        for (var k=0;k<sizeX;k++){
            console.log(this.mapHeight[this.currIteration][i*sizeX+k]);
        }
    }
    console.log('end')

};PlanetGenerator.prototype.dispArray = function(arr,width) {

    for (var y =0; y < arr.length/width; y ++) {

        var output = '';
        for (var x = 0; x < width; x ++) {
            output += arr[y*width+x] + ' ';
        }
        //+ '\n';
        console.log(output);
    }

};

PlanetGenerator.prototype.randomUint32 = function(seed1,seed2,seed3,seed4) {
    //var t = (seed1 ^ (seed1 >>> 7)) >>> 0;
    //var v = (seed2 ^ (seed2 << 6)) ^ (t ^ (t << 13)) >>> 0;
    //return ((seed3 + seed3 + 1) * v) >>> 0;

    var t = seed1 ^ (seed1 << 11);
    return (seed2 ^ (seed2 >> 19)) ^ (t ^ (t >> 8));
};


PlanetGenerator.prototype.random = function (seed1,seed2,seed3,seed4) {
    return this.randomUint32(seed1,seed2,seed3,seed4) * 2.3283064365386963e-10;
};


PlanetGenerator.prototype.getHeightVal = function(x, y) {
    var size = this.size;
    return this.mapHeight[this.currIteration][(((size+y)%size)*size)+(x+size)%size];
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
        landscape.push({maxV: landscape[landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "green"});
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
            var height = this.mapHeight[this.currIteration][x+rowIdx];
            var heightScaled = (height - this.minVal) / this.range;
            var rgb = convertToLandscape(heightScaled);
            this.mapR[this.currIteration][x+rowIdx] = rgb.r;
            this.mapG[this.currIteration][x+rowIdx] = rgb.g;
            this.mapB[this.currIteration][x+rowIdx] = rgb.b;
        }
    }

    return {r: this.mapR, g: this.mapG, b: this.mapB};


};
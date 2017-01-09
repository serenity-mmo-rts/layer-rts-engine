var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {


    var DiamondSquareMap = function(iteration,xPos,yPos,width,height,finalIteration,lowResMap,seed,roughness) {

        this.currIteration = iteration;
        this.mapsCropsTop = 0;
        this.mapsCropsLeft = 0;
        this.lowResMap = null;
        this.seed = seed;
        this.roughness =roughness
        this.scale = 1;
        this.reshaped = false;
        this.minVal = 0;
        this.maxVal = (1 << 31) >>> 0;

        var targetSizeTotal = Math.pow(2,finalIteration);

        if (iteration>0) {
            this.lowResMap = lowResMap;
            this.scale = this.lowResMap.scale / 2;
            this.seed = this.lowResMap.seed;
            this.roughness = this.lowResMap.roughness;
            this.reshaped = this.lowResMap.reshaped;
            this.minVal = this.lowResMap.minVal;
            this.maxVal = this.lowResMap.maxVal;
        }

        var currSizeTotal = Math.pow(2, this.currIteration);
        if (this.reshaped){ // if array already reshaped (not quadratic anymore)

            // determine new size of array
            this.sizeX = this.lowResMap.newSizeX*2;
            this.sizeY = this.lowResMap.newSizeY*2;

            // make new array and copy old values into new array
            var oldsizeX= this.lowResMap.newSizeX;
            var oldsizeY= this.lowResMap.newSizeY;

            // get x and y position, and size of requested area
            var reqX1 = (Math.floor(currSizeTotal * xPos / targetSizeTotal - this.lowResMap.mapsCropsLeft)+currSizeTotal)%currSizeTotal;
            var reqX2 = (Math.ceil(currSizeTotal * (xPos+width) / targetSizeTotal - this.lowResMap.mapsCropsLeft)+currSizeTotal)%currSizeTotal;
            var reqY1 = (Math.floor(currSizeTotal * yPos / targetSizeTotal - this.lowResMap.mapsCropsTop)+currSizeTotal)%currSizeTotal;
            var reqY2 = (Math.ceil(currSizeTotal * (yPos+height) / targetSizeTotal - this.lowResMap.mapsCropsTop)+currSizeTotal)%currSizeTotal;

        }
        else{ // if still quadratic

            // determine old of new size of array
            this.sizeX =  currSizeTotal;
            this.sizeY=  currSizeTotal;

            // make new array and copy old values into new array
            var oldsizeX=  Math.pow(2,this.currIteration-1);
            var oldsizeY=  Math.pow(2,this.currIteration-1);

            // get x and y position, and size of requested area
            var reqX1 = Math.floor(this.sizeX * xPos / targetSizeTotal);
            var reqX2 = Math.ceil(this.sizeX * (xPos + width) / targetSizeTotal);
            var reqY1 = Math.floor(this.sizeY * yPos / targetSizeTotal);
            var reqY2 = Math.ceil(this.sizeY * (yPos + height) / targetSizeTotal);
        }

        this.map = new Uint32Array(this.sizeX*this.sizeY);
        if (this.currIteration>0){ // not for first iteration
            for (var y = 0;y<oldsizeY;y++){
                var oldRowIdx = oldsizeX*y;
                var newRowIdx = this.sizeX*(y*2);
                for (var x = 0;x<oldsizeX;x++){
                    this.map[x*2+newRowIdx] = this.lowResMap.map[x+oldRowIdx];
                }
            }
        }

        this.newSizeX = (reqX2 - reqX1+1)+4;
        this.newSizeY = (reqY2 - reqY1+1)+4;

        // after the 4th iteration we constrain the minimum and maximum in the given data range of the 8x8 grid +-10%
        if (this.currIteration==4) {
            this.minVal = Math.min.apply(Math, this.map);
            this.maxVal = Math.max.apply(Math, this.map);
            this.range = this.maxVal - this.minVal;

            this.maxVal += Math.ceil(this.range*0.01);
            this.minVal -= Math.floor(this.range*0.01);
            this.range = this.maxVal - this.minVal; // recalculate the range now including 10% buffer
        }

        // Diamond Square
        if (this.currIteration>=4 && (this.newSizeX+2<this.sizeX || this.newSizeY+2<this.sizeY)){ // if area can be cropped
            var sizeX = this.sizeX;
            var sizeY = this.sizeY;

            // square
            for(var y=(reqY1-3)+(reqY1%2);y<=(reqY2+3);y+=2 ){
                for(var x=(reqX1-3)+(reqX1%2);x<=(reqX2+3);x+=2 ){
                    this.square(x, y, this.roughness*this.scale);
                }
            }

            // diamond
            for(var y=reqY1-2;y<=reqY2+2;y+=2 ){
                for(var x=(reqX1-2)+(reqX1+reqY1+1)%2;x<=(reqX2+2);x+=2 ){
                    this.diamond(x, y, this.roughness*this.scale);
                }
                if (y+1<=reqY2+2){
                    for(var x=(reqX1-2)+(reqX1+reqY1+2)%2;x<=(reqX2+2);x+=2 ){
                        this.diamond(x, y+1, this.roughness*this.scale);
                    }
                }
            }

            // select only required area in array
            this.crop([reqX1,reqX2,reqY1,reqY2]);

            // calculate top left position in global integer values
            this.mapsCropsTop = (((this.lowResMap.mapsCropsTop+reqY1-2)+currSizeTotal)%currSizeTotal)*2;
            this.mapsCropsLeft =(((this.lowResMap.mapsCropLeft+reqX1-2)+currSizeTotal)%currSizeTotal)*2;
            this.reshaped = true;

        }
        else if (this.currIteration>0){ // if area is still  quadratic
            // square
            for (var y =1; y < this.sizeY; y += 2) {
                for (var x = 1; x < this.sizeX; x += 2) {
                    this.square(x, y, this.roughness*this.scale);
                }
            }

            // diamond
            for (var y = 0; y < this.sizeY; y += 1) {
                for (var x = (y+1)%2; x < this.sizeX; x += 2) {
                    this.diamond(x, y, this.roughness*this.scale);
                }
            }

            this.mapsCropsTop = 0;
            this.mapsCropsLeft = 0;
            this.reshaped = false;
        }
        else{ // only for first iteration

            this.map[0] = this.seed;
            this.mapsCropsTop = 0;
            this.mapsCropsLeft = 0;
            this.reshaped = false;
        }


    };

    DiamondSquareMap.prototype.square = function(x, y, scaling) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var neighbors = [
            this.map[(((y-1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX], // left up
            this.map[(((y-1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right up
            this.map[(((y+1+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX], // right down
            this.map[(((y+1+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX] // left down
        ];

        var randnum = this.random(neighbors);
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

        this.map[((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;
    };


    DiamondSquareMap.prototype.diamond = function(x, y, scaling) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var neighbors = [
            this.map[(((y-1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // top
            this.map[(((y+sizeY)%sizeY)*sizeX)+(x+1+sizeX)%sizeX],  // right
            this.map[(((y+1+sizeY)%sizeY)*sizeX)+(x+sizeX)%sizeX],  // bottom
            this.map[(((y+sizeY)%sizeY)*sizeX)+(x-1+sizeX)%sizeX]   // left
        ];

        var randnum = this.random(neighbors);
        var ave = (neighbors[0]+neighbors[1]+neighbors[2]+neighbors[3])/4;
        var newValue = ave + 2*randnum*scaling;

        // check for underflow:
        if (newValue<this.minVal) {
            newValue = this.minVal;
        }

        // check for overflow:
        if (newValue>this.maxVal) {
            newValue = this.maxVal;
        }

        this.map[((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)] = newValue;
    };

    DiamondSquareMap.prototype.crop = function(cropRegion) {
        var sizeX = this.sizeX;
        var sizeY = this.sizeY;
        var reqX1 = cropRegion[0];
        var reqX2 = cropRegion[1];
        var reqY1 = cropRegion[2];
        var reqY2 = cropRegion[3];
        var newSizeX = this.newSizeX;
        var newSizeY = this.newSizeY;

        // put data into reshaped smaller array
        var croppedMap = new Uint32Array(newSizeX*newSizeY);
        var newY = -1;
        for(var y=reqY1-2;y<=reqY2+2;y++ ){
            newY++;
            var newX = -1;
            for(var x=(reqX1-2);x<=reqX2+2;x++ ){
                newX++;
                croppedMap[(newY*newSizeX)+newX] = this.map[((y+sizeY)%sizeY)*sizeX + ((x+sizeX)%sizeX)];
            }
        }
        this.map = croppedMap;
    };

    DiamondSquareMap.prototype.randomUint32 = function(seedArray) {
        var seed1 = seedArray[0];
        var seed2 = seedArray[1];
        var seed3 = seedArray[2];
        var seed4 = seedArray[3];

        var numShift1 = seed1 & 15; //this is the same as seed1 % 16;
        var numShift2 = seed2 & 15;
        var numShift3 = seed3 & 15;
        var numShift4 = seed4 & 15;

        var shifted1 = seed1 >> (numShift2+1);
        var shifted2 = seed2 << (numShift3+2);
        var shifted3 = seed3 << (numShift4+3);
        var shifted4 = seed4 >> (numShift1+4);

        return shifted1 ^ shifted2 ^ shifted3 ^ shifted4;
    };


    DiamondSquareMap.prototype.random = function (seedArray) {
        var randnum = this.randomUint32(seedArray);
        randnum /= (1 << 30); // convert to number between 0 and 1
        //console.log( randnum );
        return randnum;
    };

    exports.DiamondSquareMap = DiamondSquareMap;

})(node ? exports : window);
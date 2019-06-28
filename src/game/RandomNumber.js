var node = !(typeof exports === 'undefined');

if (node) {

}

(function (exports) {

    //Webkit2's crazy invertible mapping generator
    var RandomNumber = function() {
        this.max = Math.pow(2, 32);
        this.seed = null;
    };

    RandomNumber.prototype.setSeed = function(val) {
        this.seed = val || Math.round(Math.random() * this.max);
    };
    RandomNumber.prototype.getSeed = function() {
        return this.seed;
    };
    RandomNumber.prototype.rand = function() {
        // creates randomness...somehow...
        this.seed += (this.seed * this.seed) | 5;
        // Shift off bits, discarding the sign. Discarding the sign is
        // important because OR w/ 5 can give us + or - numbers.
        return (this.seed >>> 32) / this.max;
    };
    RandomNumber.prototype.randn = function() {
        return ((this.rand() + this.rand() + this.rand() + this.rand() + this.rand() + this.rand()) - 3) / 3;
    };

    exports.RandomNumber = RandomNumber;

})(typeof exports === 'undefined' ? window : exports);
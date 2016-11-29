var node = !(typeof exports === 'undefined');

if (node) {

}

(function (exports) {

    //Webkit2's crazy invertible mapping generator
    var RandomNumber = (function() {
        var max = Math.pow(2, 32),
            seed;
        return {
            setSeed : function(val) {
                seed = val || Math.round(Math.random() * max);
            },
            getSeed : function() {
                return seed;
            },
            rand : function() {
                // creates randomness...somehow...
                seed += (seed * seed) | 5;
                // Shift off bits, discarding the sign. Discarding the sign is
                // important because OR w/ 5 can give us + or - numbers.
                return (seed >>> 32) / max;
            },

            randn: function () {
            return ((this.rand() + this.rand() + this.rand() + this.rand() + this.rand() + this.rand()) - 3) / 3;
            }
        };
    }());

    exports.RandomNumber = RandomNumber;

})(typeof exports === 'undefined' ? window : exports);
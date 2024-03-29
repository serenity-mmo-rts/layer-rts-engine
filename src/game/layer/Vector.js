/**
 * Created by Holger on 06.12.2014.
 */

var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {


    function Vector(x, y) {
        this.x = Number(x) || 0;
        this.y = Number(y) || 0;
    }

    Vector.prototype.set = function(x, y) {
        if(x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = Number(x) || this.x;
            this.y = Number(y) || this.y;
        }

        return this;
    };

    Vector.prototype.setAngle = function(ang) {
        var o = this.angle();
        this.rotate(-1*o);
        this.rotate(ang);
        return this;
    };

    Vector.prototype.scale = function(s) {
        s = Number(s) || 1;
        this.x *= s;
        this.y *= s;
        return this;
    };

    Vector.prototype.add = function(b, s) {
        s = Number(s) || 1;
        this.x += b.x*s;
        this.y += b.y*s;
        return this;
    };

    Vector.prototype.subtract = function(b, s) {
        s = Number(s) || 1;
        this.x -= b.x*s;
        this.y -= b.y*s;
        return this;
    };

    Vector.prototype.dot = function(b) {
        return (this.x*b.x + this.y*b.y);
    };

    Vector.prototype.magnitude = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    Vector.prototype.rotate = function(ang) {
        var x = this.x*Math.cos(ang) + this.y*Math.sin(ang);
        var y = this.x*Math.sin(ang) - this.y*Math.cos(ang);

        this.x = x;
        this.y = -y;

        return this;
    };

    Vector.prototype.angle = function() {
        return Math.atan2(-this.y, this.x);
    };

    Vector.prototype.invert = function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    Vector.prototype.isNear = function(x, y, r) {
        var a = (this.x - x);
        var b = (this.y - y);
        var m = a*a + b*b;

        if(m <= r*r)
            return true;

        return false;
    };

    exports.Vector = Vector;

})(node ? exports : window);
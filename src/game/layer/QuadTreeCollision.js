var node = !(typeof exports === 'undefined');
if (node) {
    var Vector = require('./Vector').Vector;
}

(function (exports) {


    /*
    This file contains three classes:
    1. QuadTreeCollision is just the outer interface to handle array inserts etc.
    2. Bounds defines entities that can be inserted into the quad-tree.
    3. Quadrant defines a quadrant within the quad-tree.
     */




    /********************************
     * QuadTreeCollision Class Definition:
     *******************************/


    /**
     * QuadTreeCollision data structure.
     * @class QuadTreeCollision
     * @constructor
     * @param {Object} An object representing the bounds of the top level of the QuadTreeCollision. The object
     * should contain the following properties : x, y, width, height
     * (width / height)(false). Default value is false.
     * @param {Number} maxDepth The maximum number of levels that the QuadTreeCollision will create. Default is 4.
     * @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
     **/
    function QuadTreeCollision(bounds, periodicBounds, maxDepth, maxChildren)
    {
        this.bounds = bounds;
        this.periodicBounds = periodicBounds;
        this.root = new Quadrant(bounds, 0, maxDepth, maxChildren, periodicBounds);
    }


    /**
     * The root node of the QuadTreeCollision which covers the entire area being segmented.
     * @property root
     * @type Node
     **/
    QuadTreeCollision.prototype.root = null;

    QuadTreeCollision.prototype.periodic = null;


    /**
     * Inserts an item into the QuadTreeCollision.
     * @method insert
     * @param {Object|Array} item The item or Array of items to be inserted into the QuadTreeCollision. The item should expose x, y
     * properties that represents its position in 2D space.
     **/
    QuadTreeCollision.prototype.insert = function(item)
    {
        if(item instanceof Array)
        {
            var len = item.length;

            for(var i = 0; i < len; i++)
            {
                this.root.insert(item[i]);
            }
        }
        else
        {
            this.root.insert(item);
        }
    };



    QuadTreeCollision.prototype.remove = function(item)
    {
        this.root.remove(item);
    };


    /**
     * Clears all nodes and children from the QuadTreeCollision
     * @method clear
     **/
    QuadTreeCollision.prototype.clear = function()
    {
        this.root.clear();
    };

    /**
     * Retrieves all items / points in the same node as the specified item / point. If the specified item
     * overlaps the bounds of a node, then all children in both nodes will be returned.
     * @method retrieve
     * @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
     * with dimensions (x, y, width, height) properties.
     **/
    QuadTreeCollision.prototype.retrieve = function(item,preCollisionCheck)
    {
        //get a copy of the array of items
        var out = this.root.retrieve(item, preCollisionCheck).slice(0);
        return out;
    };




    /********************************
     * Bounds Class Definition:
     *******************************/


    /**
     * Bounds data structure.
     * @class Bounds
     * @constructor
     **/
    function Bounds()
    {
        // initialize standard axis vectors:
        this.aW = new Vector(1, 0);
        this.aH = new Vector(0, -1);
    }

    Bounds.prototype.initCircle = function (x,y,r) {

        this.x = x;
        this.y = y;
        this.r = r;

        // calculate grid-aligned-outer-rectangle:
        this.x1 = x - r;
        this.x2 = x + r;
        this.y1 = y - r;
        this.y2 = y + r;

        this.pos = new Vector(this.x, this.y);

        return this;
    };

    Bounds.prototype.initRectByCenter = function (x,y,w,h,o) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.o = o;

        if (o) {
            // rotate axes using orientation o:
            this.aW.rotate(o);
            this.aH.rotate(o);

            // calculate grid-aligned-outer-rectangle:
            var alignedW = Math.abs(w * Math.cos(o)) + Math.abs(h * Math.sin(o));
            var alignedH = Math.abs(w * Math.sin(o)) + Math.abs(h * Math.cos(o));
            this.x1 = x - alignedW/2;
            this.x2 = x + alignedW/2;
            this.y1 = y - alignedH/2;
            this.y2 = y + alignedH/2;
        }
        else {
            // calculate grid-aligned-outer-rectangle:
            this.x1 = x - w/2;
            this.x2 = x + w/2;
            this.y1 = y - h/2;
            this.y2 = y + h/2;
        }

        this.pos = new Vector(this.x, this.y);

        return this;
    };

    Bounds.prototype.initRectByOuterCoord = function (x1,x2,y1,y2) {

        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        this.x = (x1+x2)/2;
        this.y = (y1+y2)/2;
        this.w = x2-x1;
        this.h = y2-y1;

        this.o = 0;

        this.pos = new Vector(this.x, this.y);

        return this;
    };

    // center coordinates:
    Bounds.prototype.x = null; // coordinate of the center
    Bounds.prototype.y = null; // coordinate of the center

    // as vector:
    Bounds.prototype.pos = null;

    // the following should be set for rectangles:
    Bounds.prototype.w = 0; // width of rectangle (0 if no rectangle)
    Bounds.prototype.h = 0; // height of rectangle (0 if no rectangle)
    Bounds.prototype.o = 0; // orientation of rectangle (0 if rectangle is grid-aligned)

    // the following should be set for circles:
    Bounds.prototype.r = 0; // radius of circle (0 if no circle)

    // axes:
    Bounds.prototype.aW = null; // unit-vector pointing into the direction of w (if aW points right, then aH points down)
    Bounds.prototype.aH = null; // unit-vector pointing into the direction of h (if aW points right, then aH points down)

    // grid-aligned-outer-rectangle:
    Bounds.prototype.x1 = null; // x-coordinate of left edge of grid-aligned-outer-rectangle
    Bounds.prototype.x2 = null; // x-coordinate of right edge of grid-aligned-outer-rectangle
    Bounds.prototype.y1 = null; // y-coordinate of top edge of grid-aligned-outer-rectangle
    Bounds.prototype.y2 = null; // y-coordinate of bottom edge of grid-aligned-outer-rectangle


    Bounds.prototype.isOuterRectColliding = function(item, periodicBounds) {
        if (periodicBounds) {
            // we assume that both center coordinates are within the inner period...

            // X Axis:
            var periodMoveItemX = periodicBounds.w;
            if (item.x > this.x) {
                periodMoveItemX = -periodMoveItemX;
            }
            if (item.x1 > this.x2 && item.x2+periodMoveItemX < this.x1) {
                return false;
            }
            if (item.x2 < this.x1 && item.x1+periodMoveItemX > this.x2) {
                return false;
            }

            // Y Axis:
            var periodMoveItemY = periodicBounds.h;
            if (item.y > this.y) {
                periodMoveItemY = -periodMoveItemY;
            }
            if (item.y1 > this.y2 && item.y2+periodMoveItemY < this.y1) {
                return false;
            }
            if (item.y2 < this.y1 && item.y1+periodMoveItemY > this.y2) {
                return false;
            }

            return true;

        }
        else {
            if (item.x1 > this.x2 ||
                item.x2 < this.x1 ||
                item.y1 > this.y2 ||
                item.y2 < this.y1) {
                return false;
            }
            else {
                return true;
            }
        }
    };


    Bounds.prototype.isColliding = function(item, periodicBounds) {

        // first, just check if outerRects are colliding, because this is very fast:
        var outerCollision = this.isOuterRectColliding(item, periodicBounds);

        if (!outerCollision) {
            // if the outerRect is not colliding, then collision is not possible, so directly return:
            return false;
        }
        else {
            // outerRects are colliding.
            if (this.o==0 && item.o==0 && !this.r && !item.r) {
                // both are aligned to grid, therefore no further check is needed, just return the outerCollision:
                return outerCollision;
            }
        }


        // check if we deal with either two rect or rect and circle or two circles:
        if(this.r && item.r) {
            // two circles

            if (periodicBounds){

                // X Axis:
                var periodMoveItemX = periodicBounds.w;
                if (item.x > this.x) {
                    periodMoveItemX = -periodMoveItemX;
                }

                // Y Axis:
                var periodMoveItemY = periodicBounds.h;
                if (item.y > this.y) {
                    periodMoveItemY = -periodMoveItemY;
                }

                var rBoth = this.r + item.r;
                var xDist = this.x - item.x;
                var yDist = this.y - item.y;
                var xDistPeriod = this.x - (item.x+periodMoveItemX);
                var yDistPeriod = this.y - (item.y+periodMoveItemY);

                // check both direct
                if (rBoth * rBoth > xDist * xDist + yDist * yDist) {
                    return true;
                }
                // check both indirect
                if (rBoth * rBoth > xDistPeriod * xDistPeriod + yDistPeriod * yDistPeriod){
                    return true;
                }
                // check one direct and one indirect
                if (rBoth * rBoth > xDistPeriod * xDistPeriod + yDist * yDist){
                    return true;
                }
                // check one direct and one indirect
                if (rBoth * rBoth > xDist * xDist + yDistPeriod * yDistPeriod){
                    return true;
                }

                // TODO
                return false;

            }
            else {
                var xDist = this.x - item.x;
                var yDist = this.y - item.y;
                var rBoth = this.r + item.r;
                return (rBoth * rBoth > xDist * xDist + yDist * yDist);
            }

        }
        else if (!this.r && !item.r) {
            // two rectangles:

            // see http://jsbin.com/esubuw/4/edit?html,js,output
            // see http://www.gamedev.net/page/resources/_/technical/game-programming/2d-rotated-rectangle-collision-r2604

            var t = new Vector(item.x, item.y);
            t.subtract(this.pos);
            var sa = new Vector(t.dot(this.aW), t.dot(this.aH));

            var d = new Array(4);
            d[0] = this.aW.dot(item.aW);
            d[1] = this.aW.dot(item.aH);
            d[2] = this.aH.dot(item.aW);
            d[3] = this.aH.dot(item.aH);

            var ra = 0, rb = 0;

            ra = this.w * 0.5;
            rb = Math.abs(d[0]) * item.w * 0.5 + Math.abs(d[1]) * item.h * 0.5;
            if (Math.abs(sa.x) > ra + rb) {
                return false;
            }

            ra = this.h * 0.5;
            rb = Math.abs(d[2]) * item.w * 0.5 + Math.abs(d[3]) * item.h * 0.5;
            if (Math.abs(sa.y) > ra + rb) {
                return false;
            }

            t.set(this.pos);
            t.subtract(item.pos);
            var sb = new Vector(t.dot(item.aW), t.dot(item.aH));

            ra = Math.abs(d[0]) * this.w * 0.5 + Math.abs(d[2]) * this.h * 0.5;
            rb = item.w * 0.5;
            if (Math.abs(sb.x) > ra + rb) {
                return false;
            }

            ra = Math.abs(d[1]) * this.w * 0.5 + Math.abs(d[3]) * this.h * 0.5;
            rb = item.h * 0.5;
            if (Math.abs(sb.y) > ra + rb) {
                return false;
            }

            // otherwise collision detected:
            return true;

        }
        else {
            // one rect and one circle

            var rect;
            var circ;
            if(this.r){
                rect = item;
                circ = this;
            }
            else {
                rect = this;
                circ = item;
            }

            // now detect collision between rect and circle:
            // see http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle-in-html5-canvas

            var distX = circ.x - rect.x;
            var distY = circ.y - rect.y;

            var cs = Math.cos(rect.o);
            var sn = Math.sin(rect.o);

            var rectDistX = Math.abs(distX * cs - distY * sn);
            var rectDistY = Math.abs(distX * sn + distY * cs);

            if (rectDistX > (rect.w/2 + circ.r)) { return false; }
            if (rectDistY > (rect.h/2 + circ.r)) { return false; }

            if (rectDistX <= (rect.w/2)) { return true; }
            if (rectDistY <= (rect.h/2)) { return true; }

            var dx=rectDistX-rect.w/2;
            var dy=rectDistY-rect.h/2;
            return (dx*dx+dy*dy<=(circ.r*circ.r));

        }
    };





    /********************************
     * Quadrant Class Definition:
     *******************************/


    /**
     * Quadrant data structure.
     * @class Quadrant
     * @constructor
     **/
    function Quadrant(bounds, depth, maxChildren, maxDepth, periodicBounds)
    {
        this.bounds = bounds;
        this.children = [];
        this.nodes = [];
        this.periodicBounds = periodicBounds;

        if(maxChildren)
        {
            this.maxChildren = maxChildren;
        }

        if(maxDepth)
        {
            this.maxDepth = maxDepth;
        }

        if(depth)
        {
            this.depth = depth;
        }
    }

    Quadrant.prototype.nodes = null;
    Quadrant.prototype.children = null; //children contained directly in the node
    Quadrant.prototype.bounds = null;
    Quadrant.prototype.periodicBounds = 0;
    Quadrant.prototype.depth = 0;
    Quadrant.prototype.maxChildren = 4;
    Quadrant.prototype.maxDepth = 4;

    //Sub-Quadrant constants:
    Quadrant.TOP_LEFT = 0;
    Quadrant.TOP_RIGHT = 1;
    Quadrant.BOTTOM_LEFT = 2;
    Quadrant.BOTTOM_RIGHT = 3;

    /**
     * Find which of the four child quadrants are overlapping with the given item.
     * @param item
     * @returns {Array}
     * @private
     */
    Quadrant.prototype.findAllCollidingQuadrants = function(item)
    {
        var indices = [];
        for (var i = this.nodes.length - 1; i >= 0; i--) {
            if (item.isOuterRectColliding(this.nodes[i].bounds, this.periodicBounds)) {
                indices.push(i);
            }
        }
        return indices;
    };


    /*
     * Determine which quadrant the object belongs to or -1 if none
     * @param Object item		bounds of the area to be checked, with x, y, width, height
     * @return Integer		index of the subnode (0-3), or -1 if pRect cannot completely fit within a subnode and is part of the parent node
     */
    Quadrant.prototype.findSubquadrant = function (item) {

        var xCenter = this.bounds.x;
        var yCenter = this.bounds.y;

        //item can completely fit within the top quadrants
        var topQuadrant = (item.y2 < yCenter && item.y1 > this.bounds.y1);

        //item can completely fit within the bottom quadrants
        var bottomQuadrant = (item.y1 > yCenter && item.y2 < this.bounds.y2);

        // check for left/right quadrants:
        if (item.x2 < xCenter && item.x1 > this.bounds.x1) {
            //item can completely fit within the left quadrants
            if (topQuadrant) {
                return Quadrant.TOP_LEFT;
            } else if (bottomQuadrant) {
                return Quadrant.BOTTOM_LEFT;
            }
        }
        else if (item.x1 > xCenter && item.x2 < this.bounds.x2) {
            //item can completely fit within the right quadrants
            if (topQuadrant) {
                return Quadrant.TOP_RIGHT;
            } else if (bottomQuadrant) {
                return Quadrant.BOTTOM_RIGHT;
            }
        }

        // item does not completely fit into one of the quadrants
        return -1;
    };



    Quadrant.prototype.subdivide = function()
    {
        var depth = this.depth + 1;

        var x1 = this.bounds.x1;
        var x2 = this.bounds.x2;
        var y1 = this.bounds.y1;
        var y2 = this.bounds.y2;

        // center coordinates of this quadrant:
        var xC = (x1 + x2) / 2;
        var yC = (y1 + y2) / 2;

        //top left
        this.nodes[Quadrant.TOP_LEFT] = new Quadrant(
            new Bounds().initRectByOuterCoord(x1,xC,y1,yC),
            depth, this.maxChildren, this.maxDepth, this.periodicBounds);

        //top right
        this.nodes[Quadrant.TOP_RIGHT] = new Quadrant(
            new Bounds().initRectByOuterCoord(xC,x2,y1,yC),
            depth, this.maxChildren, this.maxDepth, this.periodicBounds);

        //bottom left
        this.nodes[Quadrant.BOTTOM_LEFT] = new Quadrant(
            new Bounds().initRectByOuterCoord(x1,xC,yC,y2),
            depth, this.maxChildren, this.maxDepth, this.periodicBounds);


        //bottom right
        this.nodes[Quadrant.BOTTOM_RIGHT] = new Quadrant(
            new Bounds().initRectByOuterCoord(xC,x2,yC,y2),
            depth, this.maxChildren, this.maxDepth, this.periodicBounds);

        //add all objects to the corresponding subnodes
        var i = 0;
        while (i < this.children.length) {
            var index = this.findSubquadrant(this.children[i]);
            if (index !== -1) {
                this.nodes[index].insert(this.children.splice(i, 1)[0]);
            } else {
                i = i + 1;
            }
        }

    };

    /*
     * Insert the object into the node. If the node
     * exceeds the capacity, it will subdivide and add all
     * objects to their corresponding subnodes.
     * @param Object pRect		bounds of the object to be added, with x, y, width, height
     */
    Quadrant.prototype.insert = function( item ) {

        var i = 0;
        var index;

        //if we have subnodes ...
        if( this.nodes.length ) {
            index = this.findSubquadrant( item );

            if( index !== -1 ) {
                this.nodes[index].insert( item );
                return;
            }
        }

        this.children.push(item);

        //subdivide if we don't already have subnodes
        if (!this.nodes.length && this.children.length > this.maxChildren && this.depth < this.maxDepth) {
            this.subdivide();
        }
    };


    Quadrant.prototype.remove = function( item ) {

        var index;

        //if we have subnodes ...
        if( this.nodes.length ) {
            index = this.findSubquadrant( item );

            if( index !== -1 ) {
                this.nodes[index].remove( item );
                return;
            }
        }

        var i = this.children.indexOf( item );
        if (i == -1) {
            throw new Error("the item was not a children in the quadTree")
        }
        this.children.splice(i, 1);

    };



    Quadrant.prototype.getChildren = function()
    {
        return this.children;
    };

    Quadrant.prototype.retrieve = function(item, preCollisionCheck)
    {

        // TODO: Retrieval of entities in a certain request area is as follows:
        // 1. calculate grid-aligned-outer-rectangle of request-area.
        // 2. from quad-tree retrieve all candidate entities (here only grid-aligned-outer-rectangles are considered).
        // the quad-tree sub-node selection considers only the grid-aligned-outer-rectangle of the request area.
        // within the nested for loops in the quad-tree-nodes already check the candidates for:
        //  3. check the candidates for real rectangle overlap (here only collisions of grid-aligned-outer-rectangles are considered).
        //  4. check the remaining candidates while considering circle radii and orientation of rectangles.
        // each quad-tree-node.retrieve() will only return the real collisions...

        var out = [];
        out.length = 0;
        if(this.nodes.length)
        {
            var indices = this.findAllCollidingQuadrants(item);
            for (var i=indices.length-1; i>=0; i--) {
                out = out.concat(this.nodes[indices[i]].retrieve(item, preCollisionCheck));
            }
        }

        for (var i=this.children.length-1; i>=0; i--) {

            if (preCollisionCheck != null) {
                if (!preCollisionCheck(this.children[i])) {
                    continue;
                }
            }

            if (this.children[i].isColliding(item, this.periodicBounds, preCollisionCheck)) {
                out = out.concat(this.children[i]);
            }
        }

        return out;
    };

    Quadrant.prototype.clear = function()
    {

        //array
        this.children.length = 0;

        var len = this.nodes.length;

        if(!len)
        {
            return;
        }

        for(var i = 0; i < len; i++)
        {
            this.nodes[i].clear();
        }

        //array
        this.nodes.length = 0;

    };


    exports.Bounds = Bounds;
    exports.QuadTreeCollision = QuadTreeCollision;

})(node ? exports : window);





var node = !(typeof exports === 'undefined');
if (node) {
}

(function (exports) {
    var MappingFunction = function (X,Y) {

       if (X.length == Y.length)  {
           this.init(X,Y);
       }
        else{
           //error
       }

    }

    MappingFunction.prototype = {

        init: function(X,Y) {
            this.x = x;
            this.y = y;
            this.Yval = null;

            this.getY = function(Xval)   {
                if (Xval >=0){

                    var index = this.x.indexOf(Xval);
                     // in case x is available
                     if (index != 'undefined')   {
                       Yval = this.y[index];
                     }
                    else{
                         // initialize search parameters
                         var found = false;
                         var idx = 0;
                         var last = 0;
                         var smallest = null;
                         // get left neighbour
                         while (found ==false)  {
                              var difference = this.x[idx] -Xval;
                              if (difference> 0){
                                       smallest = idx;
                                       found = true;
                               }
                              else {
                                   var last = difference;
                               }
                              idx++;
                         }

                         // interpolate
                         var Y_start = this.y[smallest];
                         var Y_end = this.y[smallest+1];
                         var gradient = Y_end - Y_start;
                         var factor = Xval - smallest;
                         Yval = Y_start + (factor *gradient);


                     }
                    return Yval;
                }
                else {
                    //error
                }
            }

        }

    }

    exports.MappingFunction=MappingFunction;

})(node ? exports : window);

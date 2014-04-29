//
// Sometimes when they set out to fix their own broken standards the ABG's just can't 
//    help themselves......   
//
// It seems the "canvas" tag's width and height *attributes* (those specified with the tag), and the
//    width and height in a CSS style applied to the tag ARE NOT THE SAME THING.
//
// The width and height *attributes* control the logical dimensions of the drawing surface within the canvas.
// The width and height in the CSS style, control the placement of the DIV-like box in the DOM that holds the 
//    drawing surface.
//
// If the tag attributes are ommited, the logical dimensions default to 300 x 100.
//
// This makes perfect sense that you have control over these two things seperately but
//   it sure would have been smarter to change the attribute names to something like "logical-width" or some other such name.
//
// Once again the ABG's have taken a corner-case and made it the default.
//
// If you specify CSS width/height but do not specify attribute width/height, you get a 300x100 drawing surface munged into the
//   intended rectanglar space.
//
// So, if we detect that the canvas tag lacks the width and height attribute, then we jam in the values that are found in the CSS.
//
//
(function fyCanvas(){}).subClass(fyUIViewControl,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(arguments);

            var $tag=thisProtected.$tag;
            var w=$tag.attr("width");
            if(!w)
              $tag.attr("width",$tag.width());

            var h=$tag.attr("height");
            if(!h)
              $tag.attr("height",$tag.height());

          });

          this.defineProperties(
            {
            canvas: {get:function(){return thisProtected.$tag[0];}}
            });
      });

  });

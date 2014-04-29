
(function fyUIViewControl(){}).subClass(
  function(application,$,isClass) {
    this.prototype.isContentPattern=false;
    this.prototype.isContentGrouping=false;

    this.initializeInstanceWith(
      function(application,$)  {
        var thisProtected;

        this.uiManager = application.uiManager;

        this.defineProtectedMethod(
          function installTag($tag) {
            if(!$tag) return;
            thisProtected.$tag=$tag;
            this.$domElement=$tag;
            if($tag.length>0)
              thisProtected.tag=$tag[0];
          });

        this.defineMethod(
          function insertContent($newTag) {
            if(!$newTag) return;
            if(thisProtected.$tag)
              thisProtected.$tag.append($newTag);
          });

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            thisProtected.beginConstruction();

            var $tag=arguments[0];
            var parentControl;
            var isChild=false;
            var isNewTag=false;

            if(arguments.length===0) {
              $tag=thisProtected.createEmptyTag();
              isNewTag=true;
            } else if(arguments.length===1) {
              parentControl=arguments[0];
              if(typeof parentControl==="object") {
                if(parentControl.isInstanceOf && (parentControl.isInstanceOf(fyUIViewContainer))) {
                  isChild=true;
                  $tag=thisProtected.createEmptyTag();
                  isNewTag=true;
                }
              }  
            } else {
              $tag=arguments[0];
            }

            thisProtected.installTag($tag);

            //
            // insertion into the parent can be complicated; allow a class to defer it
            //    and perform it at its convenience. 
            //
            if(isChild) {
              if(!thisProtected.deferredInsert)
                parentControl.insertControl(this);
              if(isNewTag)
                parentControl.insertContent($tag);
            }

            thisProtected.endConstruction();
          });


        this.defineProtectedMethod(
          function createEmptyTag() {
            //return;
//            return $("<div>");
          });
          

        this.defineConstructor(
          function CreateExistingTag(parentControl, $currentElement, propertyDefinitions) {
            thisProtected = this.protectedData;

            thisProtected.beginConstruction();
            this.Create($currentElement);
            thisProtected.installProperties(propertyDefinitions);

            if(parentControl)
              parentControl.insertControl(this);
            
            thisProtected.endConstruction();
          });

        this.defineConstructor(
          function CreateReplaceTag(parentControl) {
            thisProtected = this.protectedData;
            thisProtected.beginConstruction();

            if(parentControl)
              parentControl.insertControl(this);

            thisProtected.endConstruction();
          });

        ////////////////

        this.defineProtectedMethod(
          function beginConstruction() {
            if(!thisProtected) {
                if(!(thisProtected=this.protectedData)) return;
              }

            if(!thisProtected.whenConstructionComplete) {
              thisProtected.whenConstructionComplete=$.Deferred();
              thisProtected.constructionLevelCount=0;
            }
            thisProtected.constructionLevelCount++;
          });
        
        this.defineProtectedMethod(
          function endConstruction() {
            if((--thisProtected.constructionLevelCount)<=0) {

              thisProtected.whenConstructionComplete.resolveWith(this);
              delete thisProtected.whenConstructionComplete;
              delete thisProtected.constructionLevelCount;
            }
          });

        this.defineProtectedMethod(
          function installProperties(propertyDefinitions) {
            if(!propertyDefinitions) return;

            var property;
            for(property in propertyDefinitions)  {
              if(propertyDefinitions.hasOwnProperty(property)) {
                this.changeProperty(property,propertyDefinitions[property]);
              }
            }


          });

        this.defineMethod(
          function changeProperty(name,value) {
            thisProtected.whenConstructionComplete.then(
              function() { 
                this[name]=value; 
              });

          });

        ////////////////

        this.defineProperties({
          name:{
            get: function(){return thisProtected.tag.id;},
            set: function(value){thisProtected.tag.id=value;}
            },
          id:{
            get: function(){return thisProtected.tag.id;},
            set: function(value){thisProtected.tag.id=value;}
            },
          visible:{
            //
            // DOM visibility is something different than fyControl visibility
            //
            //    fyControl.visible  ===  DOM hidden
            //
            get: function(){return (!thisProtected.isHidden);},
            set: 
              function(value)
              {
              if((!value)===thisProtected.isHidden) return;

              thisProtected.isHidden=!value;
              var ani=thisProtected.visibilityAnimation;
              if(value)
                {
                if(ani)
                  {
                  thisProtected.$tag.css("opacity",0);
                  thisProtected.$tag.show();
                  ani.run.forward();
                  }
                else
                  thisProtected.$tag.show(); 
                }
              else
                {
                if(ani) {
                    ani.run.reverse.then(function(){thisProtected.$tag.hide();});
                  }
                else {
                    thisProtected.$tag.hide();
                  }

                }
              }
            },
          visibilityAnimation:{
            get:
              function() {
                return(thisProtected.visibilityAnimation=this.animate);
              },
            set:
              function(value) {
                thisProtected.visibilityAnimation=value;
              }
            },
          $domTag:{
            get: function(){return thisProtected.$tag;}
            },
          parent:{
            get: function(){return thisProtected.parent;},
            set: function(value) {
              thisProtected.parent=value;
              if(value && thisProtected.alignment)
                this.align=thisProtected.alignment;
            }},
          animate:{
            get: function(){return application.uiManager.newAnimation(this);}
            }
          });

        this.defineVirtualProperties(
          {
          align:
            {
            get:
              function()
              {
              return ((!thisProtected.alignment) || (thisProtected.alignment==="")) ? "none" : thisProtected.alignment;
              },
            set:
              function(value)
              {
              if((!thisProtected.parent) || (!thisProtected.parent.alignChild)) {
                thisProtected.alignment=value;
                return;
              } 

              thisProtected.alignment=thisProtected.parent.alignChild(this,value,thisProtected.alignment);
              }
            },
          cssPosition:
            {
            get:
              function()
              {
              var l,t;
              if(isNaN(l=parseFloat(thisProtected.$tag.css("left")))) l=0;
              if(isNaN(t=parseFloat(thisProtected.$tag.css("top")))) t=0;
              return {x:l,y:t};
              }
            },
          position:
            {
            get: 
              function()
              {
              var pos=thisProtected.$tag.specPosition;
              if(!pos)
                {
                if(thisProtected.$tag[0].offsetParent) 
                  {
                  var $pos=thisProtected.$tag.position();
                  pos={x:$pos.left,y:$pos.top};
                  }
                else 
                  pos=this.cssPosition;

                //thisProtected.$tag.specPosition=pos;
                }
              return {x:pos.x,y:pos.y};
              },
            set:
              function(value)  
              {
              if(!value) return;

              var thisPos=thisProtected.$tag.specPosition;
              if(!thisPos)
                {
                var $pos=thisProtected.$tag.position();
                thisPos={x:$pos.left,y:$pos.top};
                }

              if(value.hasOwnProperty('x'))
                {
                thisProtected.$tag.css({left: value.x});
                thisPos.x=value.x;
                }

              if(value.hasOwnProperty('y'))
                {
                thisProtected.$tag.css({top: value.y});
                thisPos.y=value.y;
                }
              thisProtected.$tag.specPosition=thisPos;

              thisProtected.$tag.css('position','absolute');

              }
            },
          width:
            {
            get: function(){
              return thisProtected.$tag.width() || thisProtected.widthOfChildren();
            },
            set: function(value){
              thisProtected.$tag.width(value);this.onResized();
            }},
          height:
            {
            get: function(){
              return thisProtected.$tag.height() || thisProtected.heightOfChildren();
            },
            set: function(value){
              thisProtected.$tag.height(value);this.onResized();
            }},
          dimensions:
            {
            get: function(){return {width:thisProtected.$tag.width(),height:thisProtected.$tag.height()}},
            set:
              function(value)  
              {
              if(!value) return;
              var changed=false;

              if(value.hasOwnProperty('width'))
                {
                thisProtected.$tag.width(value.width);
                changed=true;
                }

              if(value.hasOwnProperty('height'))
                {
                thisProtected.$tag.height(value.height);
                changed=true;
                }

              if(changed)
                this.onResized();
              }  

            },
          opacity:
            {
            get: function(){return parseFloat(thisProtected.$tag.css("opacity"));},
            set: function(value){thisProtected.$tag.css("opacity",value);}
            },
          zIndex:
            {
            get: function(){return thisProtected.$tag.css("z-index");},
            set: 
              function(value) {
                var t=thisProtected.$tag;
                if(t.css("position")==="static")
                  t.css("position","absolute");

                t.css("z-index",value);
              }
            },
          background:
            {
            set: function(value){thisProtected.$tag.css("background",value);}
            },  
          clipChildren:
            {
            get: function(){return thisProtected.$tag.css("overflow")==="hidden";},
            set: function(value){thisProtected.$tag.css("overflow","hidden");}
            }
          });

        this.defineProtectedMethod(
          function widthOfChildren() {
            return 0;
          });

        this.defineProtectedMethod(
          function heightOfChildren() {
            return 0;
          });

        this.defineMethod(
          function getDOMtag() {
            return thisProtected.$tag;
          });

        this.defineMethod(
          function addClass(add) {
            thisProtected.$tag.addClass(add);
            return thisProtected.$tag;
          });

        this.defineMethod(
          function removeClass(del) {
            thisProtected.$tag.removeClass(del);
            return thisProtected.$tag;
          });

        this.defineMethod(
          function changeClasses(add,del) {
            thisProtected.$tag.addClass(add);
            thisProtected.$tag.removeClass(del);
            return thisProtected.$tag;
          });

        ////////////////////////////////////////////////////////////////////////////////
        //
        // Compute the effective position of a control within a heirachary of controls
        //
        this.defineMethod(
          function relativeOffsetOf(innerControl) {

            if(innerControl===this) 
              return this.position;
            
          });

        this.defineMethod(
          function isParentOf(aControl) {

            return false;

          });

        this.defineMethod(
          function commonParentOf(otherControl) {

            var p;
            if(!(p=this.parent)) return;

            while(p) {
              if(p.isParentOf(otherControl)) return p;
              p=p.parent;
            }

            return;
          });

        ////////////////////////////////////////////////////////////////////////////////
        //
        // Determine the position of "outerControl" as if it had the same immediate parent
        //     as "this" control.
        //
        // Useful for animation location computations;  
        //  i.e. "this" is going to be animated using location(s) relative to 
        //     "outerControl"s location(s)
        //
        this.defineMethod(
          function positionRelativeTo(outerControl) {

            var result=this.position;

            if(!outerControl) return result;

            var commonParent;
            if(!(commonParent=this.commonParentOf(outerControl))) return result;

            var thisOffset=commonParent.relativeOffsetOf(this);
            var outerOffset=commonParent.relativeOffsetOf(outerControl);

            result.x += (outerOffset.x - thisOffset.x);
            result.y += (outerOffset.y - thisOffset.y);

            return result;
          });

        ////////////////////////////////////////////////////////////////////////////////
        //
        // Determine the translated, inner position of a point within "this" relative to 
        //   a contained "inner" control.
        //
        // That is, compute "localPosition" relative to "innerControl"s immediate parent.
        //
        this.defineMethod(
          function positionLocalTo(localPosition, innerControl) {

            var innerPosition=innerControl.position;

            var relativeInnerPosition=this.relativeOffsetOf(innerControl);
            return  {x: (innerPosition.x + (localPosition.x - relativeInnerPosition.x)),
                     y: (innerPosition.y + (localPosition.y - relativeInnerPosition.y))};

          });


        ////////////////////////////////////////////////////////////////////////////////

        this.defineMethod(
          function on() {
            return thisProtected.$tag.on.apply(thisProtected.$tag,arguments);
          });

        this.defineMethod(
          function off() {
            return thisProtected.$tag.off.apply(thisProtected.$tag,arguments);
          });

        this.defineMethod(
          function onResized() {
          
          });

        this.defineMethod(
          function onClick(clickMethod) {
            if(this.isClass) return false;

            if(!clickMethod.ownerInstance)
              this.defineMethod(clickMethod);

            this.uiManager.onClick(clickMethod,this,'click',this.getDOMtag);
          });

      });

  });

/////////////////////////////////////////////////////////////////////////////////////////

(function fyLabel(){}).subClass(fyUIViewControl,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(arguments);

          });

        this.defineProtectedMethod(
          function createEmptyTag()  {
            return $("<div>");
          });

        this.defineProperties({
          caption:{
            get:function(value){return thisProtected.$tag.html();},
            set:function(value){thisProtected.$tag.html(value);}
            },
          text:{
            get:function(value){return this.caption;},
            set:function(value){this.caption=value;}
            }
          });

      });
  });

/////////////////////////////////////////////////////////////////////////////////////////

(function fyRectangle(){}).subClass(fyUIViewControl,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(arguments);
          });

        this.defineProtectedMethod(
          function createEmptyTag()  {
            return $("<div>");
          });

      });
  });

/////////////////////////////////////////////////////////////////////////////////////////

(function fyImage(){}).subClass(fyUIViewControl,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {

        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            
            var args;
            var imageSrc="";
            if(typeof arguments[0]==="string") {
              imageSrc=arguments[0];
              args=shiftArguments(arguments,1);
            } else
              args=shiftArguments(arguments,0);

            this.inherited(args);

            if(imageSrc!=="")
              this.src=imageSrc;  
          });

        this.defineProtectedMethod(
          function createEmptyTag()  {
            return $("<img>");
          });


    	  this.defineProperties(
    	    {
          src:
            {
            get:function(){return thisProtected.tag.src;},
            set:function(value){thisProtected.tag.src=value;}
            },
          image:
            {
            set:
              function(value)
              {
              if(typeof value==="string")
                thisProtected.tag.src=value;
              else
                thisProtected.tag.src=value.src;
              }
            }
          });

        this.defineVirtualProperties(
          {
          width:
            {
            get: function(){return thisProtected.tag.width;}
            },
          height:
            {
            get: function(){return thisProtected.tag.height;}
            }
    	    });

      });

  });


/////////////////////////////////////////////////////////////////////////////////////////


(function fyButton(){}).subClass(fyUIViewControl,
  function(application,$,isClass)  {

    this.initializeInstanceWith(
      function(application,$)  {
        var thisProtected;

        this.defineConstructor(
          function Create()  {
            thisProtected=this.protectedData;
            this.inherited(arguments);

            thisProtected.isEnabled=true;
          });


        this.defineProtectedMethod(
          function createEmptyTag()  {
            return $("<button>");
          });

    	  this.defineProperties({
            caption: {
              set:function(value){thisProtected.$tag.html(value);}
            },

            enabledCSSclass: {
              set:function(value){thisProtected.enabledCSSClass=value;}
            },

            disabledCSSclass: {
              set:function(value){thisProtected.disabledCSSClass=value;}
            },

            enabled: {
              get:function(){return thisProtected.isEnabled;},
              set:
                function(value) {
                  var t=thisProtected.$tag;
                  if(thisProtected.isEnabled=value) {
                    t.addClass(thisProtected.enabledCSSClass);
                    t.removeClass(thisProtected.disabledCSSClass);
                  } else {
                    t.addClass(thisProtected.disabledCSSClass);
                    t.removeClass(thisProtected.enabledCSSClass);
                  }

                }
            }

    	    });

      });

  });


/////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyUIViewContainer(){}).subClass(fyUIViewControl,
  function(application,$,isClass)  {

    this.defineClassProperties({
//      domElementPropertyDefiners:{value:domElementPropertyDefiners},
//      framePropertyDefiners:{value:framePropertyDefiners},
//      buttonPropertyDefiners:{value:buttonPropertyDefiners},
//      imagePropertyDefiners:{value:imagePropertyDefiners},

        tagControls: {
          value: {
            IMG:window.fyImage,
            BUTTON:window.fyButton,
            CANVAS:window.fyCanvas
          }
        }
      });


    this.initializeInstanceWith(
      function(application,$)  {
        var thisPrivate;
        var thisProtected;

        var domElementConstructed=$.Deferred();

        this.defineConstructor(
          function Create() {
            thisPrivate = this.privateData;
            thisProtected = this.protectedData;
            this.inherited(arguments);

            thisProtected.children=[];
          });

        this.defineMethod(
          function referenceControl(newControl)  {
            if(newControl.name!=="") {
              this[newControl.name]=newControl;
            }
          });

        this.defineMethod(
          function insertControl(newControl)  {

            this.referenceControl(newControl);

            // !! record child first, then parent...the child might call the parent immediately
            if(thisProtected.children.indexOf(newControl)===-1) {
              thisProtected.children.push(newControl);
              thisProtected.haveChildrenWidth=false;
              thisProtected.haveChildrenHeight=false;
            }
            newControl.parent=this;
          });

        this.defineMethod(
          function addControl($domElement,newControl)  {
            if($domElement)
              $domElement.append(newControl.$domTag);

            this.insertControl(newControl);
          });

        this.defineMethod(
          function insertContent($newTag) {
            if(!$newTag) return;
            if(this.$domElementContents)
              this.$domElementContents.append($newTag);
          });

        this.defineMethod(
          function parsePropertyDefinitions(elementProperties, $domElement)  {

            var elementProperty;
            for(elementProperty in elementProperties)  {
              if(elementProperties.hasOwnProperty(elementProperty)) {
                var propertyValue=elementProperties[elementProperty];
                this.changeProperty(elementProperty, propertyValue)
              }
            }
          });

        this.defineMethod(
          function domElementReady(appendIt,beforeAppend)    {
            thisProtected.installTag.call(this,this.$domElement);
            if(beforeAppend)
              beforeAppend.call(this);

            if(appendIt) {
              var target=$(this.domTargetSelector);
              target.append(this.$domElement);
            }


              function wireupDOM(instance,$domTag)  {
                var id;

                $domTag.children().each(
                  function() {
                    var $this=$(this);
                    id=this.id;

                    if((id)&&(id!=="")) {

                      if(!instance.hasOwnProperty(id)) {

                        var tagClass,
                            tagInstanceProperties,
                            tagClassName=fyClassAttr($this),
                            tagInstanceName=fyInstanceAttr($this);

                        if((typeof tagInstanceName==="string") && (tagInstanceName.length>0)) {

                          var colon;
                          if((colon=tagInstanceName.indexOf(":"))>0) {
                            var propertyDefs=tagInstanceName.substr(colon+1);
                            tagInstanceName=tagInstanceName.substr(0,colon);
                            if(propertyDefs.length>0) {
                              try {
                                tagInstanceProperties=new Function("return "+propertyDefs)();
                              }
                              catch(e) {

                              }
                            }
                          }

                          tagClass=window[tagInstanceName];

                          if(tagClass) {

                            var newInstance;
                            if(tagClass.isContentPattern) {

                              newInstance=tagClass.CreateReplaceTag(instance, $this, tagInstanceProperties);

                            } else {

                              newInstance=tagClass.CreateExistingTag(instance, $this, tagInstanceProperties);

                              //if(newInstance.isContentGrouping)
                              //  wireupDOM(instance, $this);
                              if(newInstance.isContentGrouping)
                                wireupDOM(newInstance, $this);
                            }

                            instance[id]=newInstance;
                          } else {

//var xx=1;
                            throw 'Unknown Fyla class "'+tagInstanceName+'" while setting-up instance of '+thisProtected.instance._className;

                          }

                        } else if((typeof tagClassName==="string") && (tagClassName.length>0)) {

                          tagClass=window[tagClassName];

                          if(tagClass)
                            instance[id]=tagClass.CreateExistingTag(instance, $this);

                        } else if(instance.tagControls.hasOwnProperty(this.tagName)) {

                          if(tagClass=instance.tagControls[this.tagName])
                            instance[id]=tagClass.CreateExistingTag(instance, $this);

                        } else {

                          instance["$"+id]=$this;
                          wireupDOM(instance, $this);

                        }
                      }
                    } else {
                      wireupDOM(instance, $this);
                    }

                  }
                );
              }

            wireupDOM(this, this.$domElementContents);
            this.domElementFinished();
            //domElementConstructed.resolve();
          });

        this.defineMethod(
          function domElementFinished()    {

            domElementConstructed.resolve();
          });

        this.defineProtectedMethod(
          function widthOfChildren() {
            if(!thisProtected.haveChildrenWidth) {
              var w=thisProtected.$tag.width();
              var child,childWidth;

              for(var i=0,j=thisProtected.children.length;i<j;i++) {
                child=thisProtected.children[i];
                childWidth=child.position.x+child.width;
                if (childWidth > w)
                  w=childWidth;
              }

              thisProtected.childrenWidth=w;
              thisProtected.haveChildrenWidth=true;
            }

            return thisProtected.childrenWidth;
          });

        this.defineProtectedMethod(
          function heightOfChildren() {
            if(!thisProtected.haveChildrenHeight) {
              var h=thisProtected.$tag.height();
              var child,childHeight;

              for(var i=0,j=thisProtected.children.length;i<j;i++) {
                child=thisProtected.children[i];
                childHeight=child.position.y+child.height;
                if (childHeight > h)
                  h=childHeight;
              }

              thisProtected.childrenHeight=h;
              thisProtected.haveChildrenHeight=true;
            }

            return thisProtected.childrenHeight;
          });

        this.defineMethod(
          function getDOMelement()  {
            return this.$domElement;
          });

        this.defineMethod(
          function onElementEvent(eventMethod,targetEvent) {
            if(this.isClass) return false;
            this.uiManager.onElementEvent(eventMethod,this,targetEvent,this.getDOMelement,domElementConstructed);
          });

        this.defineMethod(
          function onClick(clickMethod)  {
            if(this.isClass) return false;

            if(!clickMethod.ownerInstance)
              this.defineMethod(clickMethod);

            this.uiManager.onClick(clickMethod,this,this.getDOMelement,domElementConstructed);
          });

        this.defineMethod(
          function onDblClick(clickMethod)  {
            if(this.isClass) return false;

            if(!clickMethod.ownerInstance)
              this.defineMethod(clickMethod);
            
            this.uiManager.onDblClick(clickMethod,this,this.getDOMelement,domElementConstructed);
          });

        this.defineMethod(
          function onRadioButtonsChange(changeMethod) {
            if(this.isClass) return false;
            this.uiManager.onRadioButtonsChange(changeMethod,this,this.getDOMelement,domElementConstructed);
          });


        this.defineMethod(
          function onResized() {
            thisProtected.realignChildren();
          });

        this.defineProtectedMethod(
          function realignChildren() {

            var alignmentLayout;
            if(!(alignmentLayout=thisProtected.alignmentLayout)) return;

            var frame=this;
            var clientArea={xt:0,yt:0,xb:this.width-1,yb:this.height-1,w:this.width,h:this.height};
            var children;

            if(children=alignmentLayout.top) {
              var top=clientArea.yt;
              var height=clientArea.h;
              children.forEach(function(control, index) {

                control.position={x:clientArea.xt,y:top};
                control.width=clientArea.w;
                top+=control.height;
                height-=control.height;

              });

              clientArea.yt=top;
              clientArea.h=height;
            }

            if(children=alignmentLayout.bottom) {
              var bottom=clientArea.yb;
              var height=clientArea.h;

              children.forEach(function(control, index) {
                control.position={x:clientArea.xt,y:(bottom-control.height)+1};
                control.width=clientArea.w;
                bottom-=control.height;
                height-=control.height;
              });

              clientArea.yb=bottom;
              clientArea.h=height;
            }

            if(children=alignmentLayout.left) {
              var left=clientArea.xt;
              var width=clientArea.w;
              children.forEach(function(control, index) {
                control.position={x:left,y:clientArea.yt};
                control.height=clientArea.h;
                left+=control.width;
                width-=control.width;
              });
              clientArea.xt=left;
              clientArea.w=width;
            }

            if(children=alignmentLayout.right) {
              var right=clientArea.xb;
              var width=clientArea.w;
              children.forEach(function(control, index) {
                control.position={x:(right-control.width)+1,y:clientArea.yt};
                control.height=clientArea.h;
                right-=control.width;
                width-=control.width;

              });
              clientArea.xb=right;
              clientArea.w=width;
            }

            if(children=alignmentLayout.client) {
              children.forEach(function(control, index) {
                control.position={x:clientArea.xt,y:clientArea.yt};
                control.width=clientArea.w;
                control.height=clientArea.h;
              });
            }

            if(children=alignmentLayout.horizontal) {
              children.forEach(function(control, index) {
                control.position={x:0};
                control.width=frame.width;
              });
            }

            if(children=alignmentLayout.vertical) {
              children.forEach(function(control, index) {
                control.position={y:0};
                control.height=frame.height;
              });
            }

            if(children=alignmentLayout.center) {
              var cx=Math.floor(clientArea.w/2);
              var cy=Math.floor(clientArea.h/2);
              children.forEach(function(control, index) {
                control.position={x:(cx-Math.floor(control.width/2)),y:(cy-Math.floor(control.height/2))};
              });
            }

          });

        this.defineMethod(
          function alignChild(child,newAlignment,oldAlignment) {

            if(thisProtected.children.indexOf(child)===-1) return "";

            if(! /(\W|^)(none|left|right|top|bottom|client|horizontal|vertical|center)(\W|$)/.test(newAlignment)) return "";

            var alignmentLayout= thisProtected.alignmentLayout || (thisProtected.alignmentLayout={});

            var recalc=false;
            var oldChildren,newChildren;
            var alignedChildren= alignmentLayout.alignedChildren || (alignmentLayout.alignedChildren=[]);
            if(alignedChildren.indexOf(child)!== -1) {
              if(oldChildren=alignmentLayout[oldAlignment])  {
                if(oldChildren.indexOf(child)!== -1)  {
                  oldChildren.remove(child);
                  recalc=true;
                }
              }
            }

            if(newAlignment!=="none") {
              recalc=true;
              newChildren=alignmentLayout[newAlignment] || (alignmentLayout[newAlignment]=[]);
              newChildren.push(child);
              alignedChildren.push(child);
            } else
              newAlignment="";

            if(recalc) thisProtected.realignChildren();

            return newAlignment;
          });

        ////////////////////////////////////////////////////////////////////////////////
        //
        // Compute the effective position of a control within a heirachary of controls
        //
        this.defineMethod(
          function relativeOffsetOf(innerControl) {

            if(innerControl===this) 
              return this.position;

            var childPos;
            for(var i=0,j=thisProtected.children.length;i<j;i++) {
              if (childPos=thisProtected.children[i].relativeOffsetOf(innerControl)) break;
            }

            if(childPos) {
              var p=this.position;
              childPos.x+=p.x;
              childPos.y+=p.y;
            }

            return childPos;
          });

        this.defineMethod(
          function isParentOf(aControl) {

            if(thisProtected.children.indexOf(aControl)!== -1) return true;

            for(var i=0,j=thisProtected.children.length;i<j;i++) {
              if (thisProtected.children[i].isParentOf(aControl)) return true;
            }

            return false;

          });

      });

  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyPanel(){}).subClass(fyUIViewContainer,
  function(application,$,isClass)    {

    this.prototype.isContentGrouping=true;

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(arguments);

            this.domElementFinished();
          });

        this.defineProtectedMethod(
          function createEmptyTag()  {
            return $("<div>");
          });
          
        this.defineMethod(
          function referenceControl(newControl)  {

            if(this.parent) this.parent.referenceControl(newControl);

          });

      });

  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyUIFrameContainer(){}).subClass(fyUIViewContainer,
  function(application,$,isClass)    {

    this.prototype.isContentPattern=true;

    this.onClassInitialize(
      function(application,$)    {

        if(this.moduleLoader) {

        //var $classContent=this.moduleLoader.$moduleContent.find("[app-ui-class='"+this._className+"']");
          var $classContent=this.moduleLoader.$moduleContent.find(

             "[app-ui-class='"+this._className+"'],"
            +"[fy-class='"+this._className+"']"

            );



          if($classContent.length===0)
            $classContent=this.moduleLoader.$moduleContent.clone()
          else {
            var $parent=$classContent.parent();
            if( ($parent.length!==0) && ($parent[0].nodeName.toLowerCase()!=="module" ) )
              $classContent=$parent
            else
              $classContent=$('<module>').append($classContent);
          }

          this.prototype.$moduleContent=$classContent;
        }

      });


    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineMethod(
          function buildContent(propertyDefinitions, moduleElementSelector, $currentContents) {
            if(!moduleElementSelector)
            //moduleElementSelector="[app-ui-class='"+this._className+"']";
              moduleElementSelector=
                "[app-ui-class='"+this._className+"'],"+
                "[fy-class='"+this._className+"']";

            var $contentSource;
            if(this.$moduleContent)
              $contentSource=this.$moduleContent;
            else
              $contentSource=$(document);

            var $aDOMelement;
            if( ($aDOMelement=$contentSource.find(moduleElementSelector).clone()).length===0 )
              $aDOMelement=$();

            if($aDOMelement.length===0) {
              if($currentContents && ($currentContents.length!==0))
                $aDOMElement=$currentContents
              else
                $aDOMelement=$('<div>');
            }


            if(propertyDefinitions)
              this.parsePropertyDefinitions(propertyDefinitions, $aDOMelement);

            return $aDOMelement;
          });


        this.defineMethod(
          function constructFrame(/* [special-construction-method,] targetElementSelector, propertyDefinitions, moduleElementSelector */) {

            var args;
            var method;

            var $aDOMelement;
            var propertyDefinitions;

            var parentControl;
            var $currentElement;

            if(typeof arguments[0]==="number") {
              method=arguments[0];
              args=Array.prototype.slice.call(arguments,1);
            } else {

              args=Array.prototype.slice.call(arguments);
              method=0
            }


            if(method===0) {                                                          //  === "new"
            
              var targetElementSelector, moduleElementSelector;

              if(args.length>2)
                {
                targetElementSelector=args[0];
                propertyDefinitions=args[1];
                moduleElementSelector=args[2];
                }
              else if(args.length===2)
                {
                targetElementSelector=args[0];
                if((typeof args[1]==="object")&&(!(args[1] instanceof jQuery)))
                  propertyDefinitions=args[1];
                else
                  moduleElementSelector=args[1];
                }
              else if(args.length===1)
                {
                targetElementSelector=args[0];
                }

              if(typeof targetElementSelector==="object")
                {
                if(targetElementSelector.isInstanceOf && (targetElementSelector.isInstanceOf(fyUIViewContainer)))
                  {
                  parentControl=targetElementSelector;
                  targetElementSelector=targetElementSelector.$domElementContents;
                  }
                else if(!(targetElementSelector instanceof jQuery))
                  targetElementSelector=undefined;
                }

              if(!targetElementSelector)
                targetElementSelector="body";

              this.domTargetSelector=targetElementSelector;

              $aDOMelement=this.buildContent(propertyDefinitions, moduleElementSelector);

              this.$domElement=$aDOMelement;

              $aDOMelement.wrapInner('<div class="ui-FrameControl">'); // so inserted elements will use absolute position relative to (0,0)
              this.$domElementContents=$aDOMelement.contents();

              this.domElementReady(true,
                function(){
                  if(parentControl)
                    parentControl.insertControl(this);
                });


            } else if(method===1) {                                  //     ==="exist"

              parentControl=args[0];
              $currentElement=args[1];

              this.$domElement=$currentElement;

              $currentElement.wrapInner('<div class="ui-frameControl">');
              this.$domElementContents=$currentElement.contents();

              if(propertyDefinitions)
                this.parsePropertyDefinitions(propertyDefinitions, $currentElement);

              this.domElementReady(false);

              if(parentControl)
                parentControl.insertControl(this);

            } else {                                                 // ==="replace"

              parentControl=args[0];
              $currentElement=args[1];
              propertyDefinitions=args[2];

              $aDOMelement=this.buildContent();

              $aDOMelement.wrapInner('<div class="ui-frameControl">'); // so inserted elements will use absolute position relative to (0,0)
              this.$domElementContents=$aDOMelement.contents();
              this.$domElementContents.append($currentElement.contents());

              $currentElement.addClass($aDOMelement[0].className);
              $currentElement.append(this.$domElementContents);

              this.$domElement=$currentElement;

              if(propertyDefinitions)
                this.parsePropertyDefinitions(propertyDefinitions, $currentElement);

              this.domElementReady(true,
                function(){
                  if(parentControl)
                    parentControl.insertControl(this);
                });

            }

            return this;
          });

        this.defineConstructor(
          function Create(/* targetElementSelector, propertyDefinitions, moduleElementSelector */) {
            thisProtected=this.protectedData;
            thisProtected.deferredInsert=true;
            this.inherited(arguments);	

            thisProtected.deferredInsert=false;
            this.constructFrame.apply(this, arguments);

          });


        this.defineConstructor(
          function CreateExistingTag(/*  parentControl, $currentElement, propertyDefinitions  */) {
            thisProtected=this.protectedData;

            // not inherited !!!
            this.Create.apply(this, prefixArguments(1,arguments));

          });


        this.defineConstructor(
          function CreateReplaceTag(/*  parentControl, $currentElement, propertyDefinitions  */) {
            thisProtected=this.protectedData;

            // not inherited !!!
            this.Create.apply(this, prefixArguments(2,arguments));

          });

      });

  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyFrame(){}).subClass(fyUIFrameContainer,
  function(application,$,isClass)
  {

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create()
      {
      thisProtected=this.protectedData;
      this.inherited(arguments);


      });


    });

  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyFramePager(){}).subClass(fyUIFrameContainer,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {
        var thisPrivate;
        var thisProtected;
        var ulCorner={x:0,y:0};

        this.defineConstructor(
          function Create() {
            thisPrivate=this.privateData;
            thisProtected=this.protectedData;

            thisProtected.beginConstruction();

            this.inherited(arguments);

            thisProtected.selectedPageIndex=0;
            thisProtected.wrapAround=true;

            this.pageTransition="flip";
            this.pageChangeOnSwipe="leftright";

            this.clipChildren=true;

            thisProtected.endConstruction();
          });

        this.defineMethod(
          function insertControl(newControl) {

            if(thisProtected.children.length>0)
              newControl.visible=false;
            else {
              newControl.visible=true;
              thisProtected.selectedPage=newControl;
            }

            this.inherited(newControl);

            newControl.position=ulCorner;
            newControl.dimensions=this.dimensions;
            newControl.zIndex=1;

            if(thisProtected.adjustPageChange) {
              thisProtected.adjustPageChange(newControl);
              this.wirePageSwipe(newControl);
            }

          });

        ///////////

        this.defineProperties(
          {
          pageChangeOnSwipe:
            {
            get: function(){return thisProtected.swipePageChange;},
            set:
              function(value)
              {
              if(typeof value==="string")
                thisProtected.swipePageChange=value.toLowerCase()
              else
                thisProtected.swipePageChange=false;

              for(var i=0,j=thisProtected.children.length;i<j;i++)
                this.wirePageSwipe(thisProtected.children[i]);
              }
            },
          pageTransition:
            {
            get: function(){return thisProtected.pageTransition;},
            set:
              function(value)
              {
              var trans;
              var time=0.25;
              if(typeof value==="object")
                {
                if(value.hasOwnProperty("action"))
                  trans=value.action
                else
                  trans="flip";
                if(value.hasOwnProperty("duration"))
                  time=value.duration;
                }
              else
                {
                trans=value;
                
                }

              switch(trans.toLowerCase())
                {
                case "fade":
                  thisProtected.adjustPageChange=this.adjustPageChange_fade;
                  thisProtected.changeNextPage  =this.changePage_fade;
                  thisProtected.changePriorPage =this.changePage_fade;
                  break;
                case "push":
                case "swipe":
                case "pushleft":
                  thisProtected.adjustPageChange=this.adjustPageChange_pushHorz;
                  thisProtected.changeNextPage  =this.changePage_pushLeft;
                  thisProtected.changePriorPage =this.changePage_pushRight;
                  break;
                case "pushright":
                  thisProtected.adjustPageChange=this.adjustPageChange_pushHorz;
                  thisProtected.changeNextPage  =this.changePage_pushRight;
                  thisProtected.changePriorPage =this.changePage_pushLeft;
                  break;
                case "pushup":
                  thisProtected.adjustPageChange=this.adjustPageChange_pushVert;
                  thisProtected.changeNextPage  =this.changePage_pushUp;
                  thisProtected.changePriorPage =this.changePage_pushDown;
                  break;
                case "pushdown":
                  thisProtected.adjustPageChange=this.adjustPageChange_pushVert;
                  thisProtected.changeNextPage  =this.changePage_pushDown;
                  thisProtected.changePriorPage =this.changePage_pushUp;
                  break;
                case "slide":
                case "slideleft":
                  thisProtected.adjustPageChange=this.adjustPageChange_slideHorz;
                  thisProtected.changeNextPage  =this.changePage_slideLeft;
                  thisProtected.changePriorPage =this.changePage_slideRight;
                  break;
                case "slideright":
                  thisProtected.adjustPageChange=this.adjustPageChange_slideHorz;
                  thisProtected.changeNextPage  =this.changePage_slideRight;
                  thisProtected.changePriorPage =this.changePage_slideLeft;
                  break;
                case "slideup":
                  thisProtected.adjustPageChange=this.adjustPageChange_slideVert;
                  thisProtected.changeNextPage  =this.changePage_slideUp;
                  thisProtected.changePriorPage =this.changePage_slideDown;
                  break;
                case "slidedown":
                  thisProtected.adjustPageChange=this.adjustPageChange_slideVert;
                  thisProtected.changeNextPage  =this.changePage_slideDown;
                  thisProtected.changePriorPage =this.changePage_slideUp;
                  break;
                default:
                  thisProtected.adjustPageChange=this.adjustPageChange_flip;
                  thisProtected.changeNextPage  =this.changePage_flip;
                  thisProtected.changePriorPage =this.changePage_flip;
                  trans="flip";
                }

              thisProtected.pageTransition=trans;
              thisProtected.pageTransitionTime=time;

              for(var i=0,j=thisProtected.children.length;i<j;i++)
                thisProtected.adjustPageChange.call(this,thisProtected.children[i],time);
              }
            }

          });

        ///////////

        this.defineMethod(
          function changePage_flip(oldPage,newPage) {
            if(oldPage) oldPage.visible=false;

            newPage.position=ulCorner;
            (thisProtected.selectedPage=newPage).visible=true;
          });

        this.defineMethod(
          function adjustPageChange_flip(aPage,time) {
          // nothing to do
          });

        ///////////

        this.defineMethod(
          function changePage_fade(oldPage,newPage) {
            if(oldPage) oldPage.fadein.run.reverse(function(){oldPage.visible=false;});

            newPage.position=ulCorner;
            (thisProtected.selectedPage=newPage).fadein.run.forward();
          });

        this.defineMethod(
          function adjustPageChange_fade(aPage,time) {
            if(!time)
              time=thisProtected.pageTransitionTime;
            //aPage.fadein=aPage.animate.fade.in.inSeconds(time);
            aPage.fadein=aPage.animate.fade.in.byPercent(0,100).inSeconds(time);
          });

        ///////////

        this.defineMethod(
          function changePage_slideLeft(oldPage,newPage) {
            if(oldPage) oldPage.zIndex=1;

            newPage.zIndex=2;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideleft.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function changePage_slideRight(oldPage,newPage) {
            if(oldPage) oldPage.zIndex=1;

            newPage.zIndex=2;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideright.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function adjustPageChange_slideHorz(aPage,time) {
            if(!time)
              time=thisProtected.pageTransitionTime;
            aPage.slideleft =aPage.animate.move.from({x: this.width,y:0}).to(ulCorner).inSeconds(time);
            aPage.slideright=aPage.animate.move.from({x:-this.width,y:0}).to(ulCorner).inSeconds(time);
          });

        ///////////

        this.defineMethod(
          function changePage_slideUp(oldPage,newPage) {
            if(oldPage) oldPage.zIndex=1;

            newPage.zIndex=2;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideup.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function changePage_slideDown(oldPage,newPage) {
            if(oldPage) oldPage.zIndex=1;

            newPage.zIndex=2;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slidedown.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function adjustPageChange_slideVert(aPage,time) {
            if(!time)
              time=thisProtected.pageTransitionTime;
            aPage.slideup  =aPage.animate.move.from({x:0,y: this.height}).to(ulCorner).inSeconds(time);
            aPage.slidedown=aPage.animate.move.from({x:0,y:-this.height}).to(ulCorner).inSeconds(time);
          });

        ///////////

        this.defineMethod(
          function adjustPageChange_pushHorz(aPage,time) {
            if(!time)
              time=thisProtected.pageTransitionTime;
            aPage.slideinleft =aPage.animate.move.from({x:this.width,y:0}).to(ulCorner).inSeconds(time);
            aPage.slideoutleft=aPage.animate.move.from(ulCorner).to({x:-this.width,y:0}).inSeconds(time);

            aPage.slideinright =aPage.animate.move.from({x:-this.width,y:0}).to(ulCorner).inSeconds(time);
            aPage.slideoutright=aPage.animate.move.from(ulCorner).to({x:this.width,y:0}).inSeconds(time);
          });

        this.defineMethod(
          function adjustPageChange_pushVert(aPage,time) {
            if(!time)
              time=thisProtected.pageTransitionTime;
            aPage.slideinup =aPage.animate.move.from({x:0,y:this.height}).to(ulCorner).inSeconds(time);
            aPage.slideoutup=aPage.animate.move.from(ulCorner).to({x:0,y:-this.height}).inSeconds(time);

            aPage.slideindown =aPage.animate.move.from({x:0,y:-this.height}).to(ulCorner).inSeconds(time);
            aPage.slideoutdown=aPage.animate.move.from(ulCorner).to({x:0,y:this.height}).inSeconds(time);
          });

        this.defineMethod(
          function onSwipeLeft() {
            this.nextPage(1);
          });

        this.defineMethod(
          function onSwipeUp() {
            this.nextPage(2);
          });

        this.defineMethod(
          function onSwipeRight() {
            this.priorPage(1);
          });

        this.defineMethod(
          function onSwipeDown() {
            this.priorPage(2);
          });

        this.defineMethod(
          function wirePageSwipe(aPage) {
            var that=this;
            var ns=".swipeFor"+this.id;

              function goSwipeLeft() {that.onSwipeLeft();}
              function goSwipeRight(){that.onSwipeRight();}
              function goSwipeUp()   {that.onSwipeUp();}
              function goSwipeDown() {that.onSwipeDown();}

            aPage.off(ns);
            if(thisProtected.swipePageChange==="leftright") {
              this.adjustPageChange_pushHorz(aPage,0.25);
              aPage.on("swipeleft"+ns,   goSwipeLeft );
              aPage.on("swiperight"+ns,  goSwipeRight);
            } else if(thisProtected.swipePageChange==="updown") {
              this.adjustPageChange_pushVert(aPage,0.25);
              aPage.on("swipeup"+ns,     goSwipeUp );
              aPage.on("swipedown"+ns,   goSwipeDown);
            }  
          });

        this.defineMethod(
          function changePage_pushLeft(oldPage,newPage) {
            if(oldPage) oldPage.slideoutleft.forward.run();

            //newPage.opacity=1;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideinleft.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function changePage_pushRight(oldPage,newPage) {
            if(oldPage) oldPage.slideoutright.forward.run();

            //newPage.opacity=1;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideinright.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function changePage_pushUp(oldPage,newPage) {
            if(oldPage) oldPage.slideoutup.forward.run();

            //newPage.opacity=1;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideinup.forward.run(function(){oldPage.visible=false;});
          });

        this.defineMethod(
          function changePage_pushDown(oldPage,newPage) {
            if(oldPage) oldPage.slideoutdown.forward.run();

            //newPage.opacity=1;
            newPage.visible=true;
            (thisProtected.selectedPage=newPage).slideindown.forward.run(function(){oldPage.visible=false;});
          });

        ///////////

        this.defineMethod(
          function nextPage(swipeDir) {

            if(thisProtected.children.length===0) return -1;

            var p=thisProtected.selectedPageIndex+1;
            if(p>=thisProtected.children.length) {
              if(!thisProtected.wrapAround) return thisProtected.selectedPageIndex;
              p=0;
            }

            var oldPage=thisProtected.selectedPage;
            var newPage=thisProtected.children[thisProtected.selectedPageIndex=p];

            if(swipeDir===1)
              this.changePage_pushLeft(oldPage,newPage)
            else if (swipeDir===2)
              this.changePage_pushUp(oldPage,newPage)
            else
              thisProtected.changeNextPage.call(this,oldPage,newPage);

            return p;
          });

        ///////////

        this.defineMethod(
          function priorPage(swipeDir) {

            if(thisProtected.children.length===0) return -1;

            var p=thisProtected.selectedPageIndex-1;
            if(p<0) {
              if(!thisProtected.wrapAround) return thisProtected.selectedPageIndex;
              p=thisProtected.children.length-1;
            }

            var oldPage=thisProtected.selectedPage;
            var newPage=thisProtected.children[thisProtected.selectedPageIndex=p];

            if(swipeDir===1)
              this.changePage_pushRight(oldPage,newPage)
            else if (swipeDir===2)
              this.changePage_pushDown(oldPage,newPage)
            else
              thisProtected.changePriorPage.call(this,oldPage,newPage);

            return p;
          });

        this.defineProperties({
          activePage:{
            get:function(){
              return thisProtected.selectedPage;
            },
            set:function(value){
              if(thisProtected.selectedPage===value) return;

              for(var i=0,j=thisProtected.children.length;i<j;i++) {
                if(thisProtected.children[i]===value) {
                  //this.changePage_flip(thisProtected.selectedPage,value);
                  thisProtected.changeNextPage.call(this,thisProtected.selectedPage,value);
                  return value;
                }
              }
            }
          }


        });

      });

  });

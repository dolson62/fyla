
(function TUIAnimationAction(){}).subClass(
  function(application,$,isClass) {
    this.abstract();

    this.initializeInstanceWith(
      function(application,$)  {
        var thisProtected;

        this.defineConstructor(
          function Create(animation) {
            thisProtected=this.protectedData;
            thisProtected.animation=animation;

            thisProtected.fromCurrent=true;

            thisProtected.effect="linear";

            thisProtected.inSeconds=
              function() {        
                return (thisProtected.timeSeconds ? thisProtected.timeSeconds : thisProtected.animation.timeSeconds);
              }

            thisProtected.delaySeconds=
              function() {        
                //return (thisProtected.pauseSeconds ? thisProtected.pauseSeconds : thisProtected.animation.delaySeconds);
                return (thisProtected.pauseSeconds || 0);
              }

          });

        this.defineProperties({
            and:{get:function(){return thisProtected.animation;}},
            run:{get:function(){return thisProtected.animation.executor;}}
          });

        this.defineVirtualProperties({
            forward:{get:function(){return thisProtected.animation.forward;}},
            reverse:{get:function(){return thisProtected.animation.reverse;}}
          });

        this.defineMethod(
          function forwardIf(test) {
            return thisProtected.animation.forwardIf(test);
          });

        this.defineMethod(
          function reverseIf(test) {
            return thisProtected.animation.reverseIf(test);
          });

        this.defineMethod(
          function then(whenComplete) {
            return thisProtected.animation.then(whenComplete);
          });

        this.defineMethod(
          function inSeconds(seconds) {
            thisProtected.timeSeconds=seconds;
            return this;
          });

        this.defineMethod(
          function effect(method) {
            thisProtected.effect=method;
            return this;
          });

        this.defineMethod(
          function pauseSeconds(seconds) {
            thisProtected.pauseSeconds=seconds;
            return this;
          });

        this.defineMethod(
          function waitSeconds(seconds)
          {
          return thisProtected.animation.waitSeconds(seconds);
          });

        this.defineMethod(
          function actionStart() {
            return true;
          });

        this.defineMethod(
          function actionDone() {
          })

      });

  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TUIAnimationMove(){}).subClass(TUIAnimationAction,
  function(application,$,isClass) {
    this.abstract();

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create(animation) {
            thisProtected = this.protectedData;
            this.inherited(animation);

            thisProtected.toPosition=(thisProtected.fromPosition=animation.control.position);

            thisProtected.startPosition=
              function() {
                if(this.animation.isReverse)
                	return this.toPosition
                else
                	return this.fromPosition;
              };
            thisProtected.endPosition=
              function() {
                if(this.animation.isReverse)
                	return this.fromPosition
                else
                	return this.toPosition;
              };
          });

          function parsePosition(position,positionY) {
            if(typeof position!=="object")
            	return {x:position,y:positionY}
            else
            	return position;
          }
        
        this.defineMethod(
          function from(position,positionY) {
            thisProtected.fromPosition=parsePosition(position,positionY);
            thisProtected.fromCurrent=false;
            return this;
          });

        this.defineMethod(
          function to(position,positionY) {
            thisProtected.toPosition=parsePosition(position,positionY);
            return this;
          });

        this.defineMethod(
          function actionDone() {
            thisProtected.animation.control.position=thisProtected.endPosition();
          })
      });
  });

////////////////

(function TUIAnimationRotate(){}).subClass(TUIAnimationAction,
  function(application,$,isClass) {
    this.abstract();

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create(animation) {
            thisProtected = this.protectedData;
            this.inherited(animation);

            thisProtected.fromDegrees=0;
            thisProtected.toDegrees=0;
            thisProtected.directionFactor=1;

            thisProtected.startDegrees=
              function() {
                if(this.animation.isReverse)
                	return this.toDegrees*this.directionFactor;
                else
                	return this.fromDegrees*this.directionFactor;
              };
            thisProtected.endDegrees=
              function() {
                if(this.animation.isReverse)
                	return this.fromDegrees*this.directionFactor;
                else
                	return this.toDegrees*this.directionFactor;
              };
          });


        this.defineProperties({
          counterClockwise:{get:
            function() {
              thisProtected.directionFactor=-1;
              return this;
            }},
          clockwise:{get:
            function() {
              thisProtected.directionFactor=1;
              return this;
            }}

        	});

        this.defineMethod(
          function fromDegrees(degrees) {
            thisProtected.fromDegrees=degrees;
            thisProtected.fromCurrent=false;
            return this;
          });
        this.defineMethod(
          function toDegrees(degrees) {
            thisProtected.toDegrees=degrees;
            return this;
          });
        this.defineMethod(
          function byDegrees(degrees) {
            thisProtected.toDegrees=thisProtected.fromDegrees+degrees;
            return this;
          });

      });
  });

////////////////

(function TUIAnimationScale(){}).subClass(TUIAnimationAction,
  function(application,$,isClass)
  {
  this.abstract();

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);

      thisProtected.fromPercent={width:100,height:100};
      thisProtected.toPercent  ={width:100,height:100};

      thisProtected.startPercent=
        function()
        {
        if(this.animation.isReverse)
        	return this.toPercent;
        else
        	return this.fromPercent;
        };
      thisProtected.endPercent=
        function()
        {
        if(this.animation.isReverse)
        	return this.fromPercent;
        else
        	return this.toPercent;
        };

      });

    this.defineMethod(
      function fromPercent(percent,percentHeight)
      {
      if(!percentHeight)
      	percentHeight=percent;

      thisProtected.fromPercent={width:percent,height:percentHeight};
      thisProtected.fromCurrent=false;
      return this;
      });

    this.defineMethod(
      function toPercent(percent,percentHeight)
      {
      if(!percentHeight)
      	percentHeight=percent;

      thisProtected.toPercent={width:percent,height:percentHeight};
      return this;
      });

    this.defineMethod(
      function byPercent(percent,percentHeight)
      {
      if(!percentHeight)
      	percentHeight=percent;

      thisProtected.toPercent={width:percent,height:percentHeight};
      return this;
      });


    });

  });

////////////////

(function TUIAnimationResize(){}).subClass(TUIAnimationAction,
  function(application,$,isClass)
  {
  this.abstract();

  this.initializeInstanceWith(
    function(application,$) {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);


      thisProtected.toSize=(thisProtected.fromSize={width:animation.control.width,height:animation.control.height});


      thisProtected.startSize=
        function()
        {
        if(this.animation.isReverse)
        	return this.toSize
        else
        	return this.fromSize;
        };

      thisProtected.endSize=
        function()
        {
        if(this.animation.isReverse)
        	return this.fromSize
        else
        	return this.toSize;
        };

      });

      function parseSize(width,height)
      {
      if(!height)
      	return {width:width,height:width}
      else if(typeof width!=="object")
      	return {width:width,height:height}
      else
      	return width;
      }
    
    this.defineMethod(
      function from(width,height)
      {
      thisProtected.fromSize=parseSize(width,height);
      thisProtected.fromCurrent=false;
      return this;
      });
    this.defineMethod(
      function to(width,height)
      {
      thisProtected.toSize=parseSize(width,height);
      return this;
      });
    this.defineMethod(
      function toPercent(width,height)
      {
      var sz=parseSize(width,height);
      return this.to((sz.width/100)*thisProtected.fromSize.width, (sz.height/100)*thisProtected.fromSize.height)
      });


    });

  });

////////////////

(function TUIAnimationZoom(){}).subClass(TUIAnimationAction,
  function(application,$,isClass) {
    this.abstract();

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create(animation) {
            thisProtected = this.protectedData;
            this.inherited(animation);


            thisProtected.toSize=(thisProtected.fromSize={width:animation.control.width,height:animation.control.height});

            thisProtected.startSize=
              function()
              {
              if(this.animation.isReverse)
              	return this.toSize
              else
              	return this.fromSize;
              };
            thisProtected.endSize=
              function()
              {
              if(this.animation.isReverse)
              	return this.fromSize
              else
              	return this.toSize;
              };

            thisProtected.toPosition=(thisProtected.fromPosition=animation.control.position);

            thisProtected.startPosition=
              function()
              {
              if(this.animation.isReverse)
              	return this.toPosition
              else
              	return this.fromPosition;
              };
            thisProtected.endPosition=
              function()
              {
              if(this.animation.isReverse)
              	return this.fromPosition
              else
              	return this.toPosition;
              };

          });

          function parseSize(width,height) {
            if(!height)
            	return {width:width,height:width}
            else if(typeof width!=="object")
            	return {width:width,height:height}
            else
            	return width;
          }
        
        this.defineMethod(
          function fromPercent(width,height) {
            thisProtected.fromSize=parseSize(width,height);
            thisProtected.fromCurrent=false;
            return this;
          });
        this.defineMethod(
          function toPercent(width,height) {
            var sz=parseSize(width,height);
            sz.width=(sz.width/100)*thisProtected.fromSize.width;
            sz.height=(sz.height/100)*thisProtected.fromSize.height;
            var chg={width:thisProtected.fromSize.width-sz.width, height:thisProtected.fromSize.height-sz.height};

            var pos=thisProtected.fromPosition;

            thisProtected.toPosition={x:pos.x+(chg.width/2),y:pos.y+(chg.height/2)};
            thisProtected.toSize=parseSize(sz.width, sz.height);

            return this;
          });

        this.defineMethod(
          function actionDone() {




          });

      });
  });

////////////////

(function TUIAnimationFade(){}).subClass(TUIAnimationAction,
  function(application,$,isClass) {
    this.abstract();

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create(animation) {
            thisProtected = this.protectedData;
            this.inherited(animation);


            thisProtected.startOpacity=
              function() {
                if(thisProtected.fromCurrent)
                  return (thisProtected.animation.control.opacity*100);
                else if(this.animation.isReverse)
                  return this.toOpacity;
                else
                  return this.fromOpacity;
              };
            thisProtected.endOpacity=
              function() {
                if(this.animation.isReverse) 
                  return this.fromOpacity;
                else
                  return this.toOpacity;
              };
          });

        this.defineProperties({
          in: {get:function(){thisProtected.fromOpacity=0;   thisProtected.toOpacity=100; return this;}},
          out:{get:function(){thisProtected.fromOpacity=100; thisProtected.toOpacity=0;   return this;}},
          });

        this.defineMethod(
          function fromPercent(opacity) {
            thisProtected.fromOpacity=opacity;
            thisProtected.fromCurrent=false;
            return this;
          });

        this.defineMethod(
          function toPercent(opacity) {
            thisProtected.toOpacity=opacity;
            return this;
          });

        this.defineMethod(
          function byPercent(fromOpacity,toOpacity) {
            thisProtected.fromCurrent=false;
            thisProtected.fromOpacity=fromOpacity;
            thisProtected.toOpacity=toOpacity;
            return this;
          });

        this.defineMethod(
          function actionStart() {

            if(thisProtected.fromCurrent) {
              if(thisProtected.animation.control.opacity===(thisProtected.endOpacity() / 100) &&
                        thisProtected.animation.control.visible)
                return false;
            }

            thisProtected.animation.control.opacity=(thisProtected.startOpacity() / 100);
            thisProtected.animation.control.visible=true;

            return true;
          });

        this.defineMethod(
          function actionDone() {

            thisProtected.animation.control.opacity=(thisProtected.endOpacity() / 100);

          });

      });

  });

////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TUIAnimationExecutor(){}).subClass(TUIAnimationAction,
  function(application,$,isClass)
  {

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected=this.protectedData;
      this.inherited(animation);

      });

    this.defineVirtualProperties(
      {
      forward:{get:function(){return thisProtected.animation.forward.executor;}},
      reverse:{get:function(){return thisProtected.animation.reverse.executor;}}
      });

    this.defineMethod(
      function waitSeconds(seconds)
      {
      thisProtected.animation.oneTimePauseSeconds=seconds;
      return this;
      });

    this.defineMethod(
      function execute(whenComplete)
      {
      thisProtected.animation.execute(whenComplete);
      });

    this.defineMethod(
      function then(whenComplete)
      {
      return thisProtected.animation.execute(whenComplete);
      });

    });

  });

TUIAnimationExecutor.makeNewInstance=
  function()
  {
  var executor=
    function(whenComplete)
    {
    executor.execute(whenComplete);
    };

  if(Object.setPrototypeOf)
    Object.setPrototypeOf(executor,this.prototype)
  else
    executor.__proto__=this.prototype;

  return executor;
  };


////////////////

(function TUIAnimation(){}).subClass(
  function(application,$,isClass)
  {
  this.abstract();

  fyApplication.animationClass=this;

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(control)
      {
      thisProtected=this.protectedData;
      thisProtected.control=control;
      thisProtected.$sprite=control.$domElement;

      thisProtected.timeSeconds=0;
      thisProtected.pauseSeconds=0;

      thisProtected.runReverse=false;

      thisProtected.actions=[];
      });

    this.defineVirtualProperties(
      {
      makeMoveAction:  {value:function(animation){return TUIAnimationMove.Create(animation);}},
      makeRotateAction:{value:function(animation){return TUIAnimationRotate.Create(animation);}},
      makeScaleAction: {value:function(animation){return TUIAnimationScale.Create(animation);}},
      makeResizeAction:{value:function(animation){return TUIAnimationResize.Create(animation);}},
      makeZoomAction:  {value:function(animation){return TUIAnimationZoom.Create(animation);}},
      makeFadeAction:  {value:function(animation){return TUIAnimationFade.Create(animation);}}
      });

    this.defineMethod(
      function forwardIf(test)
      {
      var doIt=(typeof test==="undefined") || test;
      if(doIt)
        return this.forward
      else
        return this.reverse;
      });

    this.defineMethod(
      function reverseIf(test)
      {
      var doIt=(typeof test==="undefined") || test;
      if(doIt)
        return this.reverse
      else
        return this.forward;
      });

    this.defineProperties(
      {
      $sprite:{get:function(){return thisProtected.$sprite;}},
      control:{get:function(){return thisProtected.control;}},
      executor:{get:
        function()
        {
        return (thisProtected.executor=(thisProtected.executor || TUIAnimationExecutor.Create(this)));
        }},
      forward:{get:
	      function()
	      {
        thisProtected.runReverse=false;
	      return this;
	      }},
      reverse:{get:
        function()
        {
        thisProtected.runReverse=true;
        return this;
        }},
      run:{get:function(){return this.executor;}},
      isReverse:{get:function(){return thisProtected.runReverse;}},
      reverseFactor:{get:function(){return (thisProtected.runReverse?-1:1);}},
      timeSeconds:{get:function(){return thisProtected.timeSeconds;}},
      delaySeconds:{get:function(){return thisProtected.pauseSeconds;}},
      move:{get:
	      function()
	      {
	      if(!this.moveAction)
	      	thisProtected.actions.push(thisProtected.moveAction=this.makeMoveAction(this));
	      return thisProtected.moveAction;
	      }},
      resize:{get:
	      function()
	      {
	      if(!this.resizeAction)
	      	thisProtected.actions.push(thisProtected.resizeAction=this.makeResizeAction(this));
	      return thisProtected.resizeAction;
	      }},
      zoom:{get:
	      function()
	      {
	      if(!this.zoomAction)
	      	thisProtected.actions.push(thisProtected.zoomAction=this.makeZoomAction(this));
	      return thisProtected.zoomAction;
	      }},
      scale:{get:
	      function()
	      {
	      if(!this.scaleAction)
	      	thisProtected.actions.push(thisProtected.scaleAction=this.makeScaleAction(this));
	      return thisProtected.scaleAction;
	      }},
      rotate:{get:
	      function()
	      {
	      if(!this.rotateAction)
	      	thisProtected.actions.push(thisProtected.rotateAction=this.makeRotateAction(this));
	      return thisProtected.rotateAction;
	      }},
      fade:{get:
        function()
        {
        if(!this.fadeAction)
          thisProtected.actions.push(thisProtected.fadeAction=this.makeFadeAction(this));
        return thisProtected.fadeAction;
        }}


      });
    
    this.defineMethod(
      function inSeconds(seconds)
      {
      thisProtected.timeSeconds=seconds;
      return this;
      });

    this.defineMethod(
      function pauseSeconds(seconds)
      {
      thisProtected.pauseSeconds=seconds;
      return this;
      });

    this.defineMethod(
      function waitSeconds(seconds)
      {
      thisProtected.oneTimePauseSeconds=seconds;
      return this;
      });

    this.defineMethod(
      function then(whenComplete)
      {
      thisProtected.whenComplete=whenComplete;
      return this;
      });

    this.defineMethod(
      function execute(whenComplete)
      {
      this.abstract();
      });

    });

  });

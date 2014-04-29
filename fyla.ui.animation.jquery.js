////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TUIAnimationMovejQuery(){}).subClass(TUIAnimationMove,
  function(application,$,isClass)
  {

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      this.inherited(animation);
      thisProtected = this.protectedData;


      });

    this.defineMethod(
      function runAnimate($sprite,animateDone)
      {
      $sprite.animate({
         left:thisProtected.endPosition().x,
         top:thisProtected.endPosition().y,
         }, thisProtected.inSeconds()*1000, 'linear', animateDone);
      return 1;
      });

    });

  });


////////////////

$.fn.animateRotate = function(startAngle, endAngle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(
      function(i, e) {
        args.step = 
          function(now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(this, arguments);
            };

        $({deg: startAngle}).animate({deg: endAngle}, args);
        });
    };


(function TUIAnimationRotatejQuery(){}).subClass(TUIAnimationRotate,
  function(application,$,isClass)
  {

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);
      });

    this.defineMethod(
      function runAnimate($sprite,animateDone)
      {
      $sprite.animateRotate(thisProtected.startDegrees(),thisProtected.endDegrees(), 
                  thisProtected.inSeconds()*1000, 'linear', animateDone);
      return 1;
      });

    });

  });

////////////////

(function TUIAnimationResizejQuery(){}).subClass(TUIAnimationResize,
  function(application,$,isClass)
  {


  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);


      });

    this.defineMethod(
      function runAnimate($sprite,animateDone)
      {
      $sprite.animate({
         width:thisProtected.endSize().width,
         height:thisProtected.endSize().height,
         }, thisProtected.inSeconds()*1000, 'linear', animateDone);

      return 1;
      });


    });

  });

////////////////

(function TUIAnimationZoomjQuery(){}).subClass(TUIAnimationZoom,
  function(application,$,isClass)
  {


  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);



      });

    this.defineMethod(
      function runAnimate($sprite,animateDone)
      {


      $sprite.animate({
         left:thisProtected.endPosition().x,
         top:thisProtected.endPosition().y,
         width:thisProtected.endSize().width,
         height:thisProtected.endSize().height
         }, thisProtected.inSeconds()*1000, 'linear', animateDone);



/*

      tween.left=
        {
        start: thisProtected.startPosition().x,
        stop: thisProtected.endPosition().x,
        time: 0,
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: onTweenStop
        };

      tween.top=
        {
        start: thisProtected.startPosition().y,
        stop: thisProtected.endPosition().y,
        time: 0,
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: onTweenStop
        };

      tween.width=
        {
        start: thisProtected.startSize().width,
        stop: thisProtected.endSize().width,
        time: 0,
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: onTweenStop
        };
      tween.height=
        {
        start: thisProtected.startSize().height,
        stop: thisProtected.endSize().height,
        time: 0,
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: onTweenStop
        };

      tween.count+=4;
*/

      return 1;
      });


    });

  });

////////////////////////

(function TUIAnimationFadejQuery(){}).subClass(TUIAnimationFade,
  function(application,$,isClass)
  {

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(animation)
      {
      thisProtected = this.protectedData;
      this.inherited(animation);



      });

    this.defineMethod(
      function runAnimate($sprite,animateDone)
      {
      $sprite.animate({
         opacity:thisProtected.endOpacity()/100}, thisProtected.inSeconds()*1000, 'linear', animateDone);

      return 1;
      });

    });

  });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TUIAnimationjQuery(){}).subClass(TUIAnimation,
  function(application,$,isClass)
  {
  fyApplication.animationClass=this;

  this.initializeInstanceWith(
    function(application,$)
    {
    var thisProtected;

    this.defineConstructor(
      function Create(control)
      {
      this.inherited(control);
      thisProtected=this.protectedData;


      });

    this.defineVirtualProperties(
      {
      makeMoveAction:  {value:function(animation){return TUIAnimationMovejQuery.Create(animation);}},
      makeRotateAction:{value:function(animation){return TUIAnimationRotatejQuery.Create(animation);}},
      makeScaleAction: {value:function(animation){return TUIAnimationScale.Create(animation);}},
      makeResizeAction:{value:function(animation){return TUIAnimationResizejQuery.Create(animation);}},
      makeZoomAction:  {value:function(animation){return TUIAnimationZoomjQuery.Create(animation);}},
      makeFadeAction:  {value:function(animation){return TUIAnimationFadejQuery.Create(animation);}}
      });

    this.defineMethod(
      function execute(whenComplete)
      {
      var that=this;
      var control=thisProtected.control;
      var animationComplete=control.animationComplete;

      if(animationComplete)
        {
        if(animationComplete.state()==="pending")
          {
          animationComplete.always(function(){that.run(whenComplete);});
          return this;
          }
        }

      animationComplete=(control.animationComplete=$.Deferred());

      var animations=0;

      if(thisProtected.whenComplete)
        animationComplete.always(thisProtected.whenComplete);
      if(whenComplete)
        animationComplete.always(whenComplete);

      var onAnimationDone=
        function()
        {
        if(--animations) return;
        animationComplete.resolveWith(that);
        }

      for(var i=0,j=thisProtected.actions.length;i<j;i++)
        animations+=thisProtected.actions[i].runAnimate(thisProtected.$sprite, onAnimationDone);

      return this;
      });

    });

  });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

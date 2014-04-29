
(function TUIAnimationMoveTween(){}).subClass(TUIAnimationMove,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      tween.left=
        {
        start: thisProtected.startPosition().x,
        stop: thisProtected.endPosition().x,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: thisProtected.effect,
        onStop: function(){onTweenStop(action)}
        };

      tween.top=
        {
        start: thisProtected.startPosition().y,
        stop: thisProtected.endPosition().y,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: thisProtected.effect,
        onStop: function(){onTweenStop(action)}
        };

      tween.count+=2;
      return tween;
      });

    });

  });

////////////////////////

(function TUIAnimationRotateTween(){}).subClass(TUIAnimationRotate,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      tween.rotate=
        {
        start: thisProtected.startDegrees(),
        stop: thisProtected.endDegrees(),
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: '',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };
      tween.count++;

      return tween;
      });

    });

  });

////////////////////////

(function TUIAnimationScaleTween(){}).subClass(TUIAnimationScale,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      tween.width=
        {
        start: thisProtected.startPercent().width,
        stop: thisProtected.endPercent().width,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: '%',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };
      tween.height=
        {
        start: thisProtected.startPercent().height,
        stop: thisProtected.endPercent().height,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: '%',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.count+=2;

      return tween;
      });

    });

  });

////////////////

(function TUIAnimationResizeTween(){}).subClass(TUIAnimationResize,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      tween.width=
        {
        start: thisProtected.startSize().width,
        stop: thisProtected.endSize().width,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };
      tween.height=
        {
        start: thisProtected.startSize().height,
        stop: thisProtected.endSize().height,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.count+=2;

      return tween;
      });


    });

  });

////////////////

(function TUIAnimationZoomTween(){}).subClass(TUIAnimationZoom,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      var s,e;

      s=thisProtected.startPosition().x;
      e=thisProtected.endPosition().x;
      if(s!==e) {
        tween.count++;
        tween.left={
          start: s,
          stop: e,
          time: thisProtected.delaySeconds(),
          duration: thisProtected.inSeconds(),
          units: 'px',
          effect: 'linear',
          onStop: function(){onTweenStop(action)}
        };
      }

      s=thisProtected.startPosition().y;
      e=thisProtected.endPosition().y;
      if(s!==e) {
        tween.count++;
        tween.top={
          start: s,
          stop: e,
          time: thisProtected.delaySeconds(),
          duration: thisProtected.inSeconds(),
          units: 'px',
          effect: 'linear',
          onStop: function(){onTweenStop(action)}
        };
      }

      s=thisProtected.startSize().width;
      e=thisProtected.endSize().width;
      if(s!==e) {
        tween.count++;
        tween.width={
          start: s,
          stop: e,
          time: thisProtected.delaySeconds(),
          duration: thisProtected.inSeconds(),
          units: 'px',
          effect: 'linear',
          onStop: function(){onTweenStop(action)}
        };
      }  

      s=thisProtected.startSize().height;
      e=thisProtected.endSize().height;
      if(s!==e) {
        tween.count++;
        tween.height={
          start: s,
          stop: e,
          time: thisProtected.delaySeconds(),
          duration: thisProtected.inSeconds(),
          units: 'px',
          effect: 'linear',
          onStop: function(){onTweenStop(action)}
        };
      }


      /*      
      tween.left=
        {
        start: thisProtected.startPosition().x,
        stop: thisProtected.endPosition().x,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.top=
        {
        start: thisProtected.startPosition().y,
        stop: thisProtected.endPosition().y,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.width=
        {
        start: thisProtected.startSize().width,
        stop: thisProtected.endSize().width,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };
      tween.height=
        {
        start: thisProtected.startSize().height,
        stop: thisProtected.endSize().height,
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: 'px',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.count+=4;
      */

      return tween;
      });

    });

  });

////////////////

(function TUIAnimationFadeTween(){}).subClass(TUIAnimationFade,
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
      function buildTween(tween,onTweenStop)
      {
      var action=this;
      tween.opacity=
        {
        start: thisProtected.startOpacity(),
        stop: thisProtected.endOpacity(),
        time: thisProtected.delaySeconds(),
        duration: thisProtected.inSeconds(),
        units: '%',
        effect: 'linear',
        onStop: function(){onTweenStop(action)}
        };

      tween.count++;

      return tween;
      });


    });

  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TUIAnimationTween(){}).subClass(TUIAnimation,
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
      makeMoveAction:  {value:function(animation){return TUIAnimationMoveTween.Create(animation);}},
      makeRotateAction:{value:function(animation){return TUIAnimationRotateTween.Create(animation);}},
      makeScaleAction: {value:function(animation){return TUIAnimationScaleTween.Create(animation);}},
      makeResizeAction:{value:function(animation){return TUIAnimationResizeTween.Create(animation);}},
      makeZoomAction:  {value:function(animation){return TUIAnimationZoomTween.Create(animation);}},
      makeFadeAction:  {value:function(animation){return TUIAnimationFadeTween.Create(animation);}}
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

      var tweenActions={};
      tweenActions.count=0;

      var onTweenStop=
        function(action)
        {
        action.actionDone();
        if(--tweenActions.count) return;
        animationComplete.resolveWith(that);
        };

      var action;
      for(var i=0,j=thisProtected.actions.length;i<j;i++) {
        action=thisProtected.actions[i];
        if(action.actionStart())
          action.buildTween(tweenActions, onTweenStop);
      }


      if(thisProtected.whenComplete)
      	animationComplete.always(thisProtected.whenComplete);
      if(whenComplete)
        animationComplete.always(whenComplete);

      animationComplete.always(function() {
      });


      if(!tweenActions.count) {

        animationComplete.resolveWith(this);

      } else {
        
        var go=function(){ thisProtected.$sprite.tween(tweenActions).play(); };

        var delay=(thisProtected.pauseSeconds || (thisProtected.oneTimePauseSeconds || 0)) * 1000;
        if(delay)
          setTimeout(go,delay)
        else
          go();
      }  

      thisProtected.oneTimePauseSeconds=0;
      return this;
      });


    });

  });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if(!$.fn.tween)
  throw "jsTween animation library has not been loaded.";

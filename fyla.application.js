////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fyInstanceAttr($sel) {
  var v;
  if(!(v=$sel.attr("fy-instance")))
    v=$sel.attr("app-ui-instance");
  return v;
}

function fyClassAttr($sel) {
  var v;
  if(!(v=$sel.attr("fy-class")))
    v=$sel.attr("app-ui-class");
  return v;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyUIManager(){}).subClass(fyApplicationObject,
  function(application,$,isClass) {
    var waitUntilPageInitialized;

    this.defineConstructor(
      function Create(application) {
        waitUntilPageInitialized=$.Deferred();
        var mgr=this;

        if(window.jQuery) {
          if($.mobile) {
            $(document).on("pageinit",
              function(event){waitUntilPageInitialized.resolveWith(mgr)});
          } else {
            $(document).ready(
              function(event){waitUntilPageInitialized.resolveWith(mgr)});
          }
        }
      });

    this.defineMethod(
      function newAnimation($sprite) {
        var animationClass=fyApplication.animationClass;
        if(animationClass)
          return animationClass.Create($sprite);
        else
          throw "No animation library defined."
      });


    this.defineMethod(
      function onElementEvent(eventMethod, targetInstance, targetEvent, domRootElement, deferred) {
        if(this.isClass) return false;

        if(!targetInstance)
          targetInstance=application;

        if(eventMethod.name==="") throw this.constructor.name+".defineElementOnEvent: event handlers must be named to match the html element.";

        var isRadioChange;
        if(isRadioChange=(targetEvent && (targetEvent.indexOf("radios:")===0))) {
          targetEvent=targetEvent.substr(7);
        }

        var methodName=eventMethod.name;
        var selectorPrefix,selectorSuffix="";
        if(methodName.indexOf("class_")===0) {
          selectorPrefix=".";
          methodName=methodName.substr(6);
        } else if(methodName.indexOf("classbegins_")===0) {
          selectorPrefix="[class^='";
          selectorSuffix="']";
          methodName=methodName.substr(12);
        } else if(isRadioChange) {
          selectorPrefix="input[type='radio'][name='";
          selectorSuffix="']";
        } else
          selectorPrefix="#";

        var elementName, elementEvent;
        var l=methodName.lastIndexOf("_");
        if(l!== -1) {
          elementEvent=methodName.substr(l+1);
          elementName=methodName.substring(0,l);
        } else {
          elementEvent=targetEvent ? targetEvent : "click";
          elementName=methodName;
        }

        elementName=methodName.substring(0,(l===-1?methodName.length:l));

        $.when(waitUntilPageInitialized, deferred).then(
          function() {
            if(!domRootElement)
              domRootElement=$(document);
            else if(isFunction(domRootElement))
              domRootElement=domRootElement.call(targetInstance);

            var eventTarget;
            if(targetInstance.id===elementName) {

              eventTarget=targetInstance;
              targetInstance=eventMethod.ownerInstance;

            } else {

              // wire the event to the target instance as a "method"
              targetInstance[eventMethod.name]=eventMethod;

              eventTarget=domRootElement.find(selectorPrefix+elementName+selectorSuffix);
            }

            eventTarget.on(elementEvent,
              function() {
                //this = the clicked DOM element
                eventMethod.call(targetInstance, this);
              });
          });
      });

    this.defineMethod(
      function onClick(clickMethod, targetInstance, domRootElement, deferred) {
        this.onElementEvent(clickMethod,targetInstance,'click',domRootElement,deferred);
      });


    this.defineMethod(
      function onDblClick(clickMethod, targetInstance, domRootElement, deferred) {
        this.onElementEvent(clickMethod,targetInstance,'dblclick',domRootElement,deferred);
      });


    this.defineMethod(
      function onRadioButtonsChange(changeMethod, targetInstance, domRootElement, deferred) {
        this.onElementEvent(changeMethod,targetInstance,'radios:change',domRootElement,deferred);
      });

  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyApplication(){}).subClass(window,
  function(application,$,isClass)  {
  /////////////

    var thisProtected;
    var waitUntilPageInitialized;
    var waitUntilUIFormsInitialize;
    var waitUntilModulesLoaded;
    var moduleLoaders;

    this.isApplication=true;

    if(!isClass) {
      waitUntilPageInitialized=$.Deferred();
      waitUntilUIFormsInitialize=$.Deferred();
      waitUntilModulesLoaded=$.Deferred();
      moduleLoaders=[];
    } else {
      this.makeNewInstance=
        function() {
          var newapp=
            function(extendClassFunction) {
              newapp.main(extendClassFunction);
            };

          if(Object.setPrototypeOf)
            Object.setPrototypeOf(newapp,this.prototype)
          else
            newapp.__proto__=this.prototype;

          newapp.methodTableWritable=true;
          return newapp;
        };
    }  

    this.defineProtectedMethod(
      function initializeMainFrame() {

        var mainFrame;
        var MainFrameClass=fyFrame;
        var allAppsMainContents=$("[app-ui-role='appMainWindow']");
        if(allAppsMainContents.length>0) {

          var appMainContents=allAppsMainContents.find("[application='"+this.appName+"']");
          if(appMainContents.length===0)
            appMainContents=$(allAppsMainContents[0]);

          if(appMainContents.length>0) {
            appMainContents=$(appMainContents[0]);
            var tagInstanceName=fyInstanceAttr(appMainContents);

            var tagInstanceClass=window[tagInstanceName];
            if(tagInstanceClass)
              MainFrameClass=tagInstanceClass

            //mainFrame=MainFrameClass.CreateExistingTag(undefined,appMainContents)
            mainFrame=MainFrameClass.Create(appMainContents)
          }

        } 

        if(!mainFrame) {
          mainFrame=MainFrameClass.Create();
          $("body").append(mainFrame.getDOMelement());
        }

        this.mainContents=mainFrame;
        this.modalFrame=fyUIModalFramer.Create(mainFrame);
      });

    this.defineMethod(
      function initialize() {


      });

    this.defineConstructor(
      function Create(appName) {
        thisProtected=this.protectedData;
        this.uiManager=fyUIManager.Create(this);

        var app=this;
        if(window.jQuery) {

          if($.mobile) {
            $(document).on("pageinit",
              function(event){waitUntilPageInitialized.resolveWith(app)});
          } else {
            $(document).ready(
              function(event){waitUntilPageInitialized.resolveWith(app)});
          }

        } else {
          //
          throw "Fyla requires jQuery 1.11.0"
          //
        }

        if((typeof appName!=="string") || (appName===""))
          appName="webApplication";

        this.appName=appName;
      });

    //////////////////////////

    this.defineMethod(
      function module(moduleName,targetSelector,reserveContent) {
        var loader;
        loader=
          $.get(moduleName, 
            function(result) {
              loader.moduleName=moduleName;
              loader.reserveContent=(reserveContent===true);

              var tags=$.parseHTML(result,document,true);
              loader.scripts=[];
              loader.styles=[];
              loader.contents=[];
              var nn;
              for(var i=0,j=tags.length;i<j;i++) {
                nn=tags[i].nodeName;
                if(nn==="SCRIPT")
                  loader.scripts.push(tags[i]);
                else if(nn==="STYLE")
                  loader.styles.push(tags[i]);
                else
                  loader.contents.push(tags[i]);
              }
            },'html');

        if(!targetSelector)
          targetSelector="body";
        loader.targetSelector=targetSelector;

        var app=this;
        loader.injectDOM=
          function() {
            var domLocation=$(this.targetSelector);

            domLocation.append(this.styles);

            if(this.reserveContent) {
              this.domContent=this.contents;
              this.$moduleContent=$('<module>').append(this.domContent);
            } else
              $(this.targetSelector).append(this.contents);


            // Add this "magic" line to the end of each script block so it can be debugged!!!
            if(this.scripts.length!==0) {
              //var lastBlock=this.scripts[this.scripts.length-1];
              //lastBlock.childNodes[0].nodeValue+=("//@ sourceURL="+this.moduleName);

              var aBlock;
              var suffix="";
              for(var i=0,j=this.scripts.length;i<j;i++) {
                aBlock=this.scripts[i];
                aBlock.childNodes[0].nodeValue+=("//@ sourceURL="+this.moduleName+suffix);
                suffix="/"+(i+2);
              }
            }

            app.moduleLoader=this;
            try {
              domLocation.append(this.scripts);
            }
            catch(e) {
              app.moduleLoader=null;
              throw e+' (module "'+this.moduleName+'")';
            }

            app.moduleLoader=null;
          };

        moduleLoaders.push(loader);
        return loader;
      });

    this.defineMethod(
      function uiModule(moduleName,targetSelector) {
        this.module(moduleName,targetSelector,true);
      });

    //////////////////////////

    this.defineMethod(
      function onPageInitialized(eventMethod) {
        waitUntilPageInitialized.then(eventMethod);
      });

    this.defineMethod(
      function onModulesLoaded(eventMethod) {
        waitUntilModulesLoaded.then(eventMethod);
      });

    this.defineMethod(
      function onUIFormsInitialize(eventMethod) {
        waitUntilUIFormsInitialize.then(eventMethod);
      });

    //////////////////////////

    this.defineMethod(
      function onElementEvent(eventMethod) {
        this.uiManager.onElementEvent(eventMethod,this);
      });

    this.defineMethod(
      function onClick(clickMethod)  {
        this.uiManager.onClick(clickMethod,this);
      });

    this.defineMethod(
      function onRadioButtonsChange(changeMethod) {
        this.uiManager.onRadioButtonsChange(changeMethod,this);
      });

    ///////////////////////////////////

  this.defineMethod(
    function defineController(controllerDefinitionMethod)  {
      var controllerName=controllerDefinitionMethod.name;
      var newController=TController.Create(this,controllerDefinitionMethod);


      return newController;
    });

    ///////////////////////////////////

    this.defineMethod(
      function main(extendClassFunction) {
        var app=this;
        
        extendClassFunction.call(app, window, jQuery, false);

        var modulesAreLoadedAndPageInitialized=Array.prototype.slice.call(moduleLoaders);
        modulesAreLoadedAndPageInitialized.push(waitUntilPageInitialized);

        $.when.apply($, modulesAreLoadedAndPageInitialized).always(
          function() {
            var loader;
            for(var i=0,j=moduleLoaders.length;i<j;i++) {
              loader=moduleLoaders[i];
              loader.injectDOM();
            }
            moduleLoaders=null;
            waitUntilModulesLoaded.resolveWith(app);

            thisProtected.initializeMainFrame();
            app.initialize();
            waitUntilUIFormsInitialize.resolveWith(app);
          });
      });
  });



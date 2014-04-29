///////////

Array.prototype.clone=
  function() {
    return this.slice(0);
  };

Array.prototype.remove=
  function() {
    var what, a=arguments, len=a.length, ax;
    while (len && this.length) {
      what = a[--len];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };  

///////////

function isFunction(value) {
  return (typeof(value) === "function");
}

//////////////////////////////
//
// The "name" property of function objects is part of the ES6 proposal:
//
//  "Because this technology's specification has not stabilized, check 
//   the compatibility table for usage in various browsers. Also note that 
//   the syntax and behavior of an experimental technology is subject to 
//   change in future version of browsers as the spec changes."
//
//  The above is Mozilla-speak for: "here is yet-another perfectly legitimate and 
//    useful language feature that Microsoft chooses to screw-up";  because, yes,
//    this works in all browsers except IE.
//  
//  Here is a work-around that returns either the "name" property value or
//    the parsed-out value from the function object "toString".
//
//
if (!(function f() {}).name) {
  Object.defineProperty(Function.prototype, "name", {
    get: function() {
      var name=this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
      Object.defineProperty(this, "name", { value: name });
      return name;
    }
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fyObject_Create() {
  if(this.isAbstract)
    throw 'Cannot instanciate abstract class "'+this._className+'"';

  var instance=this.makeNewInstance();

  instance.constructing=true;
  instance.protectedData={};
  instance.privateLocalData={};

  if(this.hasAnyPrivateData)
    this.setupInstance(instance);

  instance.Create.apply(instance,arguments);

  delete instance.protectedData;
  delete instance.privateLocalData;
  delete instance.constructing;
  delete instance.constructingClassLayer;
  delete instance.buildingClass;
  delete instance.isBuildingAncestor;

  return instance;
};


function fyObject(){};
Object.defineProperty(fyObject, "setInstanceMethod", {
    value:
      function(instance,method,name,replacable) {
        var canConfig=false;
        if(!name)
          name=method.name;

        if(instance.methodTableWritable) {
          replacable=true;
          canConfig=true;
        } else if(typeof replacable==="undefined")
          replacable=false;

        Object.defineProperty(instance,name,{value:method,writable:replacable,configurable:canConfig,enumerable:false});
      },
    enumerable : false        
    });
Object.defineProperty(fyObject, "setReadonlyProperty", {
    value:
      function(instance,name,value) {
        Object.defineProperty(instance,name,{value:value,writable:false,configurable:false,enumerable:true});
      },
    enumerable : false        
    });

fyObject.setInstanceMethod(fyObject.prototype,function(){},"Create",true);
fyObject.setInstanceMethod(fyObject,fyObject_Create,"Create");
fyObject_Create.isConstructor=true;
fyObject.constructors=["Create"];

fyObject.prototype._className="fyObject";
fyObject.setReadonlyProperty(fyObject,'_className',"fyObject");

fyObject.prototype.hasAnyPrivateData=false;
fyObject.hasAnyPrivateData=false;
fyObject.hasPrivateData=false;

fyObject.setReadonlyProperty(fyObject,'isClass',true);
fyObject.isApplication=false;
fyObject.prototype.isApplication=false;
fyObject.prototype.methodTableWritable=false;
fyObject.SuperClass=null;
fyObject.prototype.makeNewInstance=(fyObject.makeNewInstance=function(){return new this.Constructor();});
fyObject.prototype.toString=function(){return this._className};
fyObject.nextSignature=0;
Object.defineProperties(fyObject, {
     nextInstanceSignature: { get: function() {return this.nextSignature++} } });

/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Build a new sub class.
//
//    ObjectConstructorFunction = standard javascript constructor function; function 
//                                  must not do ANYTHING; it should be completely empty:
//
//                                    function [TNew_class_name] {}
//          
//
//    application               = Owning application object.  May be undefined only for special
//                                   fyApplication utility classes.
//
//
//    initializeClass           = function that defines the class (methods, properties, class-data).
//                                   Also called to instanciate the class if the class does not
//                                   specify an "initializeInstance" function.
//
//    Called within the context of the superclass; i.e. "this" = the superclass of the new
//      class to be created.
//
//
fyObject.buildSubClass=(fyObject.prototype.buildSubClass=
  function(ObjectConstructorFunction,application,initializeClass) {
    //
    // The new classes' control/definition object AND the new classes' prototype are both
    //     instances of the superclass.
    //
    var newClass=Object.create(this.prototype);
    newClass.prototype=Object.create(this.prototype);

    //
    // Point the new classes' javascript-instanciator-constructor back at the 
    //    standard javascript constructor that was passed-in.  Wire that js constructor
    //    to manufacture instances of the new class by pointing the js constructor's 
    //    prototype at the new classes' prototype.
    //
    newClass.Constructor=ObjectConstructorFunction;
    ObjectConstructorFunction.prototype=newClass.prototype;


    //
    // Wire all ancestor constructors up to the new class so
    //   that the new class may be instanciated with any 
    //   ancestor constructor.
    //
    var constructorName;
    newClass.constructors=this.constructors.clone();
    for(var i=0,j=newClass.constructors.length;i<j;i++) {
      constructorName=newClass.constructors[i];
      newClass[constructorName]=this[constructorName];
    }


    var className=ObjectConstructorFunction.name;
    newClass.prototype.classType=newClass;
    newClass.SuperClass=this;
    newClass.prototype._className=className;
    fyObject.setReadonlyProperty(newClass,'_className',className);
    
    newClass.prototype.isClass=false;
    newClass.prototype.isInstance=true;
    newClass.isClass=true;
    newClass.isInstance=false;
    newClass.isAbstract=false;
    newClass.privateData=true;
    newClass.initializeInstance=null;
    newClass.prototype.application=application;
    if((application) && (application.moduleLoader)) {
      newClass.prototype.moduleLoader=application.moduleLoader; // Capture the loader that set-up this class
      newClass.moduleLoader=application.moduleLoader; 
    }


    initializeClass.call(newClass,application,jQuery,true);
    newClass.classInitialize(application,jQuery);

    //Did the new class specify a separate initInstance function?
    if(!newClass.initializeInstance) { 
      // No point it to the same function and done.
      newClass.initializeInstance=initializeClass;
    } else { 
      // Yes, call it once here within the context of the class to finish things up.
      newClass.initializeInstance.call(newClass,application,jQuery,true);
    }

    return newClass;
  });

////////////////////////////////////////////////////////////////////////////////////////////
//
// property fyObject.privateData
//
//   Read this property in a constructor and save in a closure variable to 
//     set up and use a subclass layer's privateData.
//
//   Default setting for any subclass is "true".  (fyObject is "false")
//   Set this property to false in the initializeClass function of a subclass to
//     indicate that a given subclass layer does not intend to use private data
//     of any kind;  that is, no "thisPrivate", no "thisProtected", and no inter-method
//     closure data. (This, of course, is not a normal situation).
//
//     If all subclasses in a given heirarchy-line set this to "false", then instanciation
//     time will be greatly decreased for all subclasses in that line  (Since 
//     "initializeInstance" will not need to be called to setup the local data closure).
//
//
Object.defineProperties(fyObject.prototype, {
  privateData: {
    get:
      function() {
        this.privateData=true;
        var localPrivate;
        if( (this.isInstance) && 
            (this.privateLocalData) && 
            (this.constructingClassLayer)) {
          localPrivate=this.privateLocalData[this.constructingClassLayer[0]._className];
        }

        return(localPrivate || {});
      },
    set:
      function(useLocalPrivateData) {
        if(this.isInstance) return;

        this.hasPrivateData=useLocalPrivateData;
        this.hasAnyPrivateData=(useLocalPrivateData || this.SuperClass.hasAnyPrivateData);
      }
    }
  });


fyObject.defineConstructor=(fyObject.prototype.defineConstructor=
  function(constructorMethod)
    {
    if(constructorMethod.name==="") throw this.constructor.name+".defineConstructor: Constructors must be named.";

    var ancestorMethod;
    var constructor=
      function()
      {
      //
      // Constructor-to-constructor calls are allowed...
      //
      if(this.hasOwnProperty("constructing"))
        {
        this.constructingClassLayer.unshift(constructorMethod.ownerClass);
        constructorMethod.apply(this,arguments);
        this.constructingClassLayer.shift();
        return this;
        }
      else
        {   // ...otherwise, create a new instance...
        var objectClass=this.classType;
        objectClass[constructorMethod.name].apply(objectClass, arguments);
        return this;
        }
      };

    if(this.isInstance)
      {
      constructorMethod.ownerClass=this.buildingClass;
      if(this.hasOwnProperty(constructorMethod.name))
        ancestorMethod=this[constructorMethod.name];
      this[constructorMethod.name]=constructor;
      }
    else
      {
      if(this.constructors.indexOf(constructorMethod.name)===-1)
        this.constructors.push(constructorMethod.name);

      constructorMethod.ownerClass=this;
      if(this.hasOwnProperty(constructorMethod.name))
        ancestorMethod=this.prototype[constructorMethod.name];
      this.prototype[constructorMethod.name]=constructor;
      }
    constructorMethod.inherited=ancestorMethod;
    constructor.inherited=ancestorMethod;
    constructor.name=constructorMethod.name;
    constructor.ownerClass=constructorMethod.ownerClass;

    if(this.isClass)
      {
      constructor=
        function(owningApplication)
        {
        if(this.isAbstract)
          throw 'Cannot instanciate abstract class "'+this._className+'"';

        var args;
        var instance=this.makeNewInstance();

        if((typeof owningApplication==="object") && 
               (owningApplication.hasOwnProperty("isApplication")) && 
                    (owningApplication.isApplication))
          {
          args=Array.prototype.slice.call(arguments,1);
          instance.application=owningApplication;
          }
        else
          args=Array.prototype.slice.call(arguments);

        fyObject.setReadonlyProperty(instance,'signature',fyObject.nextInstanceSignature);
        instance.constructing=true;
        instance.constructingClassLayer=[fyObject];

        instance.privateLocalData={};
        (instance.protectedData={}).wireProtectedMethod=
          function(method,isVirtual) {
            fyObject.setInstanceMethod(this,
                function(){return method.apply(this.instance, arguments);},
                method.name,isVirtual);
          };
        Object.defineProperty(instance.protectedData,'instance',{value:instance,writable:false,configurable:false,enumerable:false});


        if(this.hasAnyPrivateData)
          this.setupInstance(instance);

        instance[constructorMethod.name].apply(instance,args);

        delete instance.protectedData.wireProtectedMethod;
        delete instance.protectedData;
        delete instance.privateLocalData;
        delete instance.constructing;
        delete instance.constructingClassLayer;
        delete instance.buildingClass;
        delete instance.isBuildingAncestor;

        return instance;
        };
      constructor.isConstructor=true;
      constructorMethod.ownerClass=this;

      fyObject.setInstanceMethod(this,constructor,constructorMethod.name);
      }

    return constructorMethod;
    });


fyObject.defineMethod=(fyObject.prototype.defineMethod=
  function(method)
    {
    if(method.name==="") throw this.constructor.name+".defineMethod: Methods must be named.";

    // Once a constructor is defined, don't allow subclasses to override them as methods; force the override of the superclass constructor
    var possibleAncestorConstructorMethod;
    if(this.isInstance)
      possibleAncestorConstructorMethod=this.classType[method.name];
    else
      possibleAncestorConstructorMethod=this[method.name];

    if(isFunction(possibleAncestorConstructorMethod) && (possibleAncestorConstructorMethod.hasOwnProperty("isConstructor")))
      return this.defineConstructor(method);

    var ancestorMethod;
    if(this.isInstance)
      {
      method.ownerInstance=this;
      method.ownerClass=this.buildingClass;
      if(this.hasOwnProperty(method.name))
        ancestorMethod=this[method.name];
      fyObject.setInstanceMethod(this,method,method.name,this.isBuildingAncestor);
      }
    else
      {
      method.ownerClass=this;
      if(this.prototype.hasOwnProperty(method.name))
        ancestorMethod=this.prototype[method.name];
      this.prototype[method.name]=method;
      }
    method.inherited=ancestorMethod;

    return method;
    });


fyObject.definePrivateMethod=(fyObject.prototype.definePrivateMethod=
  function(method)
    {
    if((this.isClass) || 
       (!this.buildingClass) || 
       (!this.privateLocalData) || 
       (!this.privateLocalData[this.buildingClass._className])) return;

    if(method.name==="") throw this.constructor.name+".definePrivateMethod: Methods must be named.";

    // Once a constructor is defined, don't allow subclasses to override them as private methods; 
    var possibleAncestorConstructorMethod;
    if(this.isInstance)
      possibleAncestorConstructorMethod=this.classType[method.name];
    else
      possibleAncestorConstructorMethod=this[method.name];

    if(isFunction(possibleAncestorConstructorMethod) && (possibleAncestorConstructorMethod.hasOwnProperty("isConstructor")))
      throw this.constructor.name+".definePrivateMethod: Method name conflicts with a constructor.";

    // private methods do not need to be virtual since they are private to the class layer

    this.privateLocalData[this.buildingClass._className].wirePrivateMethod(method);

    return method;
    });


fyObject.defineProtectedMethod=(fyObject.prototype.defineProtectedMethod=
  function(method)
    {
    if((this.isClass) || (!this.protectedData)) return;

    if(method.name==="") throw this.constructor.name+".defineProtectedMethod: Methods must be named.";

    // Once a constructor is defined, don't allow subclasses to override them as protected methods.
    var possibleAncestorConstructorMethod;
    if(this.isInstance)
      possibleAncestorConstructorMethod=this.classType[method.name];
    else
      possibleAncestorConstructorMethod=this[method.name];

    if(isFunction(possibleAncestorConstructorMethod) && (possibleAncestorConstructorMethod.hasOwnProperty("isConstructor")))
      throw this.constructor.name+".defineProtectedMethod: Method name conflicts with a constructor.";

    /*   ToDo:  see if protected methods can be made virtual

    var ancestorMethod;
    if(this.isInstance)
      {
      method.ownerClass=this.buildingClass;
      if(this.hasOwnProperty(method.name))
        ancestorMethod=this[method.name];
      this[method.name]=method;
      }
    else
      {
      method.ownerClass=this;
      if(this.prototype.hasOwnProperty(method.name))
        ancestorMethod=this.prototype[method.name];
      this.prototype[method.name]=method;
      }
    method.inherited=ancestorMethod;

    */

    this.protectedData.wireProtectedMethod(method,true);

    return method;
    });


fyObject.defineClassMethod=(fyObject.prototype.defineClassMethod=
  function(method)
    {
    if(method.name==="") throw this.constructor.name+".defineClassMethod: Class methods must be named.";

    if(this.isInstance) return method;

    // Once a constructor is defined, don't allow subclasses to override them as methods; force the override of the superclass constructor
    var possibleAncestorConstructorMethod;
    if(this.isInstance)
      possibleAncestorConstructorMethod=this[method.name];
    else
      possibleAncestorConstructorMethod=this.prototype[method.name];

    if(isFunction(possibleAncestorConstructorMethod) && (possibleAncestorConstructorMethod.hasOwnProperty("isConstructorMethod")))
      return this.defineConstructor(method);

    this.prototype[method.name]=method;
    this[method.name]=method;
    method.ownerClass=this;

    return method;
    });


fyObject.defineProperties=(fyObject.prototype.defineProperties=
  function(properties,areVirtual) {
    if(typeof areVirtual==="undefined") {
       areVirtual=this.isInstance && (this.isBuildingAncestor);
    }

    if(areVirtual) {

      for(var newPropertyName in properties) {

        if(properties.hasOwnProperty(newPropertyName)) {

          var newProperty=properties[newPropertyName];
          if(!newProperty.hasOwnProperty("configurable")) {
            newProperty.configurable=true;
            newProperty.virtual=true;
          }
        }
      }
    }
    return Object.defineProperties(this,properties);
  });

fyObject.defineVirtualProperties=(fyObject.prototype.defineVirtualProperties=
  function(properties) {
    return this.defineProperties(properties,true);
  });

fyObject.defineProperty=(fyObject.prototype.defineProperty=
  function(properties,descriptor,isVirtual) {
    var props=properties;
    if((typeof props!=="object") && (typeof descriptor!=="undefined"))
      props={properties:descriptor};

    return fyObject.prototype.defineProperties.call(this,props,isVirtual)
  });

fyObject.defineVirtualProperty=(fyObject.prototype.defineVirtualProperty=
  function(properties,descriptor) {
    return this.defineProperty(properties,descriptor,true);
  });
fyObject.defineVirtualProperties=(fyObject.prototype.defineVirtualProperties=fyObject.prototype.defineVirtualProperty);

fyObject.defineClassProperties=(fyObject.prototype.defineClassProperties=
  function(properties) {
    if(this.isInstance) return properties;

    Object.defineProperties(this,properties);
    Object.defineProperties(this.prototype,properties);
  });


(function defineEnumElementClass() {

  var EnumElementClass=function(name,ordValue,textValue,enumeration) {
      this.name=name;
      this.ordinal=ordValue;
      this.text=textValue;
      this.enumeration=enumeration;
    };
  fyObject.EnumElement=EnumElementClass;

  EnumElementClass.prototype.toString=
    function() {
      return this.text;
    };
  EnumElementClass.prototype.greaterThan=(EnumElementClass.prototype.isGreater=
    function(otherElement) {
      return (this.ordinal>otherElement.ordinal);
    });
  EnumElementClass.prototype.greaterThanOrEqual=(EnumElementClass.prototype.isGreaterOrEqual=
    function(otherElement) {
      return (this.ordinal>=otherElement.ordinal);
    });
  EnumElementClass.prototype.lessThan=(EnumElementClass.prototype.isLess=
    function(otherElement) {
      return (this.ordinal<otherElement.ordinal);
    });
  EnumElementClass.prototype.lessThanOrEqual=(EnumElementClass.prototype.isLessOrEqual=
    function(otherElement) {
      return (this.ordinal<=otherElement.ordinal);
    });
  Object.seal(EnumElementClass.prototype);
})();


fyObject.prototype.defineEnumeration=
  function (name,values) {
    if( (!this.isClass) && (!this.isApplication) ) return false;

    if( (typeof name==="string") && (values instanceof Array) && (values.length>0)) {
      var enumeration=values.slice(0); // clone
      var elements={};
      var elem,elemName,elemText,val;
      for(var i=0,j=values.length;i<j;i++) {
        elem=values[i];
        if(typeof elem==="string") {
            elemName=elem;
            elemText=elem;
        } else if((typeof elem==="object") && elem.hasOwnProperty("name")) {
            elemName=elem.name;
            if(elem.hasOwnProperty("text"))
              elemText=elem.text;
            else
              elemText=elem.name;
        } else
          throw "Invalid enumeration element definition.";

        val=new fyObject.EnumElement(elemName,i,elemText,enumeration);
        Object.seal(val);
        enumeration[i]=val;
        elements[elemName] = {value:val};
      }

      Object.defineProperties(enumeration, elements);

      if(this.isClass) {
        this.prototype[name]=enumeration;
        this.application[name]=enumeration;
      } else {
        this[name]=enumeration;
      }

      Object.seal(enumeration);
      return (enumeration);

    } else
      return false;
  };



fyObject.initializeInstanceWith=(fyObject.prototype.initializeInstanceWith=
  function(initializeInstanceMethod) { this.initializeInstance=initializeInstanceMethod; });


fyObject.setupInstance=
  function(instance) {
    // plug the top of the constructor chain
    instance.Create=function(){};
    instance.Create.ownerClass=fyObject;
    return instance;
  };


fyObject.prototype.setupInstance=
  function(instance)
    {
    this.SuperClass.setupInstance(instance);

    if(this.hasPrivateData)
      {
      instance.buildingClass=this;
      instance.isBuildingAncestor=(this!==instance.classType);
      var localPrivate;
      (localPrivate=instance.privateLocalData[this._className]={}).wirePrivateMethod=
        function(method)
        {
        fyObject.setInstanceMethod(this,
          function(){method.apply(this.instance, arguments);},
          method.name);
        };
      Object.defineProperty(localPrivate,'instance',{value:instance,writable:false,configurable:false,enumerable:false});

      this.initializeInstance.call(instance,instance.application,jQuery,false);

      delete instance.privateLocalData[this._className].wirePrivateMethod;
      }

    return instance;
    };
fyObject.classInitialize=(fyObject.prototype.classInitialize=function(application,$){});

fyObject.onClassInitialize=(fyObject.prototype.onClassInitialize=
  function(method)
  {
  this.classInitialize=method;
  this.prototype.classInitialize=method;
  });

fyObject.abstract=(fyObject.prototype.abstract=
  function()
    {
    if(this.isClass)
      {
      this.isAbstract=true;
      return;
      }

    if(this.hasOwnProperty("constructing"))
      {
      if(this._className!==this.buildingClass._className) return;
      throw 'Cannot instanciate abstract class "'+this._className+'"';
      }
    else
      {
      var msg;
      try
        {
        var caller=arguments.callee.caller;
        var methodName=caller.name;

        msg='Call to abstract method: "'+caller.ownerClass._className+'.'+methodName+'();"';
        }
      catch(e)
        {
        msg='Call to abstract method.';
        }
      throw msg;
      }
    });


fyObject.inherited=(fyObject.prototype.inherited=
  function(/* [[superclassMethod,] arguments]   ||  arg1,arg2,arg3....        */)
    {
    var ancestorName="";
    var caller;
    var ancestor;
    var superclassMethod,conveyedArguments;

    if(typeof arguments[0]==="function") 
      {
      superclassMethod=arguments[0];
      conveyedArguments=Array.prototype.slice.call(arguments,1);
      } 
    else 
      conveyedArguments=Array.prototype.slice.call(arguments);

    if(isJSargumentsContainer(conveyedArguments[0]))
      conveyedArguments=Array.prototype.slice.call(conveyedArguments[0]);


  //try
      {
      if(superclassMethod)
        {
        var callerClass;
        if(arguments.callee.caller) 
          callerClass=arguments.callee.caller.ownerClass;
        if(!callerClass)
          callerClass=superclassMethod.ownerClass;

        ancestor=superclassMethod;
        do 
          {
          ancestor=ancestor.inherited;
          }
        while(!ancestor.ownerClass.isSuperClassOf(callerClass));

        ancestorName=ancestor.name;
        }
      else
        {
        if(arguments.callee.caller) 
          caller=arguments.callee.caller;
        else
          caller={};

        ancestorName=caller.name;

        ancestor=caller.inherited;
        }
      
      if(ancestor)
        return ancestor.apply(this,conveyedArguments);
      else if(caller.ownerClass)
        throw 'No inherited method "'+caller.ownerClass.SuperClass.prototype._className+'.'+ancestorName+'"';
      else
        throw 'Inherited usage:   this.inherited(this.[ancestor-method-name]);';
      }
  //catch(e)
  //  {
  //  }
    });


fyObject.prototype.isInstanceOf=
  function(aClass)
    {
    var thisClass=this.classType;

    while(thisClass)
      {
      if(thisClass===aClass) return true;
      thisClass=thisClass.SuperClass;
      }
    return false;
    };

fyObject.prototype.isSuperClassOf=
  function(aClass)
    {
    do
      {
      aClass=aClass.SuperClass;
      if(this===aClass) return true;
      }
    while(aClass);
    return false;
    };

//
// Define a default application stub to bootstrap the application
//   for single application web pages.
//
function webApplication(mainFunction)
{
fyObject.defaultApplication()(mainFunction);
};
webApplication.isStub=true;
webApplication.main=
  function(mainFunction) {
    var app=fyApplication.Create();
    window.webApplication=app;
    app.main(mainFunction);
  };
//
//
fyObject.defaultApplication=(fyObject.prototype.defaultApplication=
  function() {
    var app=window.webApplication;
    if( (window.fyApplication) &&  
            ((!app)||(app.hasOwnProperty("isStub"))) )  {
      app=fyApplication.Create();
      window.webApplication=app;
    }
    return app;
  });


Object.defineProperty(Function.prototype, "subClass",  {
    value:
      function(/* SuperClass, application, initializeClassFunction */)  {
        var SuperClass=fyObject;
        var scope=window;
        var application;
        var initializeClassFunction;
        var newClass;

        if(arguments.length===0) {
          newClass=fyObject;
        } else {

          if(arguments.length===1) {

            initializeClassFunction=arguments[0];

          } else if(arguments.length===2) {

            if(arguments[0].hasOwnProperty("isClass")) {

              SuperClass=arguments[0];

            } else {

              scope=arguments[0];
              application=scope;

            }

            initializeClassFunction=arguments[1];

          } else {

            SuperClass=arguments[0];
            scope=arguments[1];
            application=scope;
            initializeClassFunction=arguments[2];
          }

          if(!application)
             application = SuperClass.defaultApplication();

          newClass = SuperClass.buildSubClass(this, application, initializeClassFunction);
        }

        scope[this.name]=newClass;
      },
    enumerable : false
  });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

fyApplicationObject=fyObject.buildSubClass("fyApplicationObject", undefined,
  function(nullApplication,$,isClass) {
    this.defineConstructor(
      function Create(application) {
      })
  });

fyApplicationObject.defaultApplication=(fyApplicationObject.prototype.defaultApplication=
  function() {
  //return undefined;
  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function TDefaultFunctionObject(){}).subClass(
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {

        this.defineMethod(
          function qdefault() {

          });
      });
  });


TDefaultFunctionObject.makeNewInstance=function() {
    var instance=
      function(){instance.qdefault.apply(instance,arguments);};

    if(Object.setPrototypeOf)
      Object.setPrototypeOf(instance,this.prototype)
    else
      instance.__proto__=this.prototype;

    return instance;
  };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

///////////

function formatNumber(N,DecPlcs) {
  try
    {
    var s=N.toFixed(DecPlcs);
    return(DecPlcs < 4?s.replace(/\B(?=(\d{3})+(?!\d))/g, ","):s);
    }
  catch(e)
    {
    return("");
    }
}

///////////

function formatRate(N,DecPlcs) {
  return formatNumber(N*100,DecPlcs)
}

///////////

function postLog(msg) {
  if (window.console && window.console.log) {window.console.log(msg);}
}

///////////

function isJSargumentsContainer(container) {
  return (typeof container==="object") && container.hasOwnProperty("length") && container.hasOwnProperty("callee");
}

function shiftArguments(args,n) {
  var a=Array.prototype.slice.call(args,n);
  a.callee=args.callee;
  return a;
}

///////////

function prefixArguments(prefix,args) {
  var newArgs=Array.prototype.slice.call(args);
  newArgs.unshift(prefix);
  return newArgs;
}
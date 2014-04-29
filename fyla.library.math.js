
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function randomInt(max)
{
return Math.floor(Math.random() * max);
}

///////////

function doubleDivide(N,D)
{
if(D===0)
   return 0;
else
   return N/D;
}

///////////

function minValue(D)

{
if(D.length<1) return;
var R=D[0];
for(var i=1,j=D.length;i<j;i++)
  R=(R>D[i])?D[i]:R;
return R;
}

function maxValue(D)

{
if(D.length<1) return;
var R=D[0];
for(var i=1,j=D.length;i<j;i++)
  R=(R<D[i])?D[i]:R;
return R;
}

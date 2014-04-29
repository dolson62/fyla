///////////

String.prototype.toInt=
  function()
  {
  //
  // You have to specify the radix (base 10) here so we're sure to stay inside this reality.
  //
  //   In ABG land, parseInt sometimes defaults to octal. Because, you know, octal
  //     is used all over the place.
  //
  //   Yes, you read that correctly.  OCTAL.  If the f-ing string starts with a zero
  //     character ("0") and the radix is omitted then it defaults to 8.
  //
  //   Thus:
  //
  //   str value    return value
  //   ---------    ------------
  //       000            0
  //       001            1
  //       002            2
  //       003            3
  //       004            4
  //       005            5
  //       006            6
  //       007            7
  //       008            0   <<  No, I'm not kidding  (might be NaN instead, not that it matters.)
  //       009            0   <<  Again, not kidding.
  //       010            8   <<  Still not kidding....
  //       011            9
  //       012            10
  //       013            11
  //       014            12
  //       015            13
  //       016            14
  //       017            15
  //       018            0   << You only have 8 fingers and 8 toes, right?
  //       019            0   << Oh...right...I guess you have "one-zero" fingers, so...close enough, eh?
  //       020            16
  //
  //
  return parseInt(this,10); //    <<<   OMFG.
  }
///////////

String.prototype.leftTrim=
  function(aChar)
  {
  var i;
  if((this.length===0) || (this[0]!==aChar))
    return this;
  else
    return this.substring(1);
  };


String.prototype.rightTrim=
  function(aChar)
  {
  var i;
  if((this.length===0) || (this[this.length-1]!==aChar))
    return this;
  else
    return this.substr(0,this.length-1);
  }

///////////

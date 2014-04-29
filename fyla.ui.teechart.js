//
//
// Wraps the TeeChart for Javascript library by Steema
//
//
(function fyChart(){}).subClass(fyCanvas,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$) {
        var thisProtected;

        this.defineConstructor(
          function Create($tag) {
            thisProtected=this.protectedData;
            this.inherited($tag);
            this.onInitializeChart(thisProtected.chart=new Tee.Chart(this.canvas));
          });

        this.defineProperties(
          {
          chart: {get:function(){return thisProtected.chart;}}
          });

        this.defineMethod(
          function onInitializeChart(chart) {

          });

        this.defineMethod(
          function update() {
            var args;
            (args=Array.prototype.slice.call(arguments)).unshift(thisProtected.chart);
            this.onUpdateChart.apply(this,args);
          });

        this.defineMethod(
          function onUpdateChart(chart) {

          });

      });

  });

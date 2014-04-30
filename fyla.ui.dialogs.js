
(function fyUIModalFramer(){}).subClass(fyFrame,
  function(application,$,isClass) {

    this.initializeInstanceWith(
      function(application,$)  {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(arguments);
            this.zIndex=-1;
            this.position={x:0,y:0};
            this.opacity=0;
            this.visible=false;
            this.display=this.animate.inSeconds(0.3).fade.in;

            var lid=fyPanel.Create(this);
            lid.position={x:0,y:0};
            lid.background="gray";
            lid.opacity=0.5;
            lid.zIndex=998;
            lid.id="modalLid";
            lid.onClick(this.modalLidClicked);
            thisProtected.lid=lid;
          });

        this.defineMethod(
          function showModal() {

            this.zIndex=997;
            var d=this.parent.dimensions;
            this.dimensions=d;
            thisProtected.lid.dimensions=d;
            this.display.run.forward();
          });

        this.defineMethod(
          function endModal(after) {

            var that=this;
            this.display.run.reverse.then(
              function() {
                that.zIndex=-1;
                if(after) after();
              });

          });

        this.defineMethod(
          function modalLidClicked() {
//alert("lid click");
          });



      });
  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function fyMessageBox(){}).subClass(fyFrame,
  function(application,$,isClass) {

    application.defineEnumeration(
          "fyModalResult", [
            {name:"mrCancel",text:"Cancel"}, 
            {name:"mrOK",text:"OK"}, 
            {name:"mrYes",text:"Yes"}, 
            {name:"mrNo",text:"No"},
            {name:"mrRetry",text:"Retry"},
            {name:"mrContinue",text:"Continue"}
          ]);


    this.initializeInstanceWith(
      function(application,$)  {
        var thisProtected;

        this.defineConstructor(
          function Create() {
            thisProtected=this.protectedData;
            this.inherited(application.modalFrame);

            thisProtected.dontAskAgain=false;

            this.zIndex=999;
            this.align="center";
            this.visible=false;

          });

        this.defineProperties({
          modalResult:{
            get:function(){return thisProtected.modalResult;},
            set:
              function(value) {
                that=this;
                thisProtected.modalResult=value;
                if(value!==0) {
                  this.parent.endModal(
                    function() {
                      that.visible=false;
                      thisProtected.modalComplete.resolve();
                    });
                }
              }
          }

        });

        this.defineMethod(
          function showModal(messageInfo) {

            thisProtected.modalResult=0;
            var modalComplete=(thisProtected.modalComplete=$.Deferred());
            if(messageInfo.onComplete)
              $.when(modalComplete).then(
                function() {
                  messageInfo.modalResult=thisProtected.modalResult;
                  messageInfo.dontAskAgain=thisProtected.dontAskAgain;
                  messageInfo.onComplete(messageInfo);
                });

            this.visible=true;
            this.parent.showModal();
          });

      });
  });

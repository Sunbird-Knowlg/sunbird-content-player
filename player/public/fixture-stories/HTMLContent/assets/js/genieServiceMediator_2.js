
var genieServiceMediator = (function(){
  var _callbackFunc;
  function initialize(){

    var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

    if(!isMobile){
      if(("undefined" == typeof AppConfig) && ("undefined" == typeof isbrowserpreview)){
        genieservice.getLocalData(function(){
          _callbackFunc();
        });    
      }    
    }else{
      loadCordova();                
    }
  };

  /* Load Cordova file for mobile only */
  function loadCordova(){
    loadJsFile("///android_asset/www/cordova.js", function(){
      document.addEventListener("deviceready", onDeviceReady, false); 
    });
  }

  /* Load js file */
  function loadJsFile(src, callbackFunc) {
    var fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", src);
    fileref.onload = function(){
      callbackFunc();
    }
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }

  /* Cordova plugins can access only on device ready state */
  function onDeviceReady(event){
    console.log("onDeviceReady()", event);  
    
    _callbackFunc();
  };

  return{
    init: function(callback){
      _callbackFunc = callback;
      initialize();
    }
  }
})();
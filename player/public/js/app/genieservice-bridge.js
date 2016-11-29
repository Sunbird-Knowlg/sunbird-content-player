
var genieServiceBridge = (function(){
  var _callbackFunc;
  function initialize(){

    var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

    if(!isMobile){
      if(("undefined" == typeof AppConfig) && ("undefined" == typeof isbrowserpreview)){
        var flavor = getUrlParameter('flavor');
        var launchData = JSON.parse(getUrlParameter('launchData'));
        if(flavor){
            genieservice = genieservice_portal;
            genieservice.api.setBaseUrl(launchData.envpath);
            _callbackFunc();
        }else{
          genieservice.getLocalData(function(){
            _callbackFunc();
          });
        }
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

  /** 
   * Get url parameter value
   * sPram: input url paramater name to get its value in url
   */
  function getUrlParameter(sParam) {
   var sPageURL = decodeURIComponent(window.location.search.substring(1)),
       sURLVariables = sPageURL.split('&'),
       sParameterName,
       i;
   for (i = 0; i < sURLVariables.length; i++) {
       sParameterName = sURLVariables[i].split('=');

       if (sParameterName[0] === sParam) {
           return sParameterName[1] === undefined ? true : sParameterName[1];
       }
   }
  }

  function exitContent() {
        // On close of the content call this function
        if ("undefined" != typeof cordova) {            
            window.location.href = "file:///android_asset/www/index.html#/content/end/" + this.getContentId();
        } else {
            window.location.href = '/#/content/end/'+this.getContentId() ;
        }
    }
    function getContentId(){
        return JSON.parse(localStorage.getItem("content")).identifier;
    }

  return{
    init: function(callback){
      _callbackFunc = callback;
      initialize();
    }
  }
})();

/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

window.org = {"ekstep": {} }
var RendererInterface = function() {

  var _parent = window.parent; 
  var _telemetryService =  _parent.TelemetryService;

  this.htmlInterfaceObj = {};
  this.htmlInterfaceObj.parent = _parent;
  this.htmlInterfaceObj.EkstepRendererAPI = _parent.EkstepRendererAPI;

  /**
   * Interface method to dispatch events to do some actions
   * @memberof org.ekstep.contentrenderer.interface
   */
  this.htmlInterfaceObj.dispatchEvent = function(eventName) {
    this.EkstepRendererAPI.dispatchEvent(eventName);
  };

  /**
   * Interface to Access Content Metadata
   * @param  {String} contentId identifier of the game
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.getcontentMetadata = function(contentId, cb){
    this.EkstepRendererAPI.getContentMetadata(contentId, function(){
      if(cb) cb();
    });
  };

  /**
   * Interface to access content-renderer configuration
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.getConfig = function(){
    this.EkstepRendererAPI.getGlobalConfig();
  };

  /**
   * Interface to log temetry interact(OE_INTERACT) event
   * @param  {Object} data: Telemetry event data
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.logTelemetryInteract = function(data){
    _telemetryService.interact(data.type, data.id, data.extype, data.eks);
  }

  /**
   * Interface to log telemetry xapi(OE_XAPI) event
   * @param  {Object} data: Telemetry event data
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.logTelemetryXapi = function(data){
    _telemetryService.xapi(data);
  }

  /**
   * Interface to Access Content Metadata
   * @param  {Object} data: Telemetry event data
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.logTelemetryAssess = function(data){
    _telemetryService.interact(data.type, data.id, data.extype, data.eks);
  }

  /**
   * Interface method to goto end page 
   * @memberof org.ekstep.contentrenderer.interface 
   */
  this.htmlInterfaceObj.gotoEndPage = function(){
    this.dispatchEvent("renderer:content:end");
  }

  /**
   * Interface is to verify the env of game is running 
   * @memberof org.ekstep.contentrenderer.interface
   */
  this.htmlInterfaceObj.isMobile = function(){
    return window.cordova ? true : false ;
  };

  /**
   * Interface is to exit the game 
   * @memberof org.ekstep.contentrenderer.interface
   */
  this.htmlInterfaceObj.exit = function(){
    this.parent.exitApp();
  };

  return this.htmlInterfaceObj;
};
org.ekstep.contentrenderer = window.parent.org.ekstep.contentrenderer;

// RI : Renderer Interface
org.ekstep.contentrenderer.interface = window.RI = new RendererInterface();
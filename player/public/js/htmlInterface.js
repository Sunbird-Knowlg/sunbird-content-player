/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

var html_renderer = function() {};
window.org = { ekstep: {} }
window.org.ekstep.htmlrenderer = new html_renderer();
window.org.ekstep.htmlrenderer.top  = window.top;
window.org.ekstep.htmlrenderer._ = window.top._;
window.org.ekstep.htmlrenderer.jQuery = window.top.$;

/**
 * To navigate to endPage
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.showEndPage = function() {
	org.ekstep.htmlrenderer.top.EkstepRendererAPI.showEndPage();
};
/**
 * To Access Canvas Renderer API's
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.api  = org.ekstep.htmlrenderer.top.EkstepRendererAPI;

/**
 * To enable Overlay on top of game
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.enableOverlay = function(){
	org.ekstep.htmlrenderer.api.showOverlay();
};

/**
 * To disable Overlay from top of game
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.disableOverlay = function(){
	org.ekstep.htmlrenderer.api.hideOverlay();
};

/**
 * To Hide the canvas endpage
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.hideEndPage = function(){
	org.ekstep.htmlrenderer.top.EkstepRendererAPI.hideEndPage();
};

/**
 * To Access HTML Service
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.service = function(){
	return org.ekstep.htmlrenderer.top.org.ekstep.service.html;
};

/**
 * To Access Telemetry service
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.telemetryService = org.ekstep.htmlrenderer.top.TelemetryService;

/**
 * To Access Content Metadata
 * @param  {String} contentId identifier of the game
 * @memberof org.ekstep.htmlrenderer
 */

org.ekstep.htmlrenderer.getcontentMetadata = function(contentId, cb){
	org.ekstep.htmlrenderer.top.org.ekstep.contentrenderer.getContentMetadata(contentId, function(){
		if(cb) cb();
	});
};

/**
 * To verify the env of game is running 
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.isCordovaEnv = function(){
	return window.cordova ? true : false ;
};

/**
 * To exit the game 
 * @memberof org.ekstep.htmlrenderer
 */
org.ekstep.htmlrenderer.exit = function(){
	org.ekstep.htmlrenderer.top.exitApp();
};












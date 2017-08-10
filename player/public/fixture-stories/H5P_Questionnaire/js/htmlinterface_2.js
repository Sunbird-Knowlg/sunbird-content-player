/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

var html_renderer = function() {};
window.org = { ekstep: {} }
org.ekstep.renderer = new html_renderer();
org.ekstep.renderer.html = window.parent;

/**
 * Interface to access canvas underscore lib 
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html._ = window.parent._;

/**
 * Interface to access canvas jquery lib
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.jQuery = window.parent.$;

/**
 *  Interface to access canvas angular lib
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.angular = window.parent.angular;


/**
 *  Interface to navigate to endPage
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.showEndPage = function() {
	org.ekstep.renderer.html.EkstepRendererAPI.showEndPage();
};

/**
 * Interface to Access Canvas Renderer API's
 * @memberof org.ekstep.renderer.html
 */
 org.ekstep.renderer.html.api  = org.ekstep.renderer.html.EkstepRendererAPI;



/**
 * Interface to enable Overlay on top of game
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.enableOverlay = function(){
	org.ekstep.renderer.html.api.dispatchEvent("renderer:overlay:show");
};

/**
 * Interface to disable Overlay from top of game
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.disableOverlay = function(){
	org.ekstep.renderer.html.api.dispatchEvent("renderer:overlay:hide");
};

/**
 * Interface to Hide the canvas endpage
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.hideEndPage = function(){
	org.ekstep.renderer.html.EkstepRendererAPI.hideEndPage();
};

/**
 * Interface to Access HTML Service
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.service = function(){
	return org.ekstep.renderer.html.org.ekstep.service.html;
};

/*
 * Interface to Access Telemetry service
 * @memberof org.ekstep.renderer.html
 */
 
org.ekstep.renderer.html.telemetryService = org.ekstep.renderer.html.TelemetryService;

/**
 *  Interface to exit the game 
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.contentService = function(){
	return org.ekstep.renderer.html.api.getService();
};

/**
 * Interface to Access Content Metadata
 * @param  {String} contentId identifier of the game
 * @memberof org.ekstep.renderer.html 
 */

org.ekstep.renderer.html.getcontentMetadata = function(contentId, cb){
	org.ekstep.renderer.html.org.ekstep.contentrenderer.getContentMetadata(contentId, function(){
		if(cb) cb();
	});
};

/**
 * Interface is to verify the env of game is running 
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.isCordovaEnv = function(){
	return window.cordova ? true : false ;
};

/**
 * Interface is to exit the game 
 * @memberof org.ekstep.renderer.html
 */
org.ekstep.renderer.html.exit = function(){
	org.ekstep.renderer.html.exitApp();
};













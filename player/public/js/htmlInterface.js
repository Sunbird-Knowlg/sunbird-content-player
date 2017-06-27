/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var html_renderer = function() {};
window.org.ekstep.htmlrenderer = new html_renderer();

window.org.ekstep.renderer.top = window.top;
/**
 * To navigate to endPage
 */
org.ekstep.htmlrenderer.showEndPage = function() {
	org.ekstep.renderer.top.EkstepRendererAPI.showEndPage();
};


/**
 * To Access Canvas Renderer API's
 */
org.ekstep.htmlrenderer.api  = org.ekstep.renderer.top.EkstepRendererAPI();

/**
 * To enable Overlay
 */
org.ekstep.htmlrenderer.enableOverlay = function(){
	org.ekstep.renderer.top.api.showOverlay();
};

/**
 * To disable Overlay
 */
org.ekstep.htmlrenderer.enableOverlay = function(){
	org.ekstep.renderer.top.api.hideOverlay();
};


/**
 * To Hide the canvas endpage
 */
org.ekstep.htmlrenderer.hideEndPage = function(){

};

/**
 * To Access HTML Service
 */
org.ekstep.htmlrenderer.services = org.ekstep.renderer.top.org.ekstep.service.html;

/**
 * To Access Telemetry service
 */
org.ekstep.htmlrenderer.telemetryService = org.ekstep.renderer.top.TelemetryService;

/**
 * To Access Content Metadata
 */
org.ekstep.htmlrenderer.getcontentMetadata = function(contentId){
	return org.ekstep.renderer.top.org.ekstep.contentrenderer.getContentMetadata(contentId);
}












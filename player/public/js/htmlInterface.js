/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

window.org.ekstep.htmlrenderer = window.top;
/**
 * To navigate to endPage
 */
org.ekstep.htmlrenderer.showEndPage = function() {
	org.ekstep.htmlrenderer.EkstepRendererAPI.showEndPage();
};


/**
 * To Access Canvas Renderer API's
 */
org.ekstep.htmlrenderer.api  = EkstepRendererAPI();

/**
 * To enable Overlay
 */
org.ekstep.htmlrenderer.enableOverlay = function(){
	org.ekstep.htmlrenderer.api.showOverlay();
};

/**
 * To disable Overlay
 */
org.ekstep.htmlrenderer.enableOverlay = function(){
	org.ekstep.htmlrenderer.api.hideOverlay();
};


/**
 * To Hide the canvas endpage
 */
org.ekstep.htmlrenderer.hideEndPage = function(){
	
};

/**
 * To Access HTML Service
 */
org.ekstep.htmlrenderer.services = org.ekstep.htmlrenderer.org.ekstep.service.html;

/**
 * To Access Telemetry service
 */
org.ekstep.htmlrenderer.telemetryService = org.ekstep.htmlrendere.TelemetryService;

/**
 * To Access Content Metadata
 */
org.ekstep.htmlrenderer.contentMetadat = org.ekstep.htmlrendere.org.ekstep.contentrenderer.getContentMetadata;












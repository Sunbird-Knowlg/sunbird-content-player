/**
 * List of events dispaching by GenieCanvas renderer.
 * any plugin can register for these events to perform specific action in plugin
 *
 * @class EkstepRendererEvents
 * @author Vinu Kumar V.S <vinu.kumar@tarento.com>
 */
org.ekstep.contentrenderer.events = {
		
		/** 
		 * 'renderer.player.init' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
		 * @memberof EkstepRendererEvents
		 */
		"renderer.player.init":  "renderer.player.init",
		/** 
		 * 'renderer.player.show' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
		 * @memberof EkstepRendererEvents
		 */
		"renderer.player.show":  "renderer.player.show",
		/** 
		 * 'renderer.player.init' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
		 * @memberof EkstepRendererEvents
		 */
		"renderer.player.hide":  "renderer.player.hide",
		/** 
		 * 'renderer.player.show' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
		 * @memberof EkstepRendererEvents
		 */
		"renderer.player.show":  "renderer.player.show",

		/**
		 * 'renderer:content:end' event will get dispatch once content is ended.
		 * @memberOf EkstepRendererEvents
		 */
		"renderer.content.end":  "renderer.player.end",

};

EkstepRendererEvents = org.ekstep.contentrenderer.events;
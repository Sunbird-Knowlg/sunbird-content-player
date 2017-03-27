/**
 * The EkStep Renderer API is the core interface of the plugins with the rest of the render framework. It allows the plugins
 * to access the framework resources, launch popups, and handle events raised by the framework. Plugins should not call any
 * other framework classes directly.
 * 
 * @class EkstepRendererAPI
 * @author Vinu Kumar <vinu.kumat@tarento.com>
 */
window.EkstepRendererAPI = {
	baseURL: "",
	/**
	 * Register an event listener callback function for the events raised by the framework.
	 * @param type {string} name of the event (e.g. org.ekstep.quickstart:configure)
	 * @param callback {function} callback function
	 * @param scope {object} the scope of the callback (use this)
	 * @memberof EkstepRendererAPI
	 */
	addEventListener: function(type, callback, scope) {
	    EventBus.addEventListener(type, callback, scope);
	},
	/**
	 * Fires an event to the framework, allowing other plugins who may have registered to receive the callback notification. All
	 * communication between the framework and other plugins is via the events.
	 * @param type {string} name of the event to fire (e.g. org.ekstep.quickstart:configure)
	 * @param data {object} event data to carry along with the notification
	 * @param target {object} the scope of the event (use this)
	 * @memberof EkstepRendererAPI
	 */
	dispatchEvent: function(type, data, target) {
	    EventBus.dispatchEvent(type, data, target);
	}
}
/**
 * Base endpage will get launched at the end of all stages.
 * Any plugin can overide the specific method to change the endpage behavior.
 * @class org.ekstep.contentrenderer.baseEndepage
 * @author Krushanu Mohapatra <krushanu.mohapatra@tarento.com>
 */

org.ekstep.contentrenderer.baseEndepage = Plugin.extend({

	_isAvailable: false,

	/**
* init of the launcher with the given manifest as data.
* @param data {object} return the manifest object data any launcher must extend initialize
* method to load the launcher in globally
* @memberof org.ekstep.contentrenderer.baseEndepage
*/
	init: function (data, parent, stage, theme) {
		var instance = this
		this._isAvailable = true
		/**
     * 'renderer:content:end' event will get dispatch once content ends (i.e. Once all stages/game is ends)
     * @example
     * It will be usefull to show endpage or perform some action once the content is ended.
     * @event 'renderer:content:end'
     * @fires 'renderer:content:end'
     * @memberof EkstepRendererEvents
     */
		EkstepRendererAPI.addEventListener("renderer:content:end", instance.contentEnd, instance)
		this.initialize(data)
	},

	/**
* Initializes of the launcher with the given data.
* @param data {object} return the manifest object data any launcher must extend initialize
* method to load the launcher in globally
* @memberof org.ekstep.contentrenderer.baseEndepage
*/
	initialize: function (data) {
		console.info("Base endepage is intializd")
	},

	/**
 * end of content listener
 * @memberof org.ekstep.contentrenderer.baseEndepage
 */
	contentEnd: function (evnt, instance) {
		if (this._isAvailable) {
			EkstepRendererAPI.dispatchEvent("renderer:overlay:hide")
			EkstepRendererAPI.dispatchEvent("renderer:player:hide")
		} else {
		}
	},

	/**
 * Clearing of the Lancher instace
 * @memberof org.ekstep.contentrenderer.baseEndepage
 */

	clear: function () {
		console.info("Clearing the launcher instance")
	}

})

/**
 * List of events dispaching by GenieCanvas renderer.
 * any plugin can register for these events to perform specific action in plugin
 *
 * @class EkstepRendererEvents
 * @author Vinu Kumar V.S <vinu.kumar@tarento.com>
 */
org.ekstep.contentrenderer.events = {

	/**
     * 'renderer:player:init' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
     * @memberof EkstepRendererEvents
     */
	"renderer:player:init": "renderer:player:init",

	/**
     * 'renderer:player:show' event will get dispatch after loading default & external injected plugins on GenieCanvas launch
     * @memberof EkstepRendererEvents
     */
	"renderer:player:show": "renderer:player:show",

	/**
     * 'renderer:player:hide' event to hide the player
     * @memberof EkstepRendererEvents
     */
	"renderer:player:hide": "renderer:player:hide",

	/**
     * 'renderer:content:end' event will get dispatch once content is ended.
     * @memberOf EkstepRendererEvents
     */
	"renderer:content:end": "renderer:content:end",

	/**
     * 'renderer:device:back' event will get dispatch once device back button is pressed
     * @memberOf EkstepRendererEvents
     */
	"renderer:device:back": "renderer:device:back",

	/**
     * 'renderer:contentclose:show' event to show the content close icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:contentclose:show": "renderer:contentclose:show",

	/**
     * 'renderer:contentclose:hide' event to hide the content close icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:contentclose:hide": "renderer:contentclose:hide",

	/**
     * 'renderer:overlay:mute' event to mute the audio's which is playing in content.
     * @memberOf EkstepRendererEvents
     */
	"renderer:overlay:mute": "renderer:overlay:mute",

	/**
     * 'renderer:overlay:mute' event to mute the audio's which is playing in content.
     * @memberOf EkstepRendererEvents
     */
	"renderer:overlay:unmute": "renderer:overlay:unmute",

	/**
     * 'renderer:content:replay' event to replay the current playing content.
     * @memberOf EkstepRendererEvents
     */
	"renderer:content:replay": "renderer:content:replay",

	/**
     * 'renderer:overlay:show' event to show the overlay.
     * @memberOf EkstepRendererEvents
     */
	"renderer:overlay:show": "renderer:overlay:show",

	/**
     * 'renderer:overlay:hide' event to hide the overlay.
     * @memberOf EkstepRendererEvents
     */
	"renderer:overlay:hide": "renderer:overlay:hide",

	/**
     * 'renderer:stagereload:show' event to show the stage reload icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:stagereload:show": "renderer:stagereload:show",

	/**
     * 'renderer:stagereload:hide' event to hide the stage reload icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:stagereload:hide": "renderer:stagereload:hide",

	/**
     * 'renderer:repo:create' event to create the repo instance to load the plugins.
     * @memberOf EkstepRendererEvents
     */
	"renderer:repo:create": "renderer:repo:create",

	/**
     * 'renderer:endpage:show' event to show the endpage.
     * @memberOf EkstepRendererEvents
     */
	"renderer:endpage:show": "renderer:endpage:show",

	/**
     * 'renderer:endpage:hide' event to hide the endpage.
     * @memberOf EkstepRendererEvents
     */
	"renderer:endpage:hide": "renderer:endpage:hide",

	/**
     * 'renderer:splash:show' event to show the splash screen.
     * @memberOf EkstepRendererEvents
     */
	"renderer:splash:show": "renderer:splash:show",

	/**
     * 'renderer:splash:hide' event to hide the splash screen.
     * @memberOf EkstepRendererEvents
     */
	"renderer:splash:hide": "renderer:splash:hide",

	/**
     * 'renderer:content:start' event will get dispatch once the content is started.
     * @memberOf EkstepRendererEvents
     */
	"renderer:content:start": "renderer:content:start",

	/**
     * 'renderer:telemetry:end' Event to end the telemetry.
     * @memberOf EkstepRendererEvents
     */
	"renderer:telemetry:end": "renderer:telemetry:end",

	/**
     * 'renderer:next:show' Event to show next navigation icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:next:show": "renderer:next:show",

	/**
     * 'renderer:next:hide' Event to hide next navigation icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:next:hide": "renderer:next:hide",

	/**
     * 'renderer:previous:show' Event to show previous navigation icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:previous:show": "renderer:previous:show",

	/**
     * 'renderer:previous:hide' Event to hide previous navigation icon.
     * @memberOf EkstepRendererEvents
     */
	"renderer:previous:hide": "renderer:previous:hide",

	/**
     * 'renderer:toast:show' Event to show the custom toast message.
     * @memberOf EkstepRendererEvents
     */
	"renderer:toast:show": "renderer:toast:show"

}

EkstepRendererEvents = org.ekstep.contentrenderer.events

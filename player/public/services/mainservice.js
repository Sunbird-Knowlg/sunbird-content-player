/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var RendererServices = function () {}
window.org.ekstep.service = new RendererServices()
RendererServices = undefined
//var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))

org.ekstep.service.mainService = Class.extend({
	getAPISlug: function () {
		var globalConfig = EkstepRendererAPI.getGlobalConfig()
		return globalConfig.apislug
	},
	init: function (config) {
		this.initService(config)
	},
	initService: function (config) {},
	initialize: function () {}
})
org.ekstep.service.init = function () {
	if (!isbrowserpreview && !_.isUndefined(isbrowserpreview)) {
		org.ekstep.service.renderer = genieservice
	}
}
// eslint-disable-next-line
telemetry_web = {
	tList: [],
	send: function (string) {
		console.log("V3 Telemetry Event - ", string)
		// EventBus.dispatch("telemetryEvent",string);
		return new Promise(function (resolve, reject) {
			// eslint-disable-next-line
                telemetry_web.tList.push(string)
			resolve(true)
		})
	}
}
// eslint-disable-next-line
if(_.isUndefined(isbrowserpreview)) telemetry = telemetry_web

org.ekstep.contentrenderer.webDispatcher = new (org.ekstep.contentrenderer.IDispatcher.extend({
	type: "webDispatcher",
	initDispatcher: function () {},
	dispatch: function (event) {
		event = (typeof event === "string") ? event : JSON.stringify(event)
		if (typeof telemetry !== "undefined") {
			EventBus.dispatch("telemetryEvent", event)
			EventBus.dispatch("questionsetEvent", event)
			telemetry.send(event).then(function () {
				return event
			}).catch(function (err) {
				if (err) {
					console.error("Error", err)
				}
				if (event.uid) { // TODO Find the Unknow events from(Jquery/cordova/ionic)
					// TelemetryService.logError(instance.name, err)
				} else {
					console.warn("uid is not Present", event)
				}
			})
		} else {
			console.log(event)
		}
	}
}))()

org.ekstep.contentrenderer.deviceDispatcher = new (org.ekstep.contentrenderer.IDispatcher.extend({
	type: "deviceDispatcher",
	initDispatcher: function () {},
	dispatch: function (event) {
		EventBus.dispatch("telemetryEvent", event)
		var eventStr = (typeof event === "string") ? event : JSON.stringify(event)
		telemetry.send(eventStr, "sendTelemetry")
	}
}))()

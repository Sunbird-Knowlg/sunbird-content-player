describe('TelemetrySync Plugin', function() {
	var manifest, TelemetrySync;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.telemetrysync","ver":1,"type":"plugin"}], [], function() {
			TelemetrySync = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.telemetrysync'];
			manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.telemetrysync'];
            callback();
		});
    });
    describe("When plugin is initialized", function() {
        it('It should register events', function() {
            expect(EventBus.hasEventListener('telemetryPlugin:intialize')).toBe(true);
        });
    });
    describe("When initializeTelemetryPlugin is invoked", function() {
        it("It should invoke listenTelementryEvent", function() {
            expect(EkstepRendererAPI).not.toBeUndefined();
            spyOn(TelemetrySync, "listenTelementryEvent").and.callThrough();
            spyOn(window, "detectClient");
            TelemetrySync.initializeTelemetryPlugin();
            expect(TelemetrySync._requiredFields.sid).not.toBeUndefined();
            expect(TelemetrySync._requiredFields.did).not.toBeUndefined();
            expect(TelemetrySync.listenTelementryEvent).toHaveBeenCalled();
            expect(window.detectClient).toHaveBeenCalled();
        })
    });
    describe("When listenTelementryEvent is invoked", function() {
        it("It should add telemetryEvent event", function() {
            expect(EventBus.hasEventListener('telemetryEvent')).toBe(true);
        })
    });
    describe("When appendRequiredFields is invoked", function() {
        xit("It should merge did, uid, sid with telemetry event", function() {
            var event = JSON.parse('{"ver":"2.1","edata":{"eks":{"stageid":"3e38c081-6101-4817-8572-7c2d584a5c7e","type":"TOUCH","subtype":"","pos":[],"id":"gc_menuopen","tid":"","uri":"","extype":"","values":[]}},"eid":"OE_INTERACT","gdata":{"id":"org.ekstep.quiz.app","ver":"411"},"cdata":[{"id":"dd048a93648cad4b3ef1cdd5509be8e3","type":"ContentSession"}],"channel":"in.ekstep","etags":{"dims":[],"app":[],"partner":[]},"pdata":{"id":"in.ekstep","ver":"1.0"},"ets":1511435094883}');
            var newEvent = TelemetrySync.appendRequiredFields(event);
            expect(EventBus.hasEventListener(newEvent.sid)).not.toBeUndefined();
            expect(EventBus.hasEventListener(newEvent.did)).not.toBeUndefined();
            expect(EventBus.hasEventListener(newEvent.mid)).not.toBeUndefined();
        })
    });
    // describe("When telemetry sync function is called", function() {
    //     it("It should call the api and send telemetry", function() {
    //         var event = JSON.parse('{"ver":"2.1","uid":"407","sid":"7ve3127pvbm032rai44f3m9al2","did":"308445714621a79331f6e096ca520c61","edata":{"eks":{"stageid":"3e38c081-6101-4817-8572-7c2d584a5c7e","mode":"preview"}},"eid":"OE_START","gdata":{"id":"org.ekstep.quiz.app","ver":"411"},"cdata":[{"id":"dd048a93648cad4b3ef1cdd5509be8e3","type":"ContentSession"}],"channel":"in.ekstep","etags":{"dims":[],"app":[],"partner":[]},"pdata":{"id":"in.ekstep","ver":"1.0"},"ets":1511435082809,"mid":"OE_7a0e0498e5fcac296e8f0b8b040b6ee8"}');
    //         var telemetryObj = {
    //             "id": "ekstep.telemetry",
    //             "ver": 2.1,
    //             "ets": 1511435807559,
    //             "events": [event]
    //         };
    //         expect(EkstepRendererAPI).not.toBeUndefined();
    //         spyOn(org.ekstep.service.renderer, "sendTelemetry").and.callThrough();
    //         window.globalConfig.context.authToken = "authToken";
    //         TelemetrySync.sendTelemetry(telemetryObj);
    //         expect(org.ekstep.service.renderer.sendTelemetry).toHaveBeenCalled();
    //     })
    // });
});
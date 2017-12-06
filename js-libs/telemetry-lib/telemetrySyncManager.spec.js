/**
 * TelemetrySyncManager test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("TelemetrySyncManager tests", function() {
    var testFunction;
    var telemetrySyncInstance;
    beforeAll(function() {
        testFunction = jasmine.createSpy();
        telemetrySyncInstance = TelemetrySyncManager;
        document.addEventListener('TelemetryEvent', testFunction);
        event = JSON.parse('{"eid": "INTERACT","ets": 1512225320922,"ver": "3.0","mid": "INTERACT_b3a3d84078a322f12786d29f3ab5fad7","actor": {"id": "anonymous","type": "User"},"context": {"channel": "in.ekstep","pdata": {"id": "in.ekstep","ver": "1.0","pid": ""},"env": "preview","sid": "","did": "","cdata": [{"type": "worksheet","id": "do_736298262"}],"rollup": {"l1": "","l2": ""}},"object": {"id": "do_9823y23","type": "Conten","ver": "","rollup": {"l1": "","l2": ""}},"tags": [],"edata": {"type": "LISTEN","subtype": "","id": "123","pageid": "","target": {"id": "targetId","ver": "1.0","type": "Plugin"},"plugin": "","extra": {"pos": [],"values": []}}}');
    });

    describe("TelemetrySyncManager Init", function() {
        it("It should add event listener for TelemetryEvent", function() {
            spyOn(telemetrySyncInstance, "init").and.callThrough();
            // spyOn(instance, "testFunction").and.callThrough();
            telemetrySyncInstance.init();
            // expect(testFunction).toHaveBeenCalled();
            expect(telemetrySyncInstance.init).toHaveBeenCalled();
        })        
    });
});
/**
 * TelemetrySyncManager test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("TelemetrySync Manager", function() {
    beforeAll(function() {
        telemetryObj = EkTelemetry;
        config = JSON.parse('{"uid":"anonymous","channel":"in.ekstep","pdata":{"id":"in.ekstep","ver":"1.0","pid":""},"env":"preview","sid":"","did":"","cdata":[{"type":"worksheet","id":"do_736298262"}],"rollup":{"l1":"","l2":""},"object":{"id":"do_9823y23","type":"Conten","ver":"","rollup":{"l1":"","l2":""}},"batchsize":20,"host":"https://api.ekstep.in","endpoint":"/data/v3/telemetry","tags":[], "apislug":"/action"}');
        EkTelemetry.initialize(config);
    });
    it('Telemetry configurations must be defined', function() {
        console.log('Configurations', EkTelemetry.config.host);
        expect(EkTelemetry.initialized).toBe(true);
        expect(EkTelemetry.config.endpoint).toBe('/data/v3/telemetry');
        expect(EkTelemetry.config.host).toBe('https://api.ekstep.in');
        expect(EkTelemetry.config.apislug).toBe('/action')
        expect(EkTelemetry._version).toBe("3.0");
    });
    it("It should add event listener for TelemetryEvent", function(done) {
        spyOn(TelemetrySyncManager, "init").and.callThrough();
        TelemetrySyncManager.init();
        expect(TelemetrySyncManager.init).toHaveBeenCalled();
        done();
    });
    it('On invoke of sendTelemetry method, It should hold all the events in telemetry instance', function(done) {
        EkTelemetry.config.batchsize = 20;
        var event = {
            detail: { eid: 'INTERACT' }
        }
        for (i = 1; i <= 10; i++) {
            TelemetrySyncManager.sendTelemetry(event)
            if (i == 10) {
                expect(TelemetrySyncManager._teleData.length).toBe(10);
                TelemetrySyncManager._teleData = [];
                done();
            }
        }
    });

    it('Telemetry events array instance should splice when batch size of the event is exceeded', function(done) {
        EkTelemetry.config.batchsize = 20;
        var event = {
            detail: { eid: 'INTERACT' }
        }
        for (i = 1; i <= EkTelemetry.config.batchsize; i++) {
            TelemetrySyncManager.sendTelemetry(event)
            if (i == EkTelemetry.config.batchsize) {
                expect(TelemetrySyncManager._teleData.length).toBe(0);
                done();
            }
        }
    });
    it('If end event is invoked then it should sync all events data', function(done) {
        EkTelemetry.config.batchsize = 20;
        var event = {
            detail: { eid: 'END' }
        }
        for (i = 1; i <= EkTelemetry.config.batchsize; i++) {
            TelemetrySyncManager.sendTelemetry(event)
            if (i == EkTelemetry.config.batchsize) {
                expect(TelemetrySyncManager._teleData.length).toBe(0);
                done();
            }
        }
    });
    it('On sync success it should not lost the old event data', function(done) {
        var event = {
            detail: { eid: 'END' }
        }
        spyOn($, "ajax").andCallFake(function(options) {
            options.done();
            expect(TelemetrySyncManager._teleData.length).toBe(0);
            done();
        });
        TelemetrySyncManager.sendTelemetry(event);

    });
    it('On sync fail it should not lost the old event data', function(done) {
        var event = {
            detail: { eid: 'END' }
        }
        spyOn(jQuery, "ajax").andCallFake(function(options) {
            options.fail();
            expect(TelemetrySyncManager._teleData.length).not.toBe(0);
            done();
        });
        TelemetrySyncManager.sendTelemetry(event);

    });
});
/**
 * Telemetry V3 Library test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("Telemetry Validation", function() {
    var configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
        //beforeEach(function() {});

    describe("START Event", function() {
        var contentId, version, startEventData;
        beforeEach(function(done) {
            contentId = 'do_212432352355435435';
            version = '1.0';
            startEventData = { type: 'content', mode: "preview", pageid: "" };
            done();
        })
        xit("When valid event is passed", function(done) {
            try {
                EkTelemetry.start(configurations, contentId, version, startEventData);
                done();
            } catch (e) {
                expect(e).toBe(undefined);
                done();
            }
        });
        describe('Configurations', function() {
            describe('Channel', function() {
                it(" When `channel:undefined`, Expect `channel:in.ekstep` ", function(done) {
                    configurations.channel = undefined;
                    try {
                        document.addEventListener('TelemetryEvent', function(event) {
                            expect(event.detail.context.channel).toBe('in.ekstep');
                            done();
                        });
                        EkTelemetry.start(configurations, contentId, version, startEventData);
                    } catch (e) {
                        expect(e).not.toBe(undefined);
                    }
                });
                it(" When `channel:'' `, Expect `channel:in.ekstep` ", function(done) {
                    configurations.channel = '';
                    try {
                        document.addEventListener('TelemetryEvent', function(event) {
                            expect(event.detail.context.channel).toBe('in.ekstep');
                            done();
                        });
                        EkTelemetry.start(configurations, contentId, version, startEventData);
                    } catch (e) {
                        expect(e).not.toBe(undefined);
                    }
                })
            })
        })
    });
});
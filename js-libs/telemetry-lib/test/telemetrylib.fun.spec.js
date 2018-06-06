/**
 * Telemetry V3 Library test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("Telemetry Validation", function() {
    var configurations;
    var cb;
    var eventData;
    var telemetryEventSuccess = function(event) {
        cb(event.detail)
    }
    beforeEach(function() {
        cb = undefined;
        document.removeEventListener('TelemetryEvent', telemetryEventSuccess);
    });

    describe("START Event", function() {
        var contentId, version, eventData;
        var callStartEvent = function(callback) {
            cb = callback;
            try {
                document.addEventListener('TelemetryEvent', telemetryEventSuccess);
                EkTelemetry.start(configurations, contentId, version, startEventData);
            } catch (e) {
                expect(e).not.toBe(undefined);
            }
        }

        beforeEach(function(done) {
            //console.log("parent");
            configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
            contentId = 'do_212432352355435435';
            version = '1.0';
            startEventData = { type: 'content', mode: "preview", pageid: "" };
            done();
        })
        xit("When valid event is passed", function(done) {
            try {
                EkTelemetry.start(configurations, contentId, version, eventData);
                done();
            } catch (e) {
                expect(e).toBe(undefined);
                done();
            }
        });
        describe('Configurations', function() {
            beforeEach(function(done) {
                EkTelemetry.initialized = false;
                configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
                done();
            });

            describe('Channel', function() {
                it(" When `channel:undefined`, Expect `channel:in.ekstep` ", function(done) {
                    configurations.channel = undefined;
                    callStartEvent(function(eventData) {
                        expect(eventData.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it(" When `channel:x`, Expect `channel:x` ", function(done) {
                    configurations.channel = 'x';
                    callStartEvent(function(eventData) {
                        expect(eventData.context.channel).toBe('x');
                        done();
                    });
                });
                xit(" When `channel:'' `, Expect `channel:in.ekstep` ", function(done) {
                    configurations.channel = '';
                    try {
                        document.addEventListener('TelemetryEvent', function(event) {
                            expect(event.detail.context.channel).toBe('in.ekstep');
                            done();
                        });
                        EkTelemetry.start(configurations, contentId, version, eventData);
                    } catch (e) {
                        expect(e).not.toBe(undefined);
                    }
                })
            })
        })
    });
    describe("END Event", function() {
        var callEndEvent = function(callback) {
            cb = callback;
            try {
                document.addEventListener('TelemetryEvent', telemetryEventSuccess);
                EkTelemetry.end(eventData, {});
            } catch (e) {
               	cb(e);
            }
        }

        beforeEach(function(done) {
            eventData = {"type":"content","pageid":"splash","summary":[{"progress":50}]};
            done();
        })
        it(" When `valid`, Expect `no error` ", function(done) {
            callEndEvent(function(response) {
                expect(response).toBeDefined();
                done();
            });
        });
        it(" When `invalid`, Expect `throw error` ", function(done) {
        	eventData.type = undefined;
            callEndEvent(function(error) {
                expect(error).not.toBeDefined();
                console.log("Error Message",error);
                expect(error.split(' ')).toContain('Invalid');
                done();
            });
        });


    });
});
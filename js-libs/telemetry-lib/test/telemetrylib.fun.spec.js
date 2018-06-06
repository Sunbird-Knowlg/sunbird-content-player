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
                EkTelemetry.start(configurations, contentId, version, eventData);
            } catch (e) {
                expect(e).not.toBe(undefined);
            }
        }

        beforeEach(function(done) {
            //console.log("parent");
            configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
            contentId = 'do_212432352355435435';
            version = '1.0';
            eventData = { type: 'content', mode: "preview", pageid: "" };
            done();
        })
        describe('Configurations', function() {
            beforeEach(function(done) {
                EkTelemetry.initialized = false;
                configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
                done();
            });

            describe('Channel', function() {
                it(" When `channel: undefined`, Expect `channel:in.ekstep` ", function(done) {
                    configurations.channel = undefined;
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it(" When `channel: null `, Expect `channel: in.ekstep` ", function(done) {
                    configurations.channel = null;
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it(" When `channel: ' ' `, Expect `channel: in.ekstep` ", function(done) {
                    configurations.channel = ' ';
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it(" When `channel: x`, Expect `channel:x` ", function(done) {
                    configurations.channel = 'x';
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('x');
                        done();
                    });
                });
            });
            describe('Env', function() {
                it(" When `env: null`, Expect `env: ContentPlayer` ", function(done) {
                    configurations.env = null;
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('ContentPlayer');
                        done();
                    });
                });
                it(" When `env: undefined `, Expect `env: ContentPlayer` ", function(done) {
                    configurations.env = undefined;
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('ContentPlayer');
                        done();
                    });
                });
                it(" When `env: ' ' `, Expect `env: ' ' ` ", function(done) {
                    configurations.env = ' ';
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe(' ');
                        done();
                    });
                });
                it(" When `env: preview`, Expect `env:preview` ", function(done) {
                    configurations.env = 'preview';
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('preview');
                        done();
                    });
                });
            });

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
            eventData = { "type": "content", "pageid": "splash", "summary": [{ "progress": 50 }] };
            done();
        })
        it(" When `valid`, Expect `no error` ", function(done) {
            callEndEvent(function(res) {
                expect(res).toBeDefined();
                done();
            });
        });
        it(" When `invalid`, Expect `throw error` ", function(done) {
            eventData.type = undefined;
            callEndEvent(function(error) {
                expect(error).not.toBeDefined();
                //var errors = error.split(' ');
                console.log("Errors", errors);
                expect(error).toMatch(/'type'/);
                done();
            });
        });


    });
    describe("ASSESS Event", function() {
        var callAssessEvent = function(callback) {
            cb = callback;
            try {
                document.addEventListener('TelemetryEvent', telemetryEventSuccess);
                EkTelemetry.assess(eventData, {});
            } catch (e) {
                cb(e);
            }
        }
        beforeEach(function(done) {
            eventData = {"item":{"id":"wings.en.A.2","maxscore":1,"exlength":0,"params":[],"uri":"","title":"Write in numerals","mmc":[],"mc":[],"desc":""},"index":1,"pass":"No","score":1,"resvalues":[],"duration":141};
            done();
        })
        it(" When `valid`, Expect `no error` ", function(done) {
            callAssessEvent(function(res) {
                expect(res).toBeDefined();
                done();
            });
        });
        it(" When `invalid`, Expect `throw error` ", function(done) {
            eventData.item = undefined;
            callAssessEvent(function(error) {
                expect(error).toBeDefined();
                var errors = error.split(' ');
                console.log("Errors", errors);
                expect(errors).toMatch(/'item'/);
                done();
            });
        });
    });
});
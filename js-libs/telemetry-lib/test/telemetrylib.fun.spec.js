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
                cb(e);
            }
        }

        beforeEach(function(done) {
            configurations = { "uid": "anonymous", "channel": "in.ekstep", "pdata": { "id": "in.ekstep", "ver": "1.0", "pid": "" }, "env": "preview", "sid": "", "did": "", "cdata": [{ "type": "worksheet", "id": "do_736298262" }], "rollup": { "l1": "", "l2": "" }, "object": { "id": "do_9823y23", "type": "Conten", "ver": "", "rollup": { "l1": "", "l2": "" } }, "batchsize": 20, "host": "https://api.ekstep.in", "endpoint": "/data/v3/telemetry", "tags": [], "apislug": "/action" }
            contentId = 'do_212432352355435435';
            version = '1.0';
            eventData = { type: 'content', mode: "preview", pageid: "" };
            done();
        })
        describe('Configurations', function() {
            beforeEach(function(done) {
                EkTelemetry.initialized = false;
                done();
            });
            describe('Env', function() {
                it(" When env: null, Expect env: ContentPlayer", function(done) {
                    configurations.env = null;
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('ContentPlayer');
                        done();
                    });
                });
                it(" When env: undefined, Expect env: ContentPlayer", function(done) {
                    configurations.env = undefined;
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('ContentPlayer');
                        done();
                    });
                });
                it(' When env: " " , Expect env: "ContentPlayer "', function(done) {
                    configurations.env = "";
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('ContentPlayer');
                        done();
                    });
                });
                it(" When env: preview, Expect env: preview ", function(done) {
                    configurations.env = 'preview';
                    callStartEvent(function(res) {
                        expect(res.context.env).toBe('preview');
                        done();
                    });
                });
            });
            describe('Channel', function() {
                it("When channel: undefined, Expect channel: in.ekstep", function(done) {
                    configurations.channel = undefined;
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it("When channel: null , Expect channel: in.ekstep", function(done) {
                    configurations.channel = null;
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it('When channel: " " , Expect channel: in.ekstep', function(done) {
                    configurations.channel = "";
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('in.ekstep');
                        done();
                    });
                });
                it(" When channel: in.sunbird, Expect channel: in.sunbird ", function(done) {
                    configurations.channel = 'x';
                    callStartEvent(function(res) {
                        expect(res.context.channel).toBe('x');
                        done();
                    });
                });
            });

        })
        describe('Event Data', function() {
            it('When valid event, Expect no error', function(done) {
                callStartEvent(function(res) {
                    expect(res).not.toBe(undefined);
                    expect(res.eid).toBe('START')
                    done();
                });
            })
            describe('type', function() {
                it('When type: undefined, Expect error: type is required ', function(done) {
                    eventData.type = undefined;
                    callStartEvent(function(err) {
                        expect(err).not.toBe(undefined);
                        expect(err.split(' ')).toContain("Invalid");
                        done();
                    });
                });
                it('When type: null, Expect error: type is required', function(done) {
                    eventData.type = null;
                    callStartEvent(function(err) {
                        expect(err).not.toBe(undefined);
                        expect(err.split(' ')).toContain("Invalid");
                        done();
                    });
                });
                it('When type: " ", Expect error: type is required', function(done) {
                    eventData.type = null;
                    callStartEvent(function(err) {
                        expect(err).not.toBe(undefined);
                        expect(err.split(' ')).toContain("Invalid");
                        done();
                    });
                });
                it('When type: content, Expect type: content', function(done) {
                    eventData.type = 'content';
                    callStartEvent(function(res) {
                        expect(res).not.toBe(undefined);
                        expect(res.edata.type).toBe('content');
                        done();
                    });
                });
            })
            describe('Mode', function() {
                it('When mode: preview, Expect mode: preview ', function(done) {
                    eventData.mode = 'preview';
                    callStartEvent(function(res) {
                        expect(res).not.toBe(undefined);
                        expect(res.edata.mode).toBe('preview');
                        done();
                    });
                });
                it('When mode: undefined, Expect mode: undefined ', function(done) {
                    eventData.mode = undefined;
                    callStartEvent(function(res) {
                        expect(res).not.toBe(undefined);
                        expect(res.edata.mode).toBe(undefined);
                        done();
                    });
                });
                it('When mode: " ", Expect mode: " " ', function(done) {
                    eventData.mode = '';
                    callStartEvent(function(res) {
                        expect(res).not.toBe("");
                        expect(res.edata.mode).toBe("");
                        done();
                    });
                });
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
            eventData = { "type": "content", "pageid": "splash", "summary": [{ "progress": 50 }] };
            done();
        })
        it(" When valid event, Expect no error ", function(done) {
            callEndEvent(function(res) {
                expect(res).toBeDefined();
                done();
            });
        });
        it(" When type: undefined, Expect error: Invalid ", function(done) {
            eventData.type = undefined;
            callEndEvent(function(err) {
                expect(err).toBeDefined();
                expect(err.split(' ')).toContain("Invalid");
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
            eventData = { "item": { "id": "wings.en.A.2", "maxscore": 1, "exlength": 0, "params": [], "uri": "", "title": "Write in numerals", "mmc": [], "mc": [], "desc": "" }, "index": 1, "pass": "No", "score": 1, "resvalues": [], "duration": 141 };
            done();
        })
        it(" When valid event, Expect no error ", function(done) {
            callAssessEvent(function(res) {
                expect(res).toBeDefined();
                expect(res.eid).toBe('ASSESS')
                done();
            });
        });
        describe('item', function() {
            it("When item: object, Expect no error", function(done) {
                callAssessEvent(function(res) {
                    expect(res.edata.item).toBeDefined();
                    done();
                });
            });
            it("When item: undefined, Expect error: item is required", function(done) {
                eventData.item = undefined;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    var errors = error.split(' ');
                    expect(errors).toMatch(/'item'/);
                    done();
                });
            });
            it("When item: '', Expect error: item is required", function(done) {
                eventData.item = '';
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When item: null, Expect error: item is required", function(done) {
                eventData.item = null;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
        });
        describe('pass', function() {
            it("When pass: yes, Expect no error", function(done) {
                eventData.pass = "yes";
                callAssessEvent(function(res) {
                    console.log('pass return ', res);
                    expect(res.edata.pass).toEqual("Yes");
                    done();
                });
            });
            it("When pass: undefined, Expect error: pass is required", function(done) {
                eventData.pass = undefined;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When pass: '', Expect error: pass is required", function(done) {
                eventData.pass = '';
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When pass: null, Expect error: pass is required", function(done) {
                eventData.pass = null;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
        });
        describe('score', function() {
            it("When score: object, Expect no error", function(done) {
                callAssessEvent(function(res) {
                    expect(res.edata.pass).toBeDefined();
                    done();
                });
            });
            it("When score: object, Expect no error", function(done) {
                callAssessEvent(function(res) {
                    expect(res.edata.pass).toBeDefined();
                    done();
                });
            });
            it("When score: undefined, Expect error: score is required", function(done) {
                eventData.score = undefined;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When score: '', Expect error: score is required", function(done) {
                eventData.score = '';
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When score: null, Expect error: score is required", function(done) {
                eventData.score = null;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
        });
        describe('duration', function() {
            it("When duration: undefined, Expect error: duration is required", function(done) {
                eventData.duration = undefined;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When duration: '', Expect error: duration is required", function(done) {
                eventData.duration = '';
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When duration: null, Expect error: duration is required", function(done) {
                eventData.duration = null;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
        });
        describe('resvalues', function() {
            it("When resvalues: undefined, Expect error: resvalues is required", function(done) {
                eventData.resvalues = undefined;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When resvalues: '', Expect error: resvalues is required", function(done) {
                eventData.resvalues = ' ';
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
            it("When resvalues: null, Expect error: resvalues is required", function(done) {
                eventData.resvalues = null;
                callAssessEvent(function(error) {
                    expect(error).toBeDefined();
                    expect(error.split(' ')).toContain("Invalid");
                    done();
                });
            });
        });
        describe('index', function() {
            it("When index: undefined, Expect no error", function(done) {
                eventData.index = undefined;
                callAssessEvent(function(res) {
                    expect(res).toBeDefined();
                    done();
                });
            });
            it("When index: '', Expect no error", function(done) {
                eventData.index = '';
                callAssessEvent(function(res) {
                    expect(res).toBeDefined();
                    done();
                });
            });
            it("When index: null, Expect no error", function(done) {
                eventData.index = null;
                callAssessEvent(function(res) {
                    expect(res).toBeDefined();
                    done();
                });
            });
        });
    });
});
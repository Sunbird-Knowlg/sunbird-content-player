/**
 * Telemetry V3 Library test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("Telemetry tests", function() {
    var telemetryObj, config, newConfig;
    this.testFunction = function(data) {
        console.log(data.detail.eid, "  Telemetry is generated");
    }
    document.addEventListener('TelemetryEvent', this.testFunction);
    var instance = this;
    beforeAll(function() {
        telemetryObj = EkTelemetry;
        config = JSON.parse('{"uid":"anonymous","channel":"in.ekstep","pdata":{"id":"in.ekstep","ver":"1.0","pid":""},"env":"preview","sid":"","did":"","cdata":[{"type":"worksheet","id":"do_736298262"}],"rollup":{"l1":"","l2":""},"object":{"id":"do_9823y23","type":"Conten","ver":"","rollup":{"l1":"","l2":""}},"batchsize":20,"host":"https://api.ekstep.in","endpoint":"/data/v3/telemetry","tags":[],"apislug":"/action"}');
    });

    describe("Telemetry START", function() {
        it("It should not call init if config spec is invalid", function() {
            var newConfig = JSON.parse(JSON.stringify(config));
            delete newConfig.uid;
            data = JSON.parse('{ "type": "player" }');
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(newConfig, "abc", "123", data);
            expect(telemetryElement).toBeUndefined();
            expect(EkTelemetry.initialized).not.toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();
        })
        it("It should not call init if pdata spec is invalid in config", function() {
            var newConfig = JSON.parse(JSON.stringify(config));
            delete newConfig.pdata.id;
            data = JSON.parse('{ "type": "player" }');
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(newConfig, "abc", "123", data);
            expect(telemetryElement).toBeUndefined();
            expect(EkTelemetry.initialized).not.toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();
        })
        it("It should not call init if object spec is invalid in config", function() {
            var newConfig = JSON.parse(JSON.stringify(config));
            delete newConfig.object.id;
            data = JSON.parse('{ "type": "player" }');
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(newConfig, "abc", "123", data);
            expect(telemetryElement).toBeUndefined();
            expect(EkTelemetry.initialized).not.toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();
        })
        it("It should not call init if required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(config, "abc", "123", data);
            expect(telemetryElement).toBeUndefined();
            expect(EkTelemetry.initialized).not.toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();

        })
        it("It should invoke init", function() {
            data = JSON.parse('{ "type": "player" }');
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(config, "abc", "123", data);
            expect(telemetryElement).not.toBeUndefined();;
            expect(EkTelemetry.initialized).toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();
        })
        it("It should not call init if telemetry is already running", function() {
            data = JSON.parse('{ "type": "player" }');
            spyOn(telemetryObj, "start").and.callThrough();
            var telemetryElement = telemetryObj.start(config, "abc", "123", data);
            expect(telemetryElement).toBeUndefined();
            expect(EkTelemetry.initialized).toBeTruthy();
            expect(telemetryObj.start).toHaveBeenCalled();

        })

    });

    describe("Telemetry IMPRESSION", function() {
        it("It should invoke impression", function() {
            data = JSON.parse('{"type": "view","pageid": "567","uri": "/content/preview/do_23833","visits": {"objid":"123","objtype":"story"}}')
            spyOn(telemetryObj, "impression").and.callThrough();
            // spyOn(instance, "testFunction").and.callThrough();
            telemetryObj.impression(data.pageid, data.type, undefined, data.uri, data.visits);
            expect(telemetryObj.impression).toHaveBeenCalled();
            // expect(instance.testFunction).toHaveBeenCalled();
        });
        it("It should return if the required spec is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "impression").and.callThrough();
            var telemetryImpression = telemetryObj.impression(data.pageid, data.type, undefined, data.uri, data.visits);
            expect(telemetryObj.impression).toHaveBeenCalled();
            expect(telemetryImpression).toBeUndefined();
        });
        it("It should return if visit spec is invalid", function() {
            data = JSON.parse('{"type": "view","pageid": "567","uri": "/content/preview/do_23833","visits": {"objid":"123"}}');
            spyOn(telemetryObj, "impression").and.callThrough();
            var telemetryImpression = telemetryObj.impression(data.pageid, data.type, undefined, data.uri, data.visits);
            expect(telemetryObj.impression).toHaveBeenCalled();
            expect(telemetryImpression).toBeUndefined();
        });
    });

    describe("Telemetry INTERACT", function() {
        it("It should invoke interact", function() {
            data = JSON.parse('{"type": "LISTEN","id": "123","target": {"id": "targetId","ver": "1.0","type": "Plugin"},"spec": {"id": "targetId","ver": "1.0"}}')
            spyOn(telemetryObj, "interact").and.callThrough();
            telemetryObj.interact(data);
            expect(telemetryObj.interact).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {}
            spyOn(telemetryObj, "interact").and.callThrough();
            var telemetryInteract = telemetryObj.interact(data);
            expect(telemetryObj.interact).toHaveBeenCalled();
            expect(telemetryInteract).toBeUndefined();
        });
        it("It should return if target spec is invalid", function() {
            data = JSON.parse('{"type": "LISTEN","id": "123","target": {"id": "targetId","ver": "1.0"}}');
            spyOn(telemetryObj, "interact").and.callThrough();
            var telemetryInteract = telemetryObj.interact(data);
            expect(telemetryObj.interact).toHaveBeenCalled();
            expect(telemetryInteract).toBeUndefined();
        });
        it("It should return if plugin spec is invalid", function() {
            data = JSON.parse('{"type": "LISTEN","id": "123","spec": {"id": "targetId"}}');
            spyOn(telemetryObj, "interact").and.callThrough();
            var telemetryInteract = telemetryObj.interact(data);
            expect(telemetryObj.interact).toHaveBeenCalled();
            expect(telemetryInteract).toBeUndefined();
        });
    });

    describe("Telemetry ASSESS", function() {
        it("It should invoke assess", function() {
            data = JSON.parse('{"item": {"id":"123","maxscore":"1","exlength":"1.23","desc":"description","title":"title"},"pass": "true","score": "100","resvalues": [{"lhs":"9"}],"duration":"121212121"}');
            spyOn(telemetryObj, "assess").and.callThrough();
            telemetryObj.assess(data);
            expect(telemetryObj.assess).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "assess").and.callThrough();
            var telemetryAssess = telemetryObj.assess(data);
            expect(telemetryObj.assess).toHaveBeenCalled();
            expect(telemetryAssess).toBeUndefined();
        });
        it("It should return if the question spec is invalid", function() {
            data = JSON.parse('{"item": {"id":"123","maxscore":"1","exlength":"1.23","desc":"description"},"pass": "true","score": "100","resvalues": [{"lhs":"9"}],"duration":"121212121"}')
            spyOn(telemetryObj, "assess").and.callThrough();
            var telemetryAssess = telemetryObj.assess(data);
            expect(telemetryObj.assess).toHaveBeenCalled();
            expect(telemetryAssess).toBeUndefined();
        });
    });

    describe("Telemetry RESPONSE", function() {
        it("It should log telemetry response event", function() {
            data = JSON.parse('{"target": {"id": "targetId","ver": "1.0","type": "Plugin"},"type": "MATCH","values": [{"lhs":"option1"}]}');
            spyOn(telemetryObj, "response").and.callThrough();
            telemetryObj.response(data);
            expect(telemetryObj.response).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "response").and.callThrough();
            var telemetryResponse = telemetryObj.response(data);
            expect(telemetryObj.response).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
        it("It should return if target spec is invalid", function() {
            data = JSON.parse('{"target": {"ver": "1.0","type": "Plugin"},"type": "MATCH","values": [{"lhs":"option1"}]}')
            spyOn(telemetryObj, "response").and.callThrough();
            var telemetryResponse = telemetryObj.response(data);
            expect(telemetryObj.response).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry INTERRUPT", function() {
        it("It should log telemetry interrupt event", function() {
            data = JSON.parse('{"type": "background","pageid": "1234"}')
            spyOn(telemetryObj, "interrupt").and.callThrough();
            telemetryObj.interrupt(data);
            expect(telemetryObj.interrupt).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "interrupt").and.callThrough();
            var telemetryResponse = telemetryObj.interrupt(data);
            expect(telemetryObj.interrupt).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined(undefined);
        });
    });

    describe("Telemetry FEEDBACK", function() {
        it("It should log telemetry feedback event", function() {
            data = JSON.parse('{"rating": "2","comments": "Nice app"}')
            spyOn(telemetryObj, "feedback").and.callThrough();
            telemetryObj.feedback(data);
            expect(telemetryObj.feedback).toHaveBeenCalled();
        });
    });

    describe("Telemetry SHARE", function() {
        it("It should log telemetry share event", function() {
            data = JSON.parse('{"items": [{"obj": {"id": "123","type": "Plugin","ver": "1.0"}}]}');
            spyOn(telemetryObj, "share").and.callThrough();
            telemetryObj.share(data);
            expect(telemetryObj.share).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "share").and.callThrough();
            var telemetryResponse = telemetryObj.share(data);
            expect(telemetryObj.share).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry AUDIT", function() {
        it("It should log telemetry audit event", function() {
            data = JSON.parse('{"props": ["123"],"state": "","prevstate": ""}');
            spyOn(telemetryObj, "audit").and.callThrough();
            telemetryObj.audit(data);
            expect(telemetryObj.audit).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "audit").and.callThrough();
            var telemetryResponse = telemetryObj.audit(data);
            expect(telemetryObj.audit).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry ERROR", function() {
        it("It should log telemetry error event", function() {
            data = JSON.parse('{"err": "500","errtype": "MOBILEAPP","stacktrace": "xy","pageid": "101","object": {"id": "_11","type": "PLUGIN","ver": "1.0"},"plugin": {"id": "_11","ver": "1.0"}}');
            spyOn(telemetryObj, "error").and.callThrough();
            telemetryObj.error(data);
            expect(telemetryObj.error).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = JSON.parse('{"err": "500","errtype": "MOBILEAPP","pageid": "101"}');
            spyOn(telemetryObj, "error").and.callThrough();
            var telemetryResponse = telemetryObj.error(data);
            expect(telemetryObj.error).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
        it("It should return if the object spec is invalid", function() {
            data = JSON.parse('{"err": "500","errtype": "MOBILEAPP","pageid": "101","stacktrace": "xy","object": {"id": "_11","type": "PLUGIN"}}');
            spyOn(telemetryObj, "error").and.callThrough();
            var telemetryResponse = telemetryObj.error(data);
            expect(telemetryObj.error).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
        it("It should return if the plugin spec is invalid", function() {
            data = JSON.parse('{"err": "500","errtype": "MOBILEAPP","pageid": "101","stacktrace": "xy","object": {"id": "_11","type": "PLUGIN","ver":"1.0"},"plugin": {"id": "_11"}}');
            spyOn(telemetryObj, "error").and.callThrough();
            var telemetryResponse = telemetryObj.error(data);
            expect(telemetryObj.error).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry LOG", function() {
        it("It should log telemetry log event", function() {
            data = JSON.parse('{"type": "app_update","level": "ERROR","message": "Error occurred in updating app","pageid": "101"}');
            spyOn(telemetryObj, "log").and.callThrough();
            telemetryObj.log(data);
            expect(telemetryObj.log).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = JSON.parse('{"type": "app_update","level": "ERROR","pageid": "101"}');
            spyOn(telemetryObj, "log").and.callThrough();
            var telemetryResponse = telemetryObj.log(data);
            expect(telemetryObj.log).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry HEARTBEAT", function() {
        it("It should log telemetry heartbeat event", function() {
            data = JSON.parse('{"type": "app_update","level": "ERROR","message": "Error occurred in updating app","pageid": "101"}');
            spyOn(telemetryObj, "heartbeat").and.callThrough();
            telemetryObj.heartbeat(data);
            expect(telemetryObj.heartbeat).toHaveBeenCalled();
        });
    });

    describe("Telemetry SEARCH", function() {
        it("It should log telemetry search event", function() {
            data = JSON.parse('{"query": "app_update","size": "333","topn": [{"h1":"H!"}]}');
            spyOn(telemetryObj, "search").and.callThrough();
            telemetryObj.search(data);
            expect(telemetryObj.search).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "search").and.callThrough();
            var telemetryResponse = telemetryObj.search(data);
            expect(telemetryObj.search).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });

    describe("Telemetry METRICS", function() {
        it("It should log telemetry metrics event", function() {
            data = JSON.parse('{"metric1": "app_update","metric2": "333"}');
            spyOn(telemetryObj, "metrics").and.callThrough();
            telemetryObj.metrics(data);
            expect(telemetryObj.metrics).toHaveBeenCalled();
        });
    });

    describe("Telemetry SUMMARY", function() {
        it("It should log telemetry metrics event", function() {
            data = JSON.parse('{"type": "PLUGIN","starttime": "2897238927","endtime": "98278233328","timespent":"95380994401","pageviews": "5","interactions": "4"}');
            spyOn(telemetryObj, "summary").and.callThrough();
            telemetryObj.summary(data);
            expect(telemetryObj.summary).toHaveBeenCalled();
        });
        it("It should return if the required data is unavailable", function() {
            data = JSON.parse('{"type": "PLUGIN","starttime": "2897238927","endtime": "98278233328","timespent":"95380994401","pageviews": "5"}');
            spyOn(telemetryObj, "summary").and.callThrough();
            var telemetryResponse = telemetryObj.summary(data);
            expect(telemetryObj.summary).toHaveBeenCalled();
            expect(telemetryResponse).toBeUndefined();
        });
    });


    describe("Telemetry EXDATA", function() {
        it("It should log telemetry exdata event", function() {
            var data = JSON.parse('{"type": "background","data": ""}');
            spyOn(telemetryObj, "exdata").and.callThrough();
            telemetryObj.exdata(data.type, data.data);
            expect(telemetryObj.exdata).toHaveBeenCalled();
        });
    });

    describe("Telemetry END", function() {
        it("It should not generate Event if the requied data is unavailable", function() {
            data = {};
            spyOn(telemetryObj, "end").and.callThrough();
            var telemetryEnd = telemetryObj.end(data);
            expect(telemetryObj.end).toHaveBeenCalled();
            expect(telemetryEnd).toEqual(undefined);
            expect(telemetryObj.initialized).toBeTruthy();
        })
        it("It should log telemetry END event", function() {
            data = JSON.parse('{"type": "ECML","pageid": "123"}');
            spyOn(telemetryObj, "end").and.callThrough();
            telemetryObj.end(data);
            expect(telemetryObj.end).toHaveBeenCalled();
            expect(telemetry.initialized).toBeFalsy();
        })
        it("It should not log telemetry END event if start is not happened", function() {
            data = JSON.parse('{"type": "ECML","pageid": "123"}');
            spyOn(telemetryObj, "end").and.callThrough();
            telemetryObj.end(data);
            expect(telemetryObj.end).toHaveBeenCalled();
            expect(telemetry.initialized).toBeFalsy();
        })
    });
});
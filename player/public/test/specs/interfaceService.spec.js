describe("InterfaceService Testcases", function() {
    var instance;
    beforeAll(function() {
        var gameData = {"id":"org.ekstep.quiz.app","ver":"BUILD_NUMBER"};
        instance = org.ekstep.service.content;
    });

    it("Should invoked getContentList method ", function(done) {
        spyOn(instance, 'getContentList').and.callThrough();
        instance.getContentList();
        expect(instance.getContentList).toHaveBeenCalled();
        expect(instance.getContentList).not.toBe(undefined);
        done();
    });

    it("Should invoked getContentAvailability method", function(done) {
        var uid = "9g8h4ndAnonymouscg56ngd";
        spyOn(instance, 'getContentAvailability').and.callThrough();
        instance.getContentAvailability(uid);
        expect(instance.getContentAvailability).toHaveBeenCalledWith(uid);
        expect(instance.getContentAvailability).not.toBe(undefined);
        done();
    });

    it("Should invoked setUser method and pass user id undefined ", function(done) {
        var uid = undefined;
        spyOn(instance, 'setUser').and.callThrough();
        instance.setUser(uid);
        expect(instance.setUser).toHaveBeenCalledWith(uid);
        expect(instance.setUser).not.toBe(undefined);
        done();
    });

    it("Get Current User details ", function(done) {
        spyOn(instance, 'getCurrentUser').and.callThrough();
        instance.getCurrentUser();
        expect(instance.getCurrentUser).toHaveBeenCalled();
        expect(instance.getCurrentUser).not.toBe(undefined);
        done();
    });

    it("Get all User Prifiles ", function(done) {
        spyOn(instance, 'getAllUserProfile').and.callThrough();
        instance.getAllUserProfile();
        expect(instance.getAllUserProfile).toHaveBeenCalled();
        expect(instance.getAllUserProfile).not.toBe(undefined);
        done();
    });

    it("Should invoked getContent method and set user ", function(done) {
        var uid = "9g8h4ndAnonymouscg56ngd";
        var resp = {};
        spyOn(instance, 'getContent').and.callThrough();
        instance.getContent(uid);
        expect(instance.getContent).toHaveBeenCalled();
        expect(instance.getContent).not.toBe(undefined);
        done();
    });

    it("Should invoked cacheAssessEvent method ", function(done) {
        var event = {"eid":"ASSESS","ets":1531463700566,"ver":"3.0","mid":"ASSESS:5c8044914b87fb63c0ab21a8f0e30c63","actor":{"id":"9g8h4ndAnonymouscg56ngd","type":"User"},"context":{"channel":"in.ekstep","pdata":{"id":"in.ekstep","ver":"1.0","pid":"contentplayer"},"env":"contentplayer","sid":"","did":"5da2d0d8113f7faf5c877648d9d6b112","cdata":[{"id":"0d12a230952b94cf5a9e94b93f8d22f9","type":"ContentSession"}],"rollup":{}},"object":{"id":"org.ekstep.contentplayer","type":"Content","ver":"BUILD_NUMBER"},"tags":[],"edata":{"item":{"id":"do_3121615837853614081835","maxscore":1,"exlength":0,"params":[],"uri":"","title":"Fill me in","mmc":[],"mc":[],"desc":"number sense"},"index":1,"pass":"Yes","score":1,"resvalues":[{"ans1":"0"}],"duration":17}};
        var qid = "do_3121615837853614081835";
        spyOn(instance, 'cacheAssessEvent').and.callThrough();
        instance.cacheAssessEvent(qid, event);
        expect(instance.cacheAssessEvent).toHaveBeenCalledWith(qid, event);
        expect(instance.cacheAssessEvent).not.toBe(undefined);
        done();
    });

    it("Should invoked getTelemetryAssessEvents method ", function(done) {
        spyOn(instance, 'getTelemetryAssessEvents').and.callThrough();
        var result = instance.getTelemetryAssessEvents();
        expect(instance.getTelemetryAssessEvents).toHaveBeenCalled();
        expect(instance.getTelemetryAssessEvents).not.toBe(undefined);
        expect(result).not.toBe(undefined);
        done();
    });

    it("Should invoked clearCacheAssessEvent method ", function(done) {
        spyOn(instance, 'clearCacheAssessEvent').and.callThrough();
        instance.clearCacheAssessEvent();
        expect(instance.clearCacheAssessEvent).toHaveBeenCalled();
        expect(instance.clearCacheAssessEvent).not.toBe(undefined);
        done();
    });

    it("Should invoked addEventListener to get event data ", function(done) {
        var telemetryEvent = 'telemetryEvent';
        spyOn(EkstepRendererAPI, 'addEventListener').and.callThrough();
        EkstepRendererAPI.addEventListener(telemetryEvent);
        expect(EkstepRendererAPI.addEventListener).toHaveBeenCalled();
        done();
    });

    it("Should invoked addEventListener when click on replay button", function(done) {
        var telemetryEvent = 'renderer:content:replay';
        spyOn(EkstepRendererAPI, 'addEventListener').and.callThrough();
        EkstepRendererAPI.addEventListener(telemetryEvent);
        expect(EkstepRendererAPI.addEventListener).toHaveBeenCalled();
        expect(EkstepRendererAPI.addEventListener.calls.count()).toEqual(1);
        done();
    });

});
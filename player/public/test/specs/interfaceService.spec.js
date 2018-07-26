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
    it('should get Content Metadata', function() {
        var contentData = '{"identifier":"do_21254881993036595212605","localData":{"previewUrl":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/content/ecml/do_21254881993036595212605-latest","subject":"Mathematics","channel":"012315809814749184151","downloadUrl":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/ecar_files/do_21254881993036595212605/hloo-aaciriyrkll-epptti-irukkirraarkll-nii-epptti-ceykirraay-naannn-epptti-arriveennn_1531838551233_do_21254881993036595212605_1.0.ecar","organisation":["ORG25"],"language":["English"],"variants":{"spine":{"ecarUrl":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/ecar_files/do_21254881993036595212605/hloo-aaciriyrkll-epptti-irukkirraarkll-nii-epptti-ceykirraay-naannn-epptti-arriveennn_1531838551351_do_21254881993036595212605_1.0_spine.ecar","size":74246}},"mimeType":"application/vnd.ekstep.ecml-archive","editorState":"{\"plugin\":{\"noOfExtPlugins\":5,\"extPlugins\":[{\"plugin\":\"org.ekstep.contenteditorfunctions\",\"version\":\"1.2\"},{\"plugin\":\"org.ekstep.keyboardshortcuts\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.richtext\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.iterator\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.navigation\",\"version\":\"1.0\"}]},\"stage\":{\"noOfStages\":1,\"currentStage\":\"4bbcceb4-d6ca-4b37-8818-8e42a0721c05\"},\"sidebar\":{\"selectedMenu\":\"settings\"}}","appIcon":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/content/do_21254881993036595212605/artifact/60ff_1531838462519.thumb.jpg","gradeLevel":["KG"],"collections":[],"appId":"staging.sunbird.portal","artifactUrl":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/content/do_21254881993036595212605/artifact/1531838550884_do_21254881993036595212605.zip","contentEncoding":"gzip","contentType":"Resource","sYS_INTERNAL_LAST_UPDATED_ON":"2018-07-17T14:42:31.585+0000","lastUpdatedBy":"230cb747-6ce9-4e1c-91a8-1067ae291cb9","identifier":"do_21254881993036595212605","audience":["Learner"],"publishChecklist":["No Hate speech, Abuse, Violence, Profanity","No Sexual content, Nudity or Vulgarity","No Discrimination or Defamation","Is suitable for children","Appropriate Title, Description","Correct Board, Grade, Subject, Medium","Appropriate tags such as Resource Type, Concepts","Relevant Keywords","Content plays correctly","Can see the content clearly on Desktop and App","Audio (if any) is clear and easy to understand","No Spelling mistakes in the text","Language is simple to understand"],"visibility":"Default","consumerId":"fa271a76-c15a-4aa1-adff-31dd04682a1f","mediaType":"content","osId":"org.ekstep.quiz.app","lastPublishedBy":"230cb747-6ce9-4e1c-91a8-1067ae291cb9","languageCode":"en","prevState":"Review","lastPublishedOn":"2018-07-17T14:42:31.233+0000","size":127077,"concepts":[{"identifier":"AI35","name":"Softmax","objectType":"Concept","relation":"associatedTo","description":null,"index":null,"status":null,"depth":null,"mimeType":null,"visibility":null,"compatibilityLevel":null},{"identifier":"AI37","name":"RELU","objectType":"Concept","relation":"associatedTo","description":null,"index":null,"status":null,"depth":null,"mimeType":null,"visibility":null,"compatibilityLevel":null},{"identifier":"AI33","name":"Perceptron","objectType":"Concept","relation":"associatedTo","description":null,"index":null,"status":null,"depth":null,"mimeType":null,"visibility":null,"compatibilityLevel":null}],"name":" ஹலோ ஆசிரியர்கள் எப்படி இருக்கிறார்கள்? நீ எப்படி செய்கிறாய்? நான் எப்படி அறிவேன்?","status":"Live","totalQuestions":0,"code":"org.sunbird.rtbfUs","description":"Untitled Collection","medium":"Tamil","posterImage":"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/content/do_21254882068380876812607/artifact/60ff_1531838462519.jpg","idealScreenSize":"normal","createdOn":"2018-07-17T14:39:30.405+0000","contentDisposition":"inline","lastUpdatedOn":"2018-07-17T14:42:30.088+0000","createdFor":["012315809814749184151"],"creator":"Book Role update","os":["All"],"totalScore":0,"pkgVersion":1,"versionKey":"1531838550088","idealScreenDensity":"hdpi","s3Key":"ecar_files/do_21254881993036595212605/hloo-aaciriyrkll-epptti-irukkirraarkll-nii-epptti-ceykirraay-naannn-epptti-arriveennn_1531838551233_do_21254881993036595212605_1.0.ecar","framework":"NCF","lastSubmittedOn":"2018-07-17T14:41:06.494+0000","createdBy":"9da8907b-f53e-426a-9cfe-53eba4c225a5","compatibilityLevel":2,"usedByContent":[],"board":"NCERT","resourceType":"Learn"},"mimeType":"application/vnd.ekstep.ecml-archive","isAvailable":true,"path":"stories/org.sunbird.rtbfUs"}';
        spyOn(org.ekstep.service.content, 'getContentMetadata').and.returnValue(Promise.resolve(contentData));
    
        var headers = org.ekstep.contentrenderer.urlparameter;
        org.ekstep.service.content.getContentMetadata('do_21254881993036595212605', headers).then(function(result){
            expect(result).toEqual(contentData);
            done();
          });
      });
    
      it('should return error when we call get Content Metadata', function() {
        var errorData = { "message": "Cannot set property 'Content-Type' of undefined"};
        spyOn(org.ekstep.service.content, 'getContentMetadata').and.returnValue(Promise.reject(errorData));
    
        var headers = org.ekstep.contentrenderer.urlparameter;
        org.ekstep.service.content.getContentMetadata('do_21254881993036595212605', headers).then(function(){
           done(new Error(errorData));
        }, function(reason) {
          expect(reason).toEqual(errorData);
          done();
        });
      });

});
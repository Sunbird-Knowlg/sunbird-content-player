describe('Content Renderer Testcase', function() {
    var youtubeContent = JSON.parse('{"context":{"mode":"edit","contentId":"do_112416367927336960115","sid":"rctrs9r0748iidtuhh79ust993","uid":"390","channel":"in.ekstep","pdata":{"id":"in.ekstep","ver":"1.0","pid":"contenteditor"},"app":[],"dims":[],"partner":[]},"config":{"showEndpage":true},"metadata":{"code":"Test_QA","keywords":["QA_Content"],"methods":[],"description":"Test_QA","language":["English"],"mimeType":"video/x-youtube","createdOn":"2017-08-16T11:24:15.143+0000","collections":[],"children":[],"usesContent":[],"lastUpdatedOn":"2018-05-15T11:42:43.354+0000","artifactUrl":"https://www.youtube.com/watch?v=O5cOxUWlT58","contentType":"Story","item_sets":[],"identifier":"do_112311614710931456119","audience":["Learner"],"visibility":"Default","libraries":[],"mediaType":"content","osId":"org.ekstep.quiz.app","languageCode":"en","pkgVersion":3,"versionKey":"1526384563354","tags":["QA_Content"],"concepts":[],"name":"youtube-content","usedByContent":[],"status":"Live"},"data":{}}');
    describe("When player is initialized(initializePreview is called)", function() {
        xit("First time function call should show splash screen", function() {
            spyOn(splashScreen, "show").and.callThrough();
            org.ekstep.contentrenderer.initializePreview(youtubeContent)
            expect(splashScreen.show).toHaveBeenCalled();
            expect(splashScreen.show.calls.count()).toEqual(1);
        });
        it('Second time function call should not show splash screen', function() {
            spyOn(splashScreen, "show").and.callThrough();
            var pdfContent = youtubeContent;
            pdfContent.metadata.mimeType = "application/pdf";
            org.ekstep.contentrenderer.initializePreview(pdfContent)
            expect(splashScreen.show).not.toHaveBeenCalled();
        });
        xit('Second time function call should destroy the other loaded launchers', function() {
            var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
            var epubContent = youtubeContent;
            spyOn(baseLauncher, 'destroy').and.callThrough();
            epubContent.metadata.mimeType = "application/epub";
            org.ekstep.contentrenderer.initializePreview(epubContent)
            expect(baseLauncher.destroy).toHaveBeenCalled();
            expect(org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.videorenderer']).toBeUndefined();
        });
        xit('Second time function call should not load the same launcher again', function() {
            var launcher = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.launcher'];
            var epubLauncher = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.epubrenderer'];
            var epubContent = youtubeContent;
            spyOn(epubLauncher, 'start').and.callThrough();
            spyOn(launcher, 'load').and.callThrough();
            epubContent.metadata.mimeType = "application/epub";
            org.ekstep.contentrenderer.initializePreview(epubContent)
            expect(launcher.load).not.toHaveBeenCalled();
            expect(epubLauncher.start).toHaveBeenCalled();
        });
        xit('Second time function call should remove old launcher html elements', function() {
            var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
            var pdfContent = youtubeContent;
            pdfContent.metadata.mimeType = "application/pdf";
            spyOn(baseLauncher, 'resetDomElement').and.callThrough();
            org.ekstep.contentrenderer.initializePreview(pdfContent)
            expect(baseLauncher.resetDomElement).toHaveBeenCalled();
        });
        xit('All event listener listening to old launcher should be destroyed', function() {
            var epubLauncher = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.epubrenderer'];
            var ecmlContent = youtubeContent;
            ecmlContent.metadata.mimeType = "application/vnd.ekstep.ecml-archive";
            expect(EventBus.hasEventListener('content:load:application/vnd.ekstep.epub-archive', epubLauncher.launch, epubLauncher)).not.toBeUndefined();
            org.ekstep.contentrenderer.initializePreview(ecmlContent)
            expect(EventBus.hasEventListener('content:load:application/vnd.ekstep.epub-archive', epubLauncher.launch, epubLauncher)).toBeUndefined();
        });
    });
})
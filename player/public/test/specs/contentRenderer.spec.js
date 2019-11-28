describe('Content Renderer Testcase', function() {
    var launcher;
    beforeAll(function (callback) {
        org.ekstep.pluginframework.pluginManager.loadPluginWithDependencies('org.ekstep.launcher', '1.0', 'plugin', undefined, function () {
            launcher = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.launcher'];
            callback()
        });
    });
    var youtubeContent = JSON.parse('{"metadata":{"code":"2c6abae7-e310-4139-add4-c896b1eb1617","keywords":["abcdfg"],"subject":["Science"],"channel":"0124758418460180480","language":["English"],"medium":["Hindi"],"streamingUrl":"https://ntpstagingall.blob.core.windows.net/ntp-content-staging/assets/do_2126002929212211201100/23-10-2016.pdf","mimeType":"application/pdf","createdOn":"2018-09-28T08:01:34.484+0000","gradeLevel":["Class 9"],"appIcon":"https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2126002929212211201100/artifact/download-1_1538116537561.thumb.jpg","lastUpdatedOn":"2018-09-28T08:17:05.308+0000","artifactUrl":"https://ntpstagingall.blob.core.windows.net/ntp-content-staging/assets/do_2126002929212211201100/23-10-2016.pdf","contentType":"Resource","creator":"Aprcreator UserSuborg1","audience":["Learner"],"visibility":"Default","mediaType":"content","osId":"org.ekstep.quiz.app","pkgVersion":1,"versionKey":"1538122625308","framework":"rj_k-12_2","createdBy":"078f7fb8-0bb7-4b26-9c98-049b48922a8a","name":"Upload_content_pdf_28sep","board":"State (Rajasthan)","resourceType":"Learn","status":"Live","orgDetails":{"email":null,"orgName":"aprTestOne"},"body":{}},"body":{}}');
    describe("When player is initialized(initializePreview is called)", function() {
        it("First time function call should show splash screen", function() {
            spyOn(splashScreen, "show").and.callThrough();
            splashScreen.show();
            org.ekstep.contentrenderer.initializePreview(youtubeContent)
            expect(splashScreen.show).toHaveBeenCalled();
            expect(splashScreen.show.calls.count()).toEqual(1);
        });
        it('Second time function call should not show splash screen', function() {
            var pdfContent = youtubeContent;
            pdfContent.metadata.mimeType = "application/pdf";
            spyOn(splashScreen, "show").and.callThrough();
            org.ekstep.contentrenderer.initializePreview(pdfContent);
            expect(splashScreen.show).not.toHaveBeenCalled();
        });
        it('Second time function call should destroy the other loaded launchers', function() {
            var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
            var epubContent = youtubeContent;
            epubContent.metadata.mimeType = "application/epub";
            org.ekstep.contentrenderer.initializePreview(epubContent)
            expect(org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.videorenderer']).toBeUndefined();
        });
        xit('Second time function call should remove old launcher html elements', function() {
            var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
            var pdfContent = youtubeContent;
            pdfContent.metadata.mimeType = "application/pdf";
            spyOn(baseLauncher, 'resetDomElement').and.callThrough();
            baseLauncher.resetDomElement();
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
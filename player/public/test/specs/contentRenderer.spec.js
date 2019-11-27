describe('Content Renderer Testcase', function() {
    var youtubeContent = JSON.parse('{"context":{"user":{"id":"874ed8a5-782e-4f6c-8f36-e0288455901e","name":"Creation","orgIds":["ORG_001"],"organisations":{"ORG_001":"Sunbird"}},"did":"88fa6b633a0824a51ce298155114e430","sid":"zRXV56cQopYIrmucrFSoW2hrALo7B2Gc","contentId":"do_11289977342843289613","pdata":{"id":"dev.sunbird.portal","ver":"2.5.0","pid":"sunbird-portal.contenteditor"},"contextRollUp":{"l1":"ORG_001"},"tags":["ORG_001","ORG_001","b00bc992ef25f1a9a8d63291e20efc8d"],"channel":"b00bc992ef25f1a9a8d63291e20efc8d","framework":"NCFCOPY","ownershipType":["createdBy","createdFor"],"timeDiff":-0.211,"uid":"874ed8a5-782e-4f6c-8f36-e0288455901e","etags":{"app":[],"partner":[],"dims":[]}}}');
    describe("When player is initialized(initializePreview is called)", function() {
        xit("First time function call should show splash screen", function() {
            spyOn(splashScreen, "show").and.callThrough();
            org.ekstep.contentrenderer.initializePreview(youtubeContent)
            expect(splashScreen.show).toHaveBeenCalled();
            expect(splashScreen.show.calls.count()).toEqual(1);
        });
        xit('Second time function call should not show splash screen', function() {
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
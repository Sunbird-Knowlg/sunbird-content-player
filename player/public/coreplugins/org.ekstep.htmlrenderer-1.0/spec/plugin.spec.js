describe('Html Plugin', function() {
	var manifest, htmlInstance;
    this.eventReciever = function(event) {
        console.log('test function is called for event', event.type);
    }
    var instance = this;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.htmlrenderer","ver":1,"type":"plugin"}], [], function() {
   			console.log("Html plugin is loaded");
			htmlInstance = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.htmlrenderer'];
			manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.htmlrenderer'];
            callback();
		});
    });
    describe("When plugin is initialized", function() {
    	it("It should invoke start", function() {
            spyOn(htmlInstance, "start").and.callThrough();
            htmlInstance.initLauncher();
            expect(htmlInstance.start).toHaveBeenCalled();
        })
    });
    describe("When start is called", function() {
        it("It should create iframe", function() {
            spyOn(htmlInstance, "reset").and.callThrough();
            spyOn(htmlInstance, "validateSrc").and.callThrough();
            htmlInstance.start();
            expect(htmlInstance.reset).toHaveBeenCalled();
            expect(htmlInstance.validateSrc).toHaveBeenCalled();
        })
    });
    describe("When validateSrc is called", function() {
        it("It should validate the html path & add log error if not valid", function() {
            var iframe = document.createElement('iframe');
            var path = 'public/test/testContent/index.html';
            iframe.src = path;
            expect(org.ekstep.pluginframework.resourceManager).not.toBeUndefined();
            spyOn(org.ekstep.pluginframework.resourceManager, "loadResource").and.callThrough();
            spyOn(EkstepRendererAPI, "logErrorEvent").and.callThrough();
            htmlInstance.validateSrc(path, iframe);
            expect(org.ekstep.pluginframework.resourceManager.loadResource).toHaveBeenCalled();
            expect(EkstepRendererAPI.logErrorEvent).toHaveBeenCalled();
        })
        it("It should validate the html path & add iframe to gamearea if valid", function() {
            var iframe = document.createElement('iframe');
            var path = 'base/public/test/testContent/index.html?contentId=do_20045479&launchData={"env":"portal","envpath":"dev"}&appInfo={"code":"org.ekstep.quiz.app","mimeType":"application/vnd.android.package-archive","identifier":"org.ekstep.quiz.app"}';
            iframe.src = path;
            expect(org.ekstep.pluginframework.resourceManager).not.toBeUndefined();
            spyOn(org.ekstep.pluginframework.resourceManager, "loadResource").and.callThrough();
            spyOn(htmlInstance, "configOverlay").and.callThrough();
            spyOn(htmlInstance, "addToGameArea").and.callThrough();
            spyOn(instance, "eventReciever").and.callThrough();
            EkstepRendererAPI.addEventListener('renderer:splash:hide', instance.eventReciever, instance);
            htmlInstance.validateSrc(path, iframe);
            expect(org.ekstep.pluginframework.resourceManager.loadResource).toHaveBeenCalled();
            expect(htmlInstance.configOverlay).toHaveBeenCalled();
            expect(instance.eventReciever).toHaveBeenCalled();
            expect(htmlInstance.addToGameArea).toHaveBeenCalled();
        })
    });
    describe("When configOverlay is called", function() {
        it("It should dispatch events", function(callback) {
            spyOn(instance, "eventReciever");
            EkstepRendererAPI.addEventListener('renderer:overlay:show', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:stagereload:hide', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:next:hide', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:previous:hide', instance.eventReciever, instance);
            htmlInstance.configOverlay();
            setTimeout(function() {
                expect(instance.eventReciever.calls.any()).toEqual(true);
                callback()
            },2000)
        })
    });
    describe("When configOverlay is called", function() {
        it("It should dispatch events", function(callback) {
            spyOn(instance, "eventReciever");
            EkstepRendererAPI.addEventListener('renderer:overlay:show', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:stagereload:hide', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:next:hide', instance.eventReciever, instance);
            EkstepRendererAPI.addEventListener('renderer:previous:hide', instance.eventReciever, instance);
            htmlInstance.configOverlay();
            setTimeout(function() {
                expect(instance.eventReciever.calls.any()).toEqual(true);
                callback()
            },1001)
        })
    });
    describe("When getAsseturl is called", function() {
        xit("It should return url", function() {
            spyOn(EkstepRendererAPI, "getGlobalConfig");
            expect(htmlInstance.s3_folders).not.toBeUndefined();
            expect(EkstepRendererAPI).not.toBeUndefined();
            var path = htmlInstance.getAsseturl(content);
            expect(EkstepRendererAPI.getGlobalConfig).toHaveBeenCalled();
            expect(path).not.toBeUndefined();
        })
    });
    describe("When end is called", function() {
        it("It should change currentIndex & totalIndex value", function() {
            htmlInstance.end();
            expect(htmlInstance.currentIndex).toEqual(100);
            expect(htmlInstance.totalIndex).toEqual(100);
        })
    });
    describe("When contentProgress is called", function() {
        xit("It should return progress of content", function() {
            spyOn(htmlInstance, "contentProgress");
            var progress = htmlInstance.contentProgress();
            expect(htmlInstance.contentProgress).toHaveBeenCalled();
            expect(progress).not.toBeUndefined();
        })
    });
    describe("When reset is called", function() {
        it("It should reset currentIndex & totalIndex value", function() {
            htmlInstance.reset();
            expect(htmlInstance.currentIndex).toEqual(50);
            expect(htmlInstance.totalIndex).toEqual(100);
        })
    });
});
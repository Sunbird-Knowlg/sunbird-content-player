describe('Ecml Renderer', function() {
	var manifest, ecmlRenderer;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"mimeType":["application/vnd.ekstep.ecml-archive"],"id":"org.ekstep.ecmlrenderer","ver":1,"type":"plugin"}], [], function() {
   			console.log("ecml renderer plugin is loaded");
			ecmlRenderer = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.ecmlrenderer'];
			manifest = ecmlRenderer.manifest;
            callback();
		});
    });
    describe("When plugin is initialized", function() {
    	it("It should invoke start", function(done) {
    		spyOn(ecmlRenderer, "start").and.callThrough();
            ecmlRenderer.initLauncher(manifest);
            expect(EkstepRendererAPI).not.toBeUndefined();
            setTimeout(function(){
                expect(ecmlRenderer.start).toHaveBeenCalled();
                done();
            },1);
        })
        it('It should register events', function() {
            expect(EventBus.hasEventListener('renderer:content:load')).toBe(true);
            expect(EventBus.hasEventListener('renderer:cleanUp')).toBe(true);
        });
    });
    describe("When start is called", function() {
        it("It should invoke initByJSON", function() {
            spyOn(ecmlRenderer, "initByJSON").and.callThrough();
            spyOn(ecmlRenderer, "initContentProgress").and.callThrough();
            expect(window.content).not.toBeUndefined();
            ecmlRenderer.start();
            expect(ecmlRenderer.initByJSON).toHaveBeenCalled();
            expect(ecmlRenderer.initContentProgress).toHaveBeenCalled();
        })
    });
    // describe("When load is called", function() {
    //     it("It should invoke themePlugin", function(done) {
    //         jQuery.getJSON(window.content.baseDir + '/index.json', function(data) {
    //             var dataObj = {
    //                 'body': data,
    //                 'canvasId': 'gameCanvas',
    //                 'path': window.content.baseDir
    //             }
    //             var themePluginInstance = org.ekstep.pluginframework.pluginManager.pluginInstances.theme;
    //             spyOn(themePluginInstance, "start").and.callThrough();
    //             spyOn(ecmlRenderer, "resizeGame").and.callThrough();
    //             spyOn(ecmlRenderer, "handleRelativePath").and.callThrough();
    //             ecmlRenderer.load(dataObj);
    //             expect(dataObj).not.toBeUndefined();
    //             expect(X2JS).not.toBeUndefined();
    //             expect(Renderer).not.toBeUndefined();
    //             expect(Renderer.theme).not.toBeUndefined();
    //             expect(ecmlRenderer.gdata).not.toBeUndefined();
    //             setTimeout(function(){
    //                 expect(ecmlRenderer.resizeGame).toHaveBeenCalled();
    //                 expect(ecmlRenderer.handleRelativePath).toHaveBeenCalled();
    //                 expect(themePluginInstance.start).toHaveBeenCalled();
    //                 done();
    //             },1000)
    //         });
    //     })
    // });

    // describe("When replay is called", function() {
    //     it("It should replay the content", function() {
    //         var themePluginInstance = org.ekstep.pluginframework.pluginManager.pluginInstances.theme;
    //         spyOn(themePluginInstance, "removeHtmlElements").and.callThrough();
    //         spyOn(themePluginInstance, "reRender").and.callThrough();
    //         spyOn(ecmlRenderer, "startTelemetry").and.callThrough();
    //         ecmlRenderer.replay();
    //         expect(ecmlRenderer.qid).toEqual([]);
    //         expect(ecmlRenderer.stageId).toEqual([]);
    //         expect(themePluginInstance.removeHtmlElements).toHaveBeenCalled();
    //         expect(themePluginInstance.reRender).toHaveBeenCalled();
    //         expect(ecmlRenderer.startTelemetry).toHaveBeenCalled();
    //     })
    // });

    // describe("When contentProgress is called", function() {
    //     it("It should return progress of the content", function() {
    //         var themePluginInstance = org.ekstep.pluginframework.pluginManager.pluginInstances.theme;
    //         spyOn(ecmlRenderer, "getContentAssesmentCount").and.callThrough();
    //         var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
    //         spyOn(baseLauncher, "progres").and.callThrough();
    //         ecmlRenderer.contentProgress();
    //         expect(ecmlRenderer.getContentAssesmentCount).toHaveBeenCalled();
    //         expect(baseLauncher.progres).toHaveBeenCalled();
    //     })
    // });

    // describe("When initContentProgress is called", function() {
    //     it("It should register events", function() {
    //         expect(EventBus.hasEventListener('sceneEnter')).toBe(true);
    //         expect(EventBus.hasEventListener('renderer:assesment:eval')).toBe(true);
    //     })
    // });

    // describe("When cleanUp is called", function() {
    //     it("It should cleanUp the canvas", function() {
    //         window.Renderer = {'theme':org.ekstep.pluginframework.pluginManager.pluginInstances.theme};
    //         spyOn(AnimationManager, "cleanUp").and.callThrough();
    //         spyOn(AssetManager, "destroy").and.callThrough();
    //         spyOn(TimerManager, "destroy").and.callThrough();
    //         spyOn(AudioManager, "cleanUp").and.callThrough();
    //         ecmlRenderer.cleanUp();
    //         expect(ecmlRenderer.running).toEqual(false);
    //         expect(AnimationManager.cleanUp).toHaveBeenCalled();
    //         expect(AssetManager.destroy).toHaveBeenCalled();
    //         expect(TimerManager.destroy).toHaveBeenCalled();
    //         expect(AudioManager.cleanUp).toHaveBeenCalled();
    //         expect(Renderer.theme).toBeUndefined();
    //     })
    // });

})
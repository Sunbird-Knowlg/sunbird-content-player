describe('Launcher Plugin', function() {
	var manifest, LauncherPluginInstance;
    this.eventReciever = function(event) {
        console.log('test function is called for event', event.type);
    }
    var instance = this;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.launcher","ver":1,"type":"plugin"}], [], function() {
			LauncherPluginInstance = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.launcher'];
			manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.launcher'];
            callback();
		});
    });
    describe("When plugin is initialized", function() {
    	it("It should invoke loadNgModules", function() {
            var ngController = org.ekstep.service.controller;
            spyOn(ngController, "loadNgModules").and.callThrough();
            LauncherPluginInstance.initialize();
            expect(LauncherPluginInstance.templatePath).not.toBeUndefined();
            expect(LauncherPluginInstance.controllerPath).not.toBeUndefined();
            expect(ngController.loadNgModules).toHaveBeenCalled();
        })
        it("It should register events", function() {
            expect(EventBus.hasEventListener('renderer:launcher:load')).toBe(true);
        });
    });
    describe("When start is invoked", function() {
        xit("It should invoke loadPlugins", function() {
            var ngController = org.ekstep.service.controller;
            spyOn(instance, "eventReciever").and.callThrough();
            spyOn(LauncherPluginInstance, "loadCommonPlugins").and.callThrough();
            expect(EkstepRendererAPI).not.toBeUndefined();
            EkstepRendererAPI.addEventListener('renderer:repo:create', instance.eventReciever, instance);
            LauncherPluginInstance.start({'event': undefined,'type': "renderer:launcher:load"}, window.content);
            expect(LauncherPluginInstance.loadCommonPlugins).toHaveBeenCalled();
            expect(instance.eventReciever).toHaveBeenCalled();
        })
        it("It should register events", function() {
            expect(EventBus.hasEventListener('renderer:launcher:load')).toBe(true);
        });
    });
    describe("When common plugins is loading", function() {
        it("It should load common plugins", function() {
            var contentrenderer = org.ekstep.contentrenderer;
            spyOn(contentrenderer, "loadPlugins").and.callThrough();
            expect(GlobalContext.config).not.toBeUndefined();
            expect(GlobalContext.config.overlay).not.toBeUndefined();
            var callback = jasmine.createSpy("loadPluginCallback");
            LauncherPluginInstance.loadCommonPlugins(callback);
            expect(contentrenderer.loadPlugins).toHaveBeenCalled();
        })
        it("It should register events", function() {
            expect(EventBus.hasEventListener('renderer:launcher:load')).toBe(true);
        });
    });
    describe("When load plugin is called", function() {
        it("It should invoke content renderer loadPlugins", function(done) {
            var contentrenderer = org.ekstep.contentrenderer;
            spyOn(instance, "eventReciever").and.callThrough();
            spyOn(contentrenderer, "loadPlugins").and.callThrough();
            expect(EkstepRendererAPI).not.toBeUndefined();
            EkstepRendererAPI.addEventListener('telemetryPlugin:intialize', instance.eventReciever, instance);
            LauncherPluginInstance.loadPlugin(JSON.parse('{"mimeType":["application/vnd.ekstep.ecml-archive"],"id":"org.ekstep.ecmlrenderer","ver":1,"type":"plugin"}'), window.content);
            expect(contentrenderer.loadPlugins).toHaveBeenCalled();
            setTimeout(function() {
                expect(instance.eventReciever).toHaveBeenCalled();
                done();
            }, 1000)
        })
    });
});
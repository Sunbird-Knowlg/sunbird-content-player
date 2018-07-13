describe('Repo Plugin', function() {
	var manifest, RepoPluginInstance;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.repo","ver":1,"type":"plugin"}], [], function() {
			RepoPluginInstance = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.repo'];
			manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.repo'];
            callback();
		});
    });
    describe("When plugin is initialized", function() {
        it("It should register events", function() {
            expect(EventBus.hasEventListener('renderer:repo:create')).toBe(true);
        });
    });
    describe("When repo create is called", function() {
        it("It should create instance of single repo", function(done) {
            spyOn(RepoPluginInstance, "createInstance").and.callThrough();
            spyOn(RepoPluginInstance, "isAvailable").and.callThrough();
            RepoPluginInstance.start({'target':undefined,'type':"renderer:repo:create"}, {'path':"/content-plugins",'position':0});
            expect(RepoPluginInstance.isAvailable).toHaveBeenCalled();
            setTimeout(function() {
                expect(RepoPluginInstance.createInstance).toHaveBeenCalled();
                done();
            })
        })
        it("It should create instance of multiple repo", function(done) {
            spyOn(RepoPluginInstance, "createInstance").and.callThrough();
            spyOn(RepoPluginInstance, "isAvailable").and.callThrough();
            RepoPluginInstance.start({'target':undefined,'type':"renderer:repo:create"}, [{'path':"/content-plugins",'position':0}]);
            expect(RepoPluginInstance.isAvailable).toHaveBeenCalled();
            setTimeout(function() {
                expect(RepoPluginInstance.createInstance).toHaveBeenCalled();
                done();
            }, 100)
        })
    });
    describe("When repo instance is created to load the plugin", function() {
        it("It should create new instance of repo", function() {
            spyOn(RepoPluginInstance, "addInstance");
            RepoPluginInstance.createInstance('/content-plugins', 0);
            expect(RepoPluginInstance.addInstance).toHaveBeenCalled();
        })
    });
    describe("When repo instance is added to registredRepo stack", function() {
        it("It should invoke resourceManager addRepo in pluginframework", function() {
            expect(org.ekstep.pluginframework.resourceManager).not.toBeUndefined();
            spyOn(org.ekstep.pluginframework.resourceManager, "addRepo");
            var repoInstance = new(org.ekstep.pluginframework.iRepo.extend({
                id: Math.random() + 'ekstepPluginRepo_' + new Date().getTime(),
                basePath: '/content-plugins',
                discoverManifest: function(pluginId, pluginVer, callback, publishedTime) {
                    var instance = this;
                    org.ekstep.pluginframework.resourceManager.loadResource(this.resolveResource(pluginId, pluginVer, "manifest.json"), "json", function(err, response) {
                        callback(undefined, {
                            manifest: response,
                            repo: instance
                        });
                    }, publishedTime);
                },
                resolveResource: function(pluginId, pluginVer, resource) {
                    return this.basePath + "/" + pluginId + "-" + pluginVer + "/" + resource;
                }
            }))();
            RepoPluginInstance.addInstance(repoInstance, 0);
            expect(org.ekstep.pluginframework.resourceManager.addRepo).toHaveBeenCalled();
        })
    });
});
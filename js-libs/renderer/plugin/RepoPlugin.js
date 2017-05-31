/**
 * Plugin to create repo instance and register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

var customRepo = Plugin.extend({
    initialize: function() {
        var instance = this;
        console.info('repo initialize is done');
        var contextObj = EkstepRendererAPI.getPreviewData();
        if (_.size(contextObj.config.repo)) {
            if (Array.isArray(contextObj.config.repo)) {
                contextObj.config.repo.forEach(function(element, index) {
                    instance.createRepoInstance(element, index);
                });
            } else {
                instance.createRepoInstance(contextObj.config.repo);
            }
        }
    },
    initPlugin: function() {
        console.info("Repo plugin init is done..");
    },
    createRepoInstance: function(repoName, index) {
        var repoInstance = this.create('customRepo' + index);
        this.addRepoInstance(repoInstance, repoName);
    },
    create: function(repoName) {
        org.ekstep.pluginframework.repoName = new(org.ekstep.pluginframework.iRepo.extend({
            id: repoName,
            basePath: "https://localhost:8081",
            connected: false,
            updateBasePath: function(basePath) {
                this.basePath = basePath
            },
            discoverManifest: function(pluginId, pluginVer, callback, publishedTime) {
                if (this.connected) {
                    var instance = this;
                    org.ekstep.pluginframework.resourceManager.loadResource(this.resolveResource(pluginId, pluginVer, "manifest.json"), "json", function(err, response) {
                        callback(undefined, {
                            "manifest": response,
                            "repo": instance
                        });
                    }, publishedTime);
                } else {
                    callback(undefined, {
                        "manifest": undefined,
                        "repo": undefined
                    });
                }
            },
            resolveResource: function(pluginId, pluginVer, resource) {
                return this.basePath + "/" + pluginId + "-" + pluginVer + "/" + resource;
            }
        }));
        return org.ekstep.pluginframework.repoName;

    },
    addRepoInstance: function(repoInstance, repoPath) {
        repoInstance.updateBasePath(repoPath);
        org.ekstep.pluginframework.resourceManager.addRepo(repoInstance);
    },
})
PluginManager.registerPlugin('customRepo', customRepo);
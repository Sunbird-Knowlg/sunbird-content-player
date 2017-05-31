/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

var customRepo = Plugin.extend({
    initialize: function() {
        var instance = this;
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
    initPlugin: function() {console.info("Repo plugin init"); }, 
    createRepoInstance: function(repoPath, index) {
        var repoInstance = this.create('ekstepPluginRepo_' + index);
        this.addRepoInstance(repoInstance, repoPath);
    },
    create: function(repoName) {
        return new (org.ekstep.pluginframework.iRepo.extend({
            id: repoName, basePath: " ",
            updateBasePath: function(basePath) {
                this.basePath = basePath;
            },
            discoverManifest: function(pluginId, pluginVer, callback, publishedTime) {
                var instance = this;
                org.ekstep.pluginframework.resourceManager.loadResource(this.resolveResource(pluginId, pluginVer, "manifest.json"), "json", function(err, response) {
                    callback(undefined, {manifest: response, repo: instance });
                }, publishedTime);
            },
            resolveResource: function(pluginId, pluginVer, resource) {
                return this.basePath + "/" + pluginId + "-" + pluginVer + "/" + resource;
            }
        }))();
    },
    addRepoInstance: function(repoInstance, repoPath) {
        repoInstance.updateBasePath(repoPath);
        org.ekstep.pluginframework.resourceManager.addRepo(repoInstance);
    },
})
PluginManager.registerPlugin('customRepo', customRepo);
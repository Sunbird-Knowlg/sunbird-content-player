/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

var RepoPlugin = Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener('repo:intialize', this.initializeRepo, this);
    },
    initializeRepo:function(){
        var instance = this;
        var contextObj = EkstepRendererAPI.getPreviewData();
        if (contextObj.config.repo) {
            if (_.isObject(contextObj.config.repo)) {
                _.each(contextObj.config.repo, function(repoPath, index){
                    instance.createRepoInstance(repoPath, index)
                });
            } else {
                instance.createRepoInstance(contextObj.config.repo);
            }
        }
    },
    initPlugin: function() {console.info("Repo plugin init"); }, 
    createRepoInstance: function(repoPath, index) {
        var repoInstance = new(org.ekstep.pluginframework.iRepo.extend({
                id: 'ekstepPluginRepo_' + index, basePath: repoPath,
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
        this.addRepoInstance(repoInstance, repoPath);
    },
    addRepoInstance: function(repoInstance, repoPath) {
        org.ekstep.pluginframework.resourceManager.addRepo(repoInstance);
    },
})
PluginManager.registerPlugin('RepoPlugin', RepoPlugin);
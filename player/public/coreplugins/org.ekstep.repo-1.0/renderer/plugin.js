/**
 * Plugin to create repo instance and to register repo instance.
 * It is usefull to load the plugins from the difrrent location.
 * Pass the postion of the repo which will insert to stack based on the posion so 
 * loading the plugin speed will increases.
 * @extends EkstepRenderer.Plugin
 * @example
 * EkstepRendererAPI.dispatchEvent("renderer:repo:create",undefined,['/location1','/location2'])
 * @example
 * EkstepRendererAPI.dispatchEvent("renderer:repo:create",undefined,{path:'location1',position:0})
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

Plugin.extend({
    /**
     * Initialization of the repo plugin.
     */
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:repo:create', this.start, this);
    },
    /**
     * Looping of repos to create a instance of each repo
     * @example
     * EkstepRendererAPI.dispatchEvent("renderer:repo:create",undefined,['/location1','/location2'])
     * @example
     * EkstepRendererAPI.dispatchEvent("renderer:repo:create",undefined,{path:'location1',position:0})
     * @param  {string} event [Name of the event]
     * @param  {array} repos [repos]
     */
    start: function(event, repos) {
        var instance = this;
        if (repos) {
            if (_.isArray(repos)) {
                _.each(repos, function(repoPath, index) {
                    instance.isAvailable(repoPath, function(isPresent) {
                        if (!isPresent) {
                            instance.createInstance(repoPath, index);
                        }
                    });
                });
            } else {
                instance.isAvailable(repos.path, function(isPresent) {
                    if (!isPresent) {
                        instance.createInstance(repos.path, repos.position);
                    }
                });
            }
        }
    },
    initPlugin: function() {
        console.info("Repo plugin init");
    },
    /**
     * Create the plugin repo instance to load the plugin
     * @param  {string} repoPath [path of the plugin which is need to be load]
     * @param  {integer} position [Which increases speed of loading plugin from the path]
     * @return {class}          [creates the repo instance]
     */
    createInstance: function(repoPath, position) {
        var repoInstance = new(org.ekstep.pluginframework.iRepo.extend({
            id: Math.random() + 'ekstepPluginRepo_' + new Date().getTime(),
            basePath: repoPath,
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
        this.addInstance(repoInstance, position);
    },
    /**
     * It will add the repo instance to registredRepo stack
     * @param {class} repoInstance [Repo instance]
     * @param {integer} position     [postion of the registedRepos stack]
     */
    addInstance: function(repoInstance, position) {
        org.ekstep.pluginframework.resourceManager.addRepo(repoInstance, position);
    },

    /**
     * To avoid duplicate repos
     * @param  {path}   repo [repo path]
     * @return {Boolean}       [If the path is already present then it will return true else false in the callback]
     */
    isAvailable: function(repo, cb) {
        var isAvailable = undefined;
        if (org.ekstep.pluginframework.resourceManager.registeredRepos) {
            isAvailable = _.find(org.ekstep.pluginframework.resourceManager.registeredRepos, function(r) {
                return r.basePath == repo;
            });
            isAvailable ? cb(true) : cb(false);
        } else {
            cb(false);
        }
    }
});
//# sourceURL=RepoPlugin.js
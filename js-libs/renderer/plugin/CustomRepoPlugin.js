/**
 * @author Krushanu Mohapatra<Krushanu.Mohapatra@tarento.com>
 */
org.ekstep.pluginframework.customRepo = new(org.ekstep.pluginframework.iRepo.extend({
    id: "customRepo",
    basePath: "https://localhost:8081",
    connected: false,
    updateBasePath: function(basePath) {
        this.basePath = basePath
    },
    discoverManifest: function(pluginId, pluginVer, callback, publishedTime) {
        if(this.connected) {
            var instance = this;
            org.ekstep.pluginframework.resourceManager.loadResource(this.resolveResource(pluginId, pluginVer, "manifest.json"), "json", function(err, response) {
                callback(undefined, { "manifest": response, "repo": instance });
            }, publishedTime);
        } else {
            callback(undefined, { "manifest": undefined, "repo": undefined });
        }
    },
    resolveResource: function(pluginId, pluginVer, resource) {
    	return this.basePath + "/" + pluginId + "-" + pluginVer + "/" + resource;
    }
}));
// PluginManager.registerPlugin('customRepo', customRepo);

var content_renderer = function() {};
content_renderer.prototype._ = window._;
window.org.ekstep.contentrenderer = new content_renderer();


org.ekstep.contentrenderer.initPlugins = function(gamePath) {
    var pluginsPath = undefined;
    // @ plugin:error event is dispatching from the plugin-framework 
    // If any of the plugin is failed to load OR invoke then plugin:error event will trigger
    if (!EkstepRendererAPI.hasEventListener('plugin:error')) {
        EkstepRendererAPI.addEventListener('plugin:error', this.logErrorEventTelemetry, this);
    }
    pluginsPath = isCoreplugin ? AppConfig.CORE_PLUGINSPATH : (isbrowserpreview ? AppConfig.PREVIEW_PLUGINSPATH : AppConfig.DEVICE_PLUGINSPATH)
    var pluginRepo = gamePath + pluginsPath;
    var pfConfig = {
        env: "renderer",
        async: async,
        pluginRepo: pluginRepo,
        repos: [org.ekstep.pluginframework.publishedRepo]
    };
    org.ekstep.pluginframework.initialize(pfConfig);
};
org.ekstep.contentrenderer.loadPlugins = function(pluginManifest, manifestMedia, cb) {
    var pluginObj = []
    if (!Array.isArray(pluginManifest)) {
        pluginObj.push(pluginManifest);
        pluginManifest = pluginObj;
    }
    _.each(pluginManifest, function(p) {
        p.ver = parseFloat(p.ver).toFixed(1);
    });
    org.ekstep.pluginframework.pluginManager.loadAllPlugins(pluginManifest, manifestMedia, function() {
        console.info("Framework Loaded the plugins");
        if(typeof PluginManager != 'undefined'){
	        PluginManager.pluginMap = org.ekstep.pluginframework.pluginManager.plugins;
	        if (cb) cb();
	    }    
    });
};
org.ekstep.contentrenderer.registerPlguin = function(id, plugin) {
    org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin);
    if (typeof createjs !== "undefined")
        createjs.EventDispatcher.initialize(plugin.prototype);

};




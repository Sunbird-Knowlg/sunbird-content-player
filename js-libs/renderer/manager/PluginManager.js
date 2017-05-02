
PluginManager = {
    defaultResWidth: 1920,
    defaultResHeight: 1200,
    pluginMap: {},
    pluginObjMap: {},

    init: function(gamePath) {
        var pluginsPath = isbrowserpreview ? AppConfig.PREVIEW_PLUGINSPATH : AppConfig.DEVICE_PLUGINSPATH ;
        var pluginRepo = gamePath + pluginsPath;
        var pfConfig = {env:"renderer", async: async, pluginRepo: pluginRepo,repos: [org.ekstep.pluginframework.publishedRepo] };
        org.ekstep.pluginframework.initialize(pfConfig);
    },
    loadPlugins: function(pluginManifest, manifestMedia, cb) {
        var pluginObj = []
        _.each(pluginManifest, function(p) {
            p.ver = parseFloat(p.ver).toFixed(1);
        });

        if(!Array.isArray(pluginManifest)){
            pluginObj.push(pluginManifest);
            pluginManifest = pluginObj;
        }
        org.ekstep.pluginframework.pluginManager.loadAllPlugins(pluginManifest, manifestMedia, function() {
            console.info("Framework Loaded the plugins");
            PluginManager.pluginMap = org.ekstep.pluginframework.pluginManager.plugins;
            if (cb) cb();
        });
    },
    registerPlugin: function(id, plugin) {
        org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin);
        createjs.EventDispatcher.initialize(plugin.prototype);
    },
    isPlugin: function(id) {
        return org.ekstep.pluginframework.pluginManager.isPluginDefined(id);
    },
    invoke: function(id, data, parent, stage, theme) {
        return org.ekstep.pluginframework.pluginManager.invokeRenderer(id, data, parent, stage, theme);
    },
    registerPluginObject: function(pluginObj) {
        PluginManager.pluginObjMap[pluginObj.id] = pluginObj;
        org.ekstep.pluginframework.pluginManager.addPluginInstance(pluginObj);
    },
    getPluginObject: function(id) {
        return org.ekstep.pluginframework.pluginManager.getPluginInstance(id);
    },
    addError: function(error) {
        org.ekstep.pluginframework.pluginManager.addError(error);
    },
    getErrors: function() {
        return org.ekstep.pluginframework.pluginManager.getErrors();
    },
    cleanUp: function() {
        org.ekstep.pluginframework.pluginManager.cleanUp();
    },
    getPlugins: function() {
        return org.ekstep.pluginframework.pluginManager.getPlugins();
    }
};
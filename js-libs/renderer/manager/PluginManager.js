PluginManager = {
    defaultResWidth: 1920,
    defaultResHeight: 1200,
    init:function(gameRealPath){
        initPluginframeworkConfig(gameRealPath);
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
        org.ekstep.pluginframework.pluginManager.addPluginInstance(pluginObj);
    },
    getPluginObject: function(id) {
        return org.ekstep.pluginframework.pluginManager.getPluginInstance(id);
    },
    addError: function(error) {
        org.ekstep.pluginframework.pluginManager.addError(error);
    },
    getErrors: function() {
        return org.ekstep.pluginframework.pluginManager.getErrors(error);
    },
    cleanUp: function() {
        org.ekstep.pluginframework.pluginManager.cleanUp();
    },
    getPlugins: function() {
        return org.ekstep.pluginframework.pluginManager.getPlugins();
    }
};
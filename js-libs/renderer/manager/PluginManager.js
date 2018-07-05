
PluginManager = {
    defaultResWidth: 1920,
    defaultResHeight: 1200,
    pluginMap: {},
    pluginObjMap: {},   
    registerPlugin: function(id, plugin) {
        org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin);
        if(typeof createjs !== "undefined")
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

window.PluginManager = PluginManager;
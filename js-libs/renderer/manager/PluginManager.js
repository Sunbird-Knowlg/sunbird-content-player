PluginManager = {
    pluginMap: {},
    customJSLibMap: {},
    pluginObjMap: {},
    errors: [],
    defaultResWidth: 1920,
    defaultResHeight: 1200,
    registerPlugin: function(id, plugin) {
        org.ekstep.pluginframework.pluginManager.plugins[id] = plugin;
        createjs.EventDispatcher.initialize(plugin.prototype);
    },
    isPlugin: function(id) {
        return org.ekstep.pluginframework.pluginManager.isDefined(id);
    },
    invoke: function(id, data, parent, stage, theme) {
        if (this.isCanvasCorePlugin(id)) {
            return this.invokeCorePlugin(id, data, parent, stage, theme);
        } else {
            //return this.invokeCorePlugin(id, data, parent, stage, theme);
            org.ekstep.pluginframework.pluginManager.invoke(id, data, parent, undefined, stage, theme);
        }
    },
    // TODO : Will remove this function once the manifest added to each core plugins
    invokeCorePlugin: function(id, data, parent, stage, theme) {
        var p;
        var plugin = org.ekstep.pluginframework.pluginManager.plugins[id];
        if (!plugin) {
            console.warn("Plugin not found");
        } else {
            if (_.isArray(data)) {
                data.forEach(function(d) {
                    p = new plugin(d, parent, stage, theme);
                });
            } else {
                p = new plugin(data, parent, stage, theme);
            }
        }
        return p;
    },

    isCanvasCorePlugin: function(id) {
        corePlugin = ['set', 'tween', 'video', 'shape', 'sprite', 'summary', 'testcase', 'text', 'input', 'mcq', 'mtf', 'option', 'options', 'placeholder', 'scribble', 'theme', 'stage', 'audio', 'g', 'div', 'embed', 'grid', 'htext', 'hotspot', 'image', ];
        return _.contains(corePlugin, id);
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
        org.ekstep.pluginframework.pluginManager.getErrors(error);
    },
    cleanUp: function() {
        org.ekstep.pluginframework.pluginManager.cleanUp();
    },
    getPlugins: function() {
        return org.ekstep.pluginframework.pluginManager.getPlugins();
    }
};
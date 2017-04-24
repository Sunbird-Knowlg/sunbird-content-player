PluginManager = {
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
        var plugin;
        if (this.isPlugin(id)) {
            //Note: To Support for the canvas core Plugins without manifest object.
            //TODO: Canvas corePlugins should have manifest.json object
            plugin = org.ekstep.pluginframework.pluginManager.plugins[id];
            if (typeof plugin != 'function') {
                plugin = org.ekstep.pluginframework.pluginManager.plugins[id].p;
            }
            return this.invokePlugins(plugin, data, parent, stage, theme);
        } else {
            console.warn("Plugin not found", p);
        }
    },
    invokePlugins: function(plugin, data, parent, stage, theme) {
        var p;
        if (_.isArray(data)) {
            data.forEach(function(d) {
                p = new plugin(d, parent, stage, theme);
            });
        } else {
            p = new plugin(data, parent, stage, theme);
        }
        return p;
    },
    //Note: This method to support the olderContents
    loadPlugins: function(media, cb) {
        var instance = this;
        if (media) {
            media.forEach(function(media) {
                if (instance.isPlugin(media.id)) {
                    PluginManager.addError('external JS/CSS cannot override system plugin - ' + media.id);
                } else {
                    media.src = instance.handleRelativePath(media.src, pfConfig.backwardCompatibalityURL);
                    switch (media.type) {
                        case 'js':
                            org.ekstep.pluginframework.jQuery("body").append($("<script type='text/javascript' src=" + media.src + ">"));
                            break;
                        case 'css':
                            org.ekstep.pluginframework.jQuery("head").append("<link rel='stylesheet' type='text/css' href='" + media.src + "'>");
                            break;
                        case 'plugin':
                            instance.loadCustomPlugin(media, media.src);
                    }
                }
            });
        }
        if (cb) cb();
    },
    loadCustomPlugin: function(plugin, relativePath) {
        jQuery.ajax({
            async: false,
            url: relativePath,
            dataType: "text"
        }).error(function(err) {
            console.error('Unable to load custom plugin js source');
        }).done(function(data) {
            console.info('Registering custom plugin - ', plugin.id);
            PluginManager.registerPlugin(plugin.id, eval(data));
        });
    },
    handleRelativePath: function(src, gameRelPath) {
        if (src.substring(0, 4) != 'http') {
            if (!isbrowserpreview) {
                src = gameRelPath + src;
            }
        }
        return src;
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
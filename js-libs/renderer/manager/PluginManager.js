String.prototype.containsAny = function() {
    for (var i=0; i < arguments.length; i++) {
        if (this.indexOf( arguments[i] ) > -1 ) {
            return false;
        }
    }
    return true;
}

PluginManager = {
	pluginMap: {},
	customPluginMap: {},
	pluginObjMap: {},
	errors: [],
	defaultResWidth: 1920,
	defaultResHeight: 1200,
	keywords:['PluginManager','CommandManager','AnimationManager','AssetManager', 'AudioManager', 'ControllerManager', 'EventManager'],
	registerPlugin: function(id, plugin) {
		PluginManager.pluginMap[id] = plugin;
		createjs.EventDispatcher.initialize(plugin.prototype);
	},
	registerCustomPlugin: function(id, plugin) {
		PluginManager.customPluginMap[id] = plugin;
		createjs.EventDispatcher.initialize(plugin.prototype);
	},
	registerCustomPlugins: function(manifest, relativePath) { //TODO: Use async.js to load custom plugins
		PluginManager.customPluginMap = {};
		var plugins = manifest.plugin;
		if(plugins) {
			if(!_.isArray(plugins)) {
				plugins = [plugins];
			}
			plugins.forEach(function(plugin) {
				if(PluginManager.pluginMap[plugin.id]) {
					PluginManager.addError('Custom plugin cannot override system plugin - ' + plugin.id);
				} else {
					PluginManager.loadCustomPlugin(plugin, relativePath);
				}
			});
		}
	},
	isPlugin: function(id) {
		if(PluginManager.pluginMap[id] || PluginManager.customPluginMap[id]) {
			return true;
		} else {
			return false;
		}
	},
	invoke: function(id, data, parent, stage, theme) {
		var p;
		var plugin = PluginManager.pluginMap[id] || PluginManager.customPluginMap[id];
		if(!plugin) {
			PluginManager.addError('No plugin found for - ' + id);
		} else {
			if(_.isArray(data)) {
				data.forEach(function(d) {
					new plugin(d, parent, stage, theme);
				})
			} else {
				p = new plugin(data, parent, stage, theme);
			}
		}
		return p;
	},
	registerPluginObject: function(pluginObj) {
		PluginManager.pluginObjMap[pluginObj._id] = pluginObj;
	},
	getPluginObject: function(id) {
		return PluginManager.pluginObjMap[id];
	},
	addError: function(error) {
		PluginManager.errors.push(error);
	},
	getErrors: function() {
		return PluginManager.errors;
	},
	cleanUp: function() {
		PluginManager.pluginObjMap = {};
		PluginManager.customPluginMap = {};
		PluginManager.errors = [];
	},
	validateCustomPlugin: function(id, data) {
		if(data) {
			//TODO: Enhance the keywords
			if(!data.containsAny.apply(data, PluginManager.keywords)) {
				console.error('Excluded keywords found in the custom plugin');
				PluginManager.errors.push('Excluded keywords found in the custom plugin')
			} else {
				console.info('Registering custom plugin - ', id);
				PluginManager.registerCustomPlugin(id, eval(data));
			}
		}
	},
	loadCustomPlugin: function(plugin, relativePath) {
		jQuery.ajax({
			async: false,
		    url: relativePath + plugin.src,
		    dataType: "text"
		}).error(function(err) {
	  		console.error('Unable to load custom plugin js source');
	  	}).done(function( data ) {
	      	PluginManager.validateCustomPlugin(plugin.id, data);
	  	});
	}
}
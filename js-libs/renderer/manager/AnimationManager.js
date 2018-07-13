AnimationManager = {
	animationsCache: {},
	pluginMap: {},
	pluginObjMap: {},
	handle: function(action) {
		var instance;
		if (action && action.asset) {
			instance = PluginManager.getPluginObject(action.asset);
		} else {
			return;
		}
		if (action.parent === true && instance._parent) {
			instance = instance._parent;
		}
		for (k in action) {
            if (AnimationManager.isPlugin(k)) {
            	var data = action[k];
            	var pluginObj = undefined;
            	if(data.id) {
            		pluginObj = AnimationManager.getPluginObject(data.id);
            	}
            	if("undefined" == typeof pluginObj) {
            		pluginObj = AnimationManager.invokePlugin(k, action[k], instance);
            	} else {
            		console.info("Playing from cache...");
            	}
            	pluginObj.animate(instance, action.cb);
            }
        }
	},
	widthHandler: function(event, plugin) {
		var sb = plugin.getBounds();
    	plugin.scaleY = plugin.height / sb.height;
    	plugin.scaleX = plugin.width / sb.width;
	},
	isPlugin: function(id) {
		if(AnimationManager.pluginMap[id]) {
			return true;
		} else {
			return false;
		}
	},
	registerPlugin: function(id, plugin) {
		AnimationManager.pluginMap[id] = plugin;
		createjs.EventDispatcher.initialize(plugin.prototype);
	},
	invokePlugin: function(id, data, plugin) {
		var p, pluginMap = AnimationManager.pluginMap;
		if(!pluginMap[id]) {
			AnimationManager.addError('No plugin found for - ' + id);
		} else {
			if(_.isArray(data)) {
				data.forEach(function(d) {
					new pluginMap[id](d, plugin);
				})
			} else {
				p = new pluginMap[id](data, plugin);
			}
		}
		return p;
	},
	registerPluginObject: function(pluginObj) {
		AnimationManager.pluginObjMap[pluginObj._id] = pluginObj;
	},
	getPluginObject: function(id) {
		return AnimationManager.pluginObjMap[id];
	},
	cleanUp: function() {
		AnimationManager.pluginObjMap = {};
	}
}
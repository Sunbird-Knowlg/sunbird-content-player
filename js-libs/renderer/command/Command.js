var Command = Class.extend({
	_name: undefined,
	_methodName: undefined,
	_action: undefined,
	_isPluginAction: true,
	init: function(action) {
		this._action = action;
		CommandManager._setDataAttributes(action);
		console.info("Calling action:", this._name);
		this.invoke(action);
	},
	getPluginObject: function() {
		var plugin = PluginManager.getPluginObject(this._action.asset);
        if (this._action.parent === true && plugin && plugin._parent) {
            plugin = plugin._parent;
        }
        if (!plugin) {
            plugin = this._action.pluginObj;
        }
        return plugin;
	},
	invoke: function(action) {
		var plugin = this.getPluginObject();
		plugin[this._methodName](action);
	}
});
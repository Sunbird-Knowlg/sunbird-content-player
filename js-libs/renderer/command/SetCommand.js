var SetCommand = Command.extend({
	_name: 'SET',
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if (plugin && plugin._type == 'set') {
            plugin.setParamValue(action);
        } else if (plugin) {
            plugin.setPluginParamValue(action);
        }
	}
});
CommandManager.registerCommand('SET', SetCommand);
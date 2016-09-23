var CustomCommand = Command.extend({
	_name: 'CUSTOM',
	_isPluginAction: false,
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if (plugin && action.invoke) 
			plugin[action.invoke](action);
	}
});
CommandManager.registerCommand('CUSTOM', CustomCommand);
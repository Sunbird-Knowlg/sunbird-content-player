var TogglePlayCommand = Command.extend({
	_name: 'TOGGLEPLAY',
	_methodName: 'togglePlay',
	_isAsync: true,
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if ("undefined" == typeof plugin) {
			plugin = AudioManager; 
		}
		plugin[this._methodName](action);
	}
});
CommandManager.registerCommand('TOGGLEPLAY', TogglePlayCommand);
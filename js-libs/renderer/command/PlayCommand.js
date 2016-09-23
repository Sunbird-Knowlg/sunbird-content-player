var PlayCommand = Command.extend({
	_name: 'PLAY',
	_methodName: 'play',
	_isAsync: true,
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if ("undefined" == typeof plugin) {
			plugin = AudioManager; 
		}
		plugin[this._methodName](action);
	}
});
CommandManager.registerCommand('PLAY', PlayCommand);
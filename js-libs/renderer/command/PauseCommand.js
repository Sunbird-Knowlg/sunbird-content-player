var PauseCommand = Command.extend({
	_name: 'PAUSE',
	_methodName: 'pause',
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if ("undefined" == typeof plugin) {
			plugin = AudioManager; 
		}
		plugin[this._methodName](action);
	}
});
CommandManager.registerCommand('PAUSE', PauseCommand);
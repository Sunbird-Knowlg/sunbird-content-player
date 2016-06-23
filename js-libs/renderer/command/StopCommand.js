var StopCommand = Command.extend({
	_name: 'STOP',
	_methodName: 'stop',
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if ("undefined" == typeof plugin) {
			plugin = AudioManager; 
		}
		plugin[this._methodName](action);
	}
});
CommandManager.registerCommand('STOP', PauseCommand);
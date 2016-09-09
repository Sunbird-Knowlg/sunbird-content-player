var StopCommand = Command.extend({
	_name: 'STOP',
	_stopMethod: 'stop',
	_stopAllMethod: 'stopAll',
	invoke: function(action) {
		var plugin = this.getPluginObject();
		if ("undefined" == typeof plugin) {
			plugin = AudioManager; 
		}
        if (action.sound === true) {
            AudioManager[this._stopAllMethod](action);
        } else {
            plugin[this._stopMethod](action);
        }
		
	}
});
CommandManager.registerCommand('STOP', StopCommand);
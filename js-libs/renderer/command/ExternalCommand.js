var ExternalCommand = Command.extend({
	_name: 'EXTERNAL',
	_isPluginAction: false,
	invoke: function(action) {
		(action.href) ? window.open(action.href, "_system") : startApp(action.app);
	}
});
CommandManager.registerCommand('EXTERNAL', ExternalCommand);
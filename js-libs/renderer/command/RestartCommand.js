var RestartCommand = Command.extend({
	_name: 'RESTART',
	_methodName: 'restart',
	initCommand: function(action) {}
});
CommandManager.registerCommand('RESTART', RestartCommand);
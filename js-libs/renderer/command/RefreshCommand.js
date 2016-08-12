var RefreshCommand = Command.extend({
	_name: 'REFRESH',
	_methodName: 'refresh',
	initCommand: function(action) {}
});
CommandManager.registerCommand('REFRESH', RefreshCommand);
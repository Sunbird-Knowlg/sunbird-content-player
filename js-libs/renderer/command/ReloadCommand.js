var ReloadCommand = Command.extend({
	_name: 'RELOAD',
	_methodName: 'reload',
	initCommand: function(action) {}
});
CommandManager.registerCommand('RELOAD', ReloadCommand);
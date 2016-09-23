var EraseCommand = Command.extend({
	_name: 'ERASE',
	_methodName: 'clear',
	initCommand: function(action) {}
});
CommandManager.registerCommand('ERASE', EraseCommand);
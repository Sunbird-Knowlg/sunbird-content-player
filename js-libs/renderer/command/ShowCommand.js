var ShowCommand   = Command.extend({
	_name: 'SHOW',
	_methodName: 'show',
	initCommand: function(action) {}
});
CommandManager.registerCommand('SHOW', ShowCommand);
var HideCommand = Command.extend({
	_name: 'HIDE',
	_methodName: 'hide',
	initCommand: function(action) {}
});
CommandManager.registerCommand('HIDE', HideCommand);
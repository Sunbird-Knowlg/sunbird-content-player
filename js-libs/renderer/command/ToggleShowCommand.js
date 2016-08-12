var ToggleShowCommand = Command.extend({
	_name: 'TOGGLESHOW',
	_methodName: 'toggleShow',
	initCommand: function(action) {}
});
CommandManager.registerCommand('TOGGLESHOW', ToggleShowCommand);
var TransitionToCommand = Command.extend({
	_name: 'TRANSITIONTO',
	_methodName: 'transitionTo',
	initCommand: function(action) {}
});
CommandManager.registerCommand('TRANSITIONTO', TransitionToCommand);
var AnimateCommand = Command.extend({
	_name: 'ANIMATE',
	_isAsync: true,
	invoke: function(action) {
		AnimationManager.handle(action);
	}
});
CommandManager.registerCommand('ANIMATE', AnimateCommand);
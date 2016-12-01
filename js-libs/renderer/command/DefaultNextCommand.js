var DefaultNextCommand = Command.extend({
	_name: 'DEFAULTNEXT',
	_methodName: 'defaultNext',
	invoke: function(action) {
		console.log("Theme : action", action);
		// EventBus.dispatch(action.command, action);
		EventBus.dispatch("actionNavigateNext", action);
	}
});
CommandManager.registerCommand('DEFAULTNEXT', DefaultNextCommand);

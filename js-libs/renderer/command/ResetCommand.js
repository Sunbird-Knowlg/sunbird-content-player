var ResetCommand = Command.extend({
	_name: 'RESET',
	_isPluginAction: false,
	invoke: function(action) {
		ControllerManager.resetController(action.controller);
	}
});
CommandManager.registerCommand('RESET', ResetCommand);
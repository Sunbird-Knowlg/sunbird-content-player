var EventCommand = Command.extend({
	_name: 'EVENT',
	_isPluginAction: false,
	initCommand: function(action) {},
	invoke: function(action) {
		EventManager.dispatchEvent(action.asset, action.value);
	}
});
CommandManager.registerCommand('EVENT', EventCommand);
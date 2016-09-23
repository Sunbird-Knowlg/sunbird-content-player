var ToggleShadowCommand = Command.extend({
	_name: 'TOGGLESHADOW',
	_methodName: 'toggleShadow',
	initCommand: function(action) {}
});
CommandManager.registerCommand('TOGGLESHADOW', ToggleShadowCommand);
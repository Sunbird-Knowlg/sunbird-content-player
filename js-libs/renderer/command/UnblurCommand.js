var UnblurCommand = Command.extend({
	_name: 'UNBLUR',
	_methodName: 'unblur',
	initCommand: function(action) {}
});
CommandManager.registerCommand('UNBLUR', UnblurCommand);
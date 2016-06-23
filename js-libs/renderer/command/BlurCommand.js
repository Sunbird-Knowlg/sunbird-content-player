var BlurCommand = Command.extend({
	_name: 'BLUR',
	_methodName: 'blur',
});
CommandManager.registerCommand('TOGGLEPLAY', BlurCommand);
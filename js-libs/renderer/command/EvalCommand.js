var EvalCommand = Command.extend({
	_name: 'EVAL',
	_methodName: 'evaluate',
	invoke: function(action) {
		//This is to suppress evalution action generating by ECML content
		var plugin = this.getPluginObject();
        plugin.evaluate(action);
	}
});
CommandManager.registerCommand('EVAL', EvalCommand);

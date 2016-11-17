var EvalCommand = Command.extend({
	_name: 'EVAL',
	_methodName: 'evaluate',
	invoke: function(action) {
		//This is to suppress evalution action generating by ECML content
		var plugin = this.getPluginObject();
		if (action.htmlEval) {
            plugin.evaluate(action);
		} else {
			plugin.evaluate(action);
			console.warn("eval action from ECML content is deprecated.");
		}
	}
});
CommandManager.registerCommand('EVAL', EvalCommand);

var ResetCommand = Command.extend({
	_name: 'RESET',
	_isPluginAction: false,
	invoke: function(action) {
        var ctrl = Renderer.theme._controllerMap[action.controller];
        if (!_.isUndefined(ctrl)) {
            ctrl.reset();
            console.info("Reset is Done for:", ctrl);
        } else {
            console.info("Reset is Failed for:", ctrl);
        }
	}
});
CommandManager.registerCommand('RESET', ResetCommand);
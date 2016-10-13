var ResetCommand = Command.extend({
    _name: 'RESET',
    _isPluginAction: false,
    invoke: function(action) {
        var c = ControllerManager.instanceMap[action.cType + "." + action.controller];
        if ("undefined" != typeof c) {
            c.reset();
        } else {
            console.warn("No controller find with id:", action.controller);
        }
    }
});
CommandManager.registerCommand('RESET', ResetCommand);
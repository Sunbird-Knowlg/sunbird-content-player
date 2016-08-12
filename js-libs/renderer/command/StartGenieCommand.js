var StartGenieCommand = Command.extend({
	_name: 'STARTGENIE',
	_isPluginAction: false,
	invoke: function(action) {
		if(TelemetryService._gameData.id != packageName && TelemetryService._gameData.id != packageNameDelhi) {
            TelemetryService.end(TelemetryService._gameData.id);
            setTimeout(function() {
                exitApp();
            }, 500);
        } else {
            exitApp();
        }
	}
});
CommandManager.registerCommand('STARTGENIE', StartGenieCommand);
var ProcessRecordCommand = Command.extend({
	_name: 'PROCESSRECORD',
	_isPluginAction: false,
	invoke: function(action) {
		RecorderManager.processRecording(action);
	}
});
CommandManager.registerCommand('PROCESSRECORD', ProcessRecordCommand);
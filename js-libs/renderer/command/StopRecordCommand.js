var StopRecordCommand = Command.extend({
	_name: 'STOPRECORD',
	_isPluginAction: false,
	invoke: function(action) {
		RecorderManager.stopRecording(action);
	}
});
CommandManager.registerCommand('STOPRECORD', StopRecordCommand);
var StartRecordCommand = Command.extend({
	_name: 'STARTRECORD',
	_isPluginAction: false,
	invoke: function(action) {
		RecorderManager.startRecording(action);
	}
});
CommandManager.registerCommand('STARTRECORD', StartRecordCommand);
RecorderManager = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	/*
	*	Create Audio filepath. Call Audio Recording Service to start recording.
	* 	On success response - Hide the 'start recording' message. handle success action.
	*/
	startRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stageId = plugin._stage._id;
		var path = RecorderManager._getFilePath(stageId);
		RecorderManager.recording = false;
		RecorderManager.mediaInstance = AudioRecordingService.startRecording(path);
		if (RecorderManager.mediaInstance && RecorderManager.mediaInstance.status == "OK") { // not undefined means recording started.
			plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
			RecorderManager.recording = true;
			RecorderManager.mediaInstance.filePath = path;
			if(action.success) {
				var successPlugin = PluginManager.getPluginObject(action.success);
				if (successPlugin) {
					successPlugin.show({"type": "command", "action": "show", "asset": action.success});
				} else {
					PluginManager.addError('Plugin not found for action.success - ' + action.success);
				}
			} else {
				// TODO: do something to show recording....
			}
		}
	},
	/*
	*	If the recording is inprogress, It will take the instance and try to stop recording.
	*	On success - Hide the 'recording' message.
	*/
	stopRecording: function(action) {
		if (RecorderManager.recording) {
			var response = AudioRecordingService.stopRecording(RecorderManager.mediaInstance);
			if (response.status == "OK") {
				RecorderManager.recording = false;
				if (action && action.asset) {
					var plugin = PluginManager.getPluginObject(action.asset);
					plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
				}
				console.info("Audio file saved at ", RecorderManager.mediaInstance.filePath);
				RecorderManager.mediaInstance = undefined;
			} else {
				console.error(response.errMessage);
			}
		} else {
			console.error("No recording is in progress.");
		}
	},
	_getFilePath: function(stageId) {
		var currentDate = new Date();
		var path = DownloaderService.appDataDirectory + GlobalContext.user.uid + '_' + TelemetryService._gameData.id + '_' + stageId + "_"+ currentDate.getTime()  + ".wav";
		return path;
	}
}
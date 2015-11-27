RecorderManager = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	/*
	*	Create Audio filepath. Call Audio Recording Service to start recording.
	* 	Dispatch success OR failure events.
	*/
	startRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stageId = plugin._stage._id;
		var stagePlugin = plugin._stage;
		var path = RecorderManager._getFilePath(stageId);
		RecorderManager.recording = false;
		AudioRecordingService.startRecording(path)
		.then(function(mediaInstance) {
			RecorderManager.mediaInstance = mediaInstance;
			if (RecorderManager.mediaInstance && RecorderManager.mediaInstance.status == "success") { // not undefined means recording started.
				RecorderManager.recording = true;
				RecorderManager.mediaInstance.filePath = path;
				if (action.success) {
					console.log("Firing event "+ action.success);
					stagePlugin.dispatchEvent(action.success);
				} else {
					// TODO: do something
				}
			} else {
				if (action.failure) {
					stagePlugin.dispatchEvent(action.failure);
				} else {

				}
			}
		})
		.catch(function(err) {
			console.error("Error start recording audio:", err);
		});
	},
	/*
	*	If the recording is inprogress, It will take the instance and try to stop recording.
	* 	Dispatch success OR failure events.
	*/
	stopRecording: function(action) {
		console.log("Stop recording called.");
		if (RecorderManager.recording) {
			var plugin = PluginManager.getPluginObject(action.asset);
			var stagePlugin = plugin._stage;
			AudioRecordingService.stopRecording(RecorderManager.mediaInstance)
			.then(function(response) {
				if (response.status == "success") {
					RecorderManager.recording = false;
					console.info("Audio file saved at ", RecorderManager.mediaInstance.filePath);
					if (action.success) {
						stagePlugin.dispatchEvent(action.success);
					} else {
						// TODO: somthing to do.
					}
				} else {
					console.error(response.errMessage);
					if (action.failure) {
						stagePlugin.dispatchEvent(action.failure);
					} else {
						// TODO: somthing to do.
					}
				}
			})
			.catch(function(err) {
				console.error("Error stop recording audio:", err);
				if (action.failure) {
					stagePlugin.dispatchEvent(action.failure);
				} else {
					// TODO: somthing to do.
				}
			});
			
		} else {
			console.error("No recording is in progress.");
		}
	},
	processRecording: function(action) {
		if (RecorderManager.mediaInstance) {
			var plugin = PluginManager.getPluginObject(action.asset);
			var stagePlugin = plugin._stage;
			AudioRecordingService.processRecording(RecorderManager.mediaInstance.filePath, action.lineIndex)
			.then(function(processResponse) {
				if (processResponse.status == "success") {
					if (processResponse.result) {
						console.info("Processed recording result:", JSON.stringify(processResponse));
						if (processResponse.result.totalScore == 1) {
							if (action.success) {
								stagePlugin.dispatchEvent(action.success);
							} else {
								// TODO: do something.
							}
						} else {
							if (action.failure) {
								stagePlugin.dispatchEvent(action.failure);
							} else {
								// TODO: do something.
							}
						}
					} else {
						console.info("Processed recording result:", JSON.stringify(processResponse));	
					}
				} else {
					console.info("Error while processing audio:", JSON.stringify(processResponse));
					if (action.failure) {
						stagePlugin.dispatchEvent(action.failure);
					} else {
						// TODO: do something.
					}
				}
				RecorderManager.mediaInstance = undefined;
			})
			.catch(function(err) {
				RecorderManager.mediaInstance = undefined;
				console.error("Error processing audio:", err);
			});
		} else {
			console.error("No recorded instance to process.");
		}
	},
	_getFilePath: function(stageId) {
		var currentDate = new Date();
		var path = DownloaderService.appDataDirectory + GlobalContext.user.uid + '_' + TelemetryService._gameData.id + '_' + stageId + "_"+ currentDate.getTime()  + ".wav";
		return path;
	}
}
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
		AudioRecordingService.startRecording(path)
		.then(function(mediaInstance) {
			RecorderManager.mediaInstance = mediaInstance;
			if (RecorderManager.mediaInstance && RecorderManager.mediaInstance.status == "success") { // not undefined means recording started.
				plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
				RecorderManager.recording = true;
				RecorderManager.mediaInstance.filePath = path;
				RecorderManager.mediaInstance.lineIndex = action.lineIndex;
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
		})
		.catch(function(err) {
			console.error("Error start recording audio:", err);
		});
	},
	/*
	*	If the recording is inprogress, It will take the instance and try to stop recording.
	*	On success - Hide the 'recording' message.
	*/
	stopRecording: function(action) {
		if (RecorderManager.recording) {
			AudioRecordingService.stopRecording(RecorderManager.mediaInstance)
			.then(function(response) {
				if (response.status == "success") {
					RecorderManager.recording = false;
					if (action && action.asset) {
						var plugin = PluginManager.getPluginObject(action.asset);
						plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
						console.info("Audio file saved at ", RecorderManager.mediaInstance.filePath);
						AudioRecordingService.processRecording(RecorderManager.mediaInstance.filePath, RecorderManager.mediaInstance.lineIndex)
						.then(function(processResponse) {
							if (processResponse.status == "success") {
								if (processResponse.result) {
									if (processResponse.result.totalScore == 1) {
										var successPlugin = PluginManager.getPluginObject(action.success);
										if (successPlugin) {
											successPlugin.show({"type": "command", "action": "show", "asset": action.success});
										} else {
											console.info("Processed recording result:", JSON.stringify(processResponse));
											PluginManager.addError('Plugin not found for action.success - ' + action);
										}
									} else {
										var failPlugin = PluginManager.getPluginObject(action.fail);
										if (failPlugin) {
											failPlugin.show({"type": "command", "action": "show", "asset": action.fail});
										} else {
											console.info("Processed recording result:", JSON.stringify(processResponse));
											PluginManager.addError('Plugin not found for action.fail - ' + action);
										}
									}
								} else {
									console.info("Processed recording result:", JSON.stringify(processResponse));	
								}
							} else {
								console.info("Error while processing audio:", JSON.stringify(processResponse));
							}
							RecorderManager.mediaInstance = undefined;
						})
						.catch(function(err) {
							RecorderManager.mediaInstance = undefined;
							console.error("Error processing audio:", err);
						});
					}
				} else {
					console.error(response.errMessage);
				}
			})
			.catch(function(err) {
				console.error("Error stop recording audio:", err);
			});
			
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
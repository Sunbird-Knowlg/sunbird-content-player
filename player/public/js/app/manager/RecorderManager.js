RecorderManager = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	recorder: AppConfig.recorder, // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
	getRecorder: function() {
		if (RecorderManager.recorder == "sensibol") {
			return RecorderService;
		} else {
			return AndroidRecorderService;
		}
	},
	/*
	*	Create Audio filepath. Call Audio Recording Service to start recording.
	* 	Dispatch success OR failure events.
	*/
	startRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stagePlugin = plugin._stage || plugin;
		var stageId = stagePlugin._id;
		var path = RecorderManager._getFilePath(stageId);
		RecorderManager.recording = false;
		RecorderManager.getRecorder().startRecording(path)
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
					// TODO: do something
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
			var stagePlugin = plugin._stage || plugin;
			var stageId = stagePlugin._id;
			RecorderManager.getRecorder().stopRecording(RecorderManager.mediaInstance)
			.then(function(response) {
				if (response.status == "success") {
					RecorderManager.recording = false;
					console.info("Audio file saved at ", RecorderManager.mediaInstance.filePath);
					// preload the audio file which is recorded just now and remove the old instance.
					var currentRecId = "current_rec";
					AssetManager.loadAsset(stageId, currentRecId, RecorderManager.mediaInstance.filePath);
					AudioManager.removeInstance(currentRecId);
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
			var stagePlugin = plugin._stage || plugin;
			var lineindex = stagePlugin.evaluateExpr(action.dataAttributes.lineindex);
			RecorderManager.getRecorder().processRecording(RecorderManager.mediaInstance.filePath, lineindex)
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
		var path = "";
		if (DownloaderService.appDataDirectory) 
			path = path + DownloaderService.appDataDirectory;
		if (GlobalContext.user && GlobalContext.user.uid) 
			path = path + GlobalContext.user.uid + '_' ;
		if (TelemetryService._gameData && TelemetryService._gameData.id)
			path = path + TelemetryService._gameData.id + '_';
		path = path + stageId + "_"+ currentDate.getTime()  + ".wav";
		return path;
	}
}
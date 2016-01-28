speech = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	recorder: "undefined" != typeof AppConfig && AppConfig.recorder ? AppConfig.recorder : "android", // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
	appDataDirectory: undefined,
	recordingInstances: {},
	_root: undefined,
	init: function() {
		document.addEventListener("deviceready", function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                speech._root = fileSystem.root;
            }, function(e) {
                console.log('[ERROR] Problem setting up root filesystem for running! Error to follow.');
                console.log(JSON.stringify(e));
            });
            speech.appDataDirectory = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
        });
	},
	getRecorder: function() {
        return "sensibol" == speech.recorder ? sensibol.recorder : android.recorder;
    },
	/*
	*	Create Audio filepath. Call Audio Recording Service to start recording.
	* 	Dispatch success OR failure events.
	*/
	startRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stagePlugin = plugin._stage || plugin;
		var stageId = stagePlugin._id;
		var path = speech._getFilePath(stageId);
		speech.recording = false;
		speech.getRecorder().start(path)
		.then(function(mediaInstance) {
			speech.mediaInstance = mediaInstance;
			if (speech.mediaInstance && speech.mediaInstance.status == "success") { // not undefined means recording started.
				speech.recording = true;
				speech.mediaInstance.filePath = path;
				if (action.success) {
					stagePlugin.dispatchEvent(action.success);
				}
			} else {
				if (action.failure) {
					stagePlugin.dispatchEvent(action.failure);
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
		if (speech.recording) {
			var plugin = PluginManager.getPluginObject(action.asset);
			var stagePlugin = plugin._stage || plugin;
			var stageId = stagePlugin._id;
			speech.getRecorder().stop(speech.mediaInstance)
			.then(function(response) {
				if (response.status == "success") {
					speech.recording = false;
					console.info("Audio file saved at ", speech.mediaInstance.filePath);
					// preload the audio file which is recorded just now and remove the old instance.
					var currentRecId = "current_rec";
					AssetManager.loadAsset(stageId, currentRecId, speech.mediaInstance.filePath);
					AudioManager.destroy(stageId, currentRecId);
					if (action.success) {
						stagePlugin.dispatchEvent(action.success);
					}
				} else {
					console.error(response.errMessage);
					if (action.failure) {
						stagePlugin.dispatchEvent(action.failure);
					}
				}
			})
			.catch(function(err) {
				console.error("Error stop recording audio:", err);
				if (action.failure) {
					stagePlugin.dispatchEvent(action.failure);
				}
			});
			
		} else {
			console.error("No recording is in progress.");
		}
	},
	processRecording: function(action) {
		if (speech.mediaInstance) {
			var plugin = PluginManager.getPluginObject(action.asset);
			var stagePlugin = plugin._stage || plugin;
			var lineindex = stagePlugin.evaluateExpr(action.dataAttributes.lineindex);
			speech.getRecorder().compare(speech.mediaInstance.filePath, lineindex)
			.then(function(processResponse) {
				if (processResponse.status == "success") {
					if (processResponse.result) {
						console.info("Processed recording result:", JSON.stringify(processResponse));
						if (processResponse.result.totalScore == 1) {
							if (action.success) {
								stagePlugin.dispatchEvent(action.success);
							}
						} else {
							if (action.failure) {
								stagePlugin.dispatchEvent(action.failure);
							}
						}
					} else {
						console.info("Processed recording result:", JSON.stringify(processResponse));	
					}
				} else {
					console.info("Error while processing audio:", JSON.stringify(processResponse));
					if (action.failure) {
						stagePlugin.dispatchEvent(action.failure);
					}
				}
				speech.mediaInstance = undefined;
			})
			.catch(function(err) {
				speech.mediaInstance = undefined;
				console.error("Error processing audio:", err);
			});
		} else {
			console.error("No recorded instance to process.");
		}
	},
	_getFilePath: function(stageId) {
		var currentDate = new Date();
		var path = "";
		if (speech.appDataDirectory) 
			path = path + speech.appDataDirectory;
		if (GlobalContext.user && GlobalContext.user.uid) 
			path = path + GlobalContext.user.uid + '_' ;
		if (TelemetryService._gameData && TelemetryService._gameData.id)
			path = path + TelemetryService._gameData.id + '_';
		path = path + stageId + "_"+ currentDate.getTime()  + ".wav";
		return path;
	}
}
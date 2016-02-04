
RecorderManager = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	recorder: AppConfig.recorder, // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
	appDataDirectory: undefined,
	recordingInstances: {},
	_root: undefined,
	init: function() {
		document.addEventListener("deviceready", function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                RecorderManager._root = fileSystem.root;
            }, function(e) {
                console.log('[ERROR] Problem setting up root filesystem for running! Error to follow.');
                console.log(JSON.stringify(e));
            });
            RecorderManager.appDataDirectory = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
        });
	},
	getRecorder: function() {
		if (RecorderManager.recorder == "sensibol") {
			return sensibol.recorder; 
		} else {
			return android.recorder;
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

		speech.startRecording(path, function(response) {
			if ("success" == response.status && action.success) {
				stagePlugin.dispatchEvent(action.success);
			} else if("error" == response.status && action.failure) {
				stagePlugin.dispatchEvent(action.failure);
			}
		});
	},
	/*
	*	If the recording is inprogress, It will take the instance and try to stop recording.
	* 	Dispatch success OR failure events.
	*/
	stopRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stagePlugin = plugin._stage || plugin;
		var stageId = stagePlugin._id;
		speech.stopRecording(function(response) {
			if("success" == response.status) {
				var currentRecId = "current_rec";
				AssetManager.loadAsset(stageId, currentRecId, response.filePath);
				AudioManager.destroy(stageId, currentRecId);
			}
			if ("success" == response.status && action.success) {
				stagePlugin.dispatchEvent(action.success);
			} else if("error" == response.status && action.failure) {
				stagePlugin.dispatchEvent(action.failure);
			}
		});
	},
	processRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stagePlugin = plugin._stage || plugin;
		var lineindex = stagePlugin.evaluateExpr(action.dataAttributes.lineindex);
		speech.processRecording(lineindex, null, function(response) {
			if ("success" == response.status && response.result) {
				console.info("Processed recording result:", JSON.stringify(response));
				if (response.result.totalScore == 1) {
					if (action.success) {
						stagePlugin.dispatchEvent(action.success);
					}
				} else {
					if (action.failure) {
						stagePlugin.dispatchEvent(action.failure);
					}
				}
			} else {
				console.info("Error while processing audio:", JSON.stringify(response));
				if (action.failure) {
					stagePlugin.dispatchEvent(action.failure);
				}
			}
		});
	},
	_getFilePath: function(stageId) {
		var currentDate = new Date();
		var path = "";
		if (RecorderManager.appDataDirectory) 
			path = path + RecorderManager.appDataDirectory;
		if (GlobalContext && GlobalContext.user && GlobalContext.user.uid) 
			path = path + GlobalContext.user.uid + '_' ;
		if (TelemetryService && TelemetryService._gameData && TelemetryService._gameData.id)
			path = path + TelemetryService._gameData.id + '_';
		path = path + stageId + "_"+ currentDate.getTime()  + ".wav";
		return path;
	}
}
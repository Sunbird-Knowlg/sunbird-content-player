speech = {
	mediaInstance: undefined,
	recording: false, // status - true: recording audio, false: not recording audio.
	recorder: "undefined" != typeof AppConfig && AppConfig.recorder ? AppConfig.recorder : "android", // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
	recordingInstances: {},
	_root: undefined,
	//_deleteMyrecFile:false,
	getRecorder: function() {
        return "sensibol" == speech.recorder ? sensibol.recorder : android.recorder;
    },
	/*
	*	Create Audio filepath. Call Audio Recording Service to start recording.
	* 	Dispatch success OR failure events.
	*/
	startRecording: function(path, cb) {
		speech.recording = false;
		speech.getRecorder().start(path)
		.then(function(mediaInstance) {
			speech.mediaInstance = mediaInstance;
			if (speech.mediaInstance && speech.mediaInstance.status == "success") { // not undefined means recording started.
				speech.recording = true;
				speech.mediaInstance.filePath = path;
			}
			cb(mediaInstance);
		})
		.catch(function(err) {
			console.error("Error start recording audio:", err);
			cb({status: "error", error: err});
		});
	},
	/*
	*	If the recording is inprogress, It will take the instance and try to stop recording.
	* 	Dispatch success OR failure events.
	*/
	stopRecording: function(cb) {
		if (speech.recording && speech.mediaInstance) {
			speech.getRecorder().stop(speech.mediaInstance)
			.then(function(response) {
				if ("success" == response.status) {
					speech.recording = false;
					console.info("Audio file saved at ", speech.mediaInstance.filePath);
					cb(speech.mediaInstance);
				} else {
					cb(response);
				}
			})
			.catch(function(err) {
				console.error("Error stop recording audio:", err);
				cb({status: "error", error: err});
			});
		} else {
			cb({status: "error", error: "no recording instance available."});
		}
	},
	processRecording: function(lineindex, filePath, cb) {
		filePath = filePath ? filePath : ((speech.mediaInstance)? speech.mediaInstance.filePath : "");
		if (filePath && lineindex) {
			speech.getRecorder().process(filePath, lineindex)
			.then(function(response) {
				speech.mediaInstance = undefined;
				cb(response);
			})
			.catch(function(err) {
				console.error("Error processing audio:", err);
				cb({status:"error", error: err});
			});
		}
	}
}
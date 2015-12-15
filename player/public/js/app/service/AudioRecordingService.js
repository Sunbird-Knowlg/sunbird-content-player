AudioRecordingService = {
	recorder: AppConfig.recorder, // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
	init: function(recorder) {
		if(recorder) {
			AudioRecordingService.recorder = recorder;	
		}
	},
	startRecording: function(path) {
		if (AudioRecordingService.recorder == 'sensibol') {
			return SensibolRecorder.startRecording(path);
		} else {
			return AndroidRecorder.startRecording(path);
		}
	},
	stopRecording: function(instance) {
		if (AudioRecordingService.recorder == 'sensibol') {
			return SensibolRecorder.stopRecording(instance);
		} else {
			return AndroidRecorder.stopRecording(instance);
		}
	},
	processRecording: function(path, lineIndex) {
		if (AudioRecordingService.recorder == 'sensibol') {
			return SensibolRecorder.processRecording(path, lineIndex);
		} else {
			return AndroidRecorder.processRecording(path, lineIndex);
		}
	}
};

// TODO: change them to return promise. ***

AndroidRecorder = {
	startRecording: function(path) {
		return new Promise(function(resolve, reject) {
			var instance = {};
			if (typeof Media != "undefined") {
				var media = new Media(path,
			        function() {
			            console.info("Audio recording successfull.");
			        },
			        function(err) {
			            console.error("Error Audio recording: "+ err.code);
			        }
			    );
			    media.startRecord();
			    instance.media = media;
			    instance.status = "success";
			} else {
				instance.status = "success";
				instance.errMessage = "Media is not available.";
				console.info("AndroidRecorder.startRecording called.");
			}
			resolve(instance);
		});
	},
	stopRecording: function(instance) {
		return new Promise(function(resolve, reject) {
			var result = {};
			if (typeof Media != "undefined") {
				if (instance && instance.media) {
					instance.media.stopRecord();
					instance.media.release();
					result = {status: "success"};
				} else {
					result = {status: "ERROR", errMessage: "Error recording not started."};
				}
			} else {
				console.info("AndroidRecorder.stopRecording called.");
				result = {status: "success", errMessage: "Media is not available."};
			}
			resolve(result);
		});
	},
	processRecording: function(path, lineIndex) {
		return new Promise(function(resolve, reject) {
			resolve({status: "success", errMessage: "Process recording for android is not integrated."});
		});
	}
};

SensibolRecorder = {
	initLesson: function(lessonMetadataFile) {
		return RecorderService.initLesson(lessonMetadataFile);
	},
	startRecording: function(path) {
		return new Promise(function(resolve, reject) {
			if (typeof RecorderService != "undefined") {
				RecorderService.startRecording(path)
				.then(function(result) {
					resolve(result);
				})
				.catch(function(err) {
					console.error("Error AudioRecordingService startRecording:", err);
					reject(err);
				});
			} else {
				resolve({status: "success", errMessage: "Sensibol is not integrated."});
			}
		});
	},
	stopRecording: function(instance) {
		return new Promise(function(resolve, reject) {
			if (typeof RecorderService != "undefined") {
				RecorderService.stopRecording()
				.then(function(result) {
					console.log("recording stopped:", result);
					resolve(result);
				})
				.catch(function(err) {
					console.error("Error AudioRecordingService stopRecording:", err);
					reject(err);
				});
			} else {
				resolve({status: "success", errMessage: "Sensibol is not integrated."});
			}
		});
	},
	processRecording: function(path, lineIndex) {
		return new Promise(function(resolve, reject) {
			if (typeof RecorderService != "undefined") {
				RecorderService.processRecording(path, lineIndex)
				.then(function(result) {
					resolve(result);
				})
				.catch(function(err) {
					console.error("Error AudioRecordingService processRecording:", err);
					reject(err);
				});
			} else {
				resolve({status: "success", result: {totalScore: 1}, errMessage: "Sensibol is not integrated."});
			}
		});
	}
};
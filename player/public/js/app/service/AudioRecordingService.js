AudioRecordingService = {
	recorder: 'android', // 'android' - uses cordova-plugin-media for recording audio. :: 'sensibol': uses sensibol api for recording audio.
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
	}
};

AndroidRecorder = {
	startRecording: function(path) {
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
		    instance.status = "OK";
		} else {
			instance.status = "OK";
			instance.errMessage = "Media is not available.";
			console.info("AndroidRecorder.startRecording called.");
		}
		return instance;
	},
	stopRecording: function(instance) {
		if (typeof Media != "undefined") {
			if (instance && instance.media) {
				instance.media.stopRecord();
				instance.media.release();
				return {status: "OK"};
			} else {
				return {status: "ERROR", errMessage: "Error recording not started."};
			}
		} else {
			console.info("AndroidRecorder.stopRecording called.");
			return {status: "OK", errMessage: "Media is not available."};
		}
	}
};

SensibolRecorder = {
	startRecording: function(path) {
		// TODO: integrate with sensibol API.
		return {status: "ERROR", errMessage: "Sensibol is not integrated."};
	},
	stopRecording: function(instance) {
		// TODO: integrate with sensibol API.
		return {status: "ERROR", errMessage: "Sensibol is not integrated."};
	}
};
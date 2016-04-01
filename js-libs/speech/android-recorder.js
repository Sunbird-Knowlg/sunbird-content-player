var android =  (android)? android : {};
android.recorder = {
	start: function(path) {
		return new Promise(function(resolve, reject) {
			var result = {};
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
			    result.media = media;
			    result.status = "success";
			} else {
				result.status = "success";
				result.errMessage = "Media is not available.";
				console.info("AndroidRecorder.startRecording called.");
			}
			resolve(result);
		});
	},
	stop: function(instance) {
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
	process: function(path, lineIndex) {
		return new Promise(function(resolve, reject) {
			resolve({status: "success", result: {totalScore: 1}, errMessage: "Process recording for android is not integrated."});
		});
	}
};
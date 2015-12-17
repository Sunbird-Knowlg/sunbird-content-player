var exec = require('cordova/exec');

function RecorderService() {
}

RecorderService.prototype.initLesson = function(lessonMetadataFile) {
    lessonMetadataFile = lessonMetadataFile.replace("file://", "");
    console.log("RecorderService initLesson: ", lessonMetadataFile);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log('Init Lesson successfully sent');
                    resolve(true);
                } else {
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "RecorderService", "initLesson", [lessonMetadataFile]);
    });

}

RecorderService.prototype.startRecording = function(recordingFile) {
    recordingFile = recordingFile.replace("file://", "");
    console.log("RecorderService startRecording: ", recordingFile);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log('Start Recording successfull.');
                    resolve(result);
                } else {
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "RecorderService", "startRecording", [recordingFile]);
    });
}

RecorderService.prototype.stopRecording = function() {
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log('Stop Recording successfull.');
                    resolve(result);
                } else {
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "RecorderService", "stopRecording", []);
    });
}

RecorderService.prototype.processRecording = function(recordingFile, lineNumber) {
    recordingFile = recordingFile.replace("file://", "");
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log('Process Recording successfull. ::', JSON.stringify(result));
                    resolve(result);
                } else {
                    console.log('Process Recording failed. ::', JSON.stringify(result));
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "RecorderService", "processRecording", [recordingFile, lineNumber]);
    });
}


var recorderService = new RecorderService();
module.exports = recorderService;
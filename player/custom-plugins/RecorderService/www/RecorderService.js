var exec = require('cordova/exec');

function RecorderService() {
}

RecorderService.prototype.handleAction = function(actionName, args) {
    console.info("Action:" + actionName + "args: ", args);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log(actionName + ' successfull. ::', JSON.stringify(result));
                    resolve(result);
                } else {
                    console.log(actionName + ' failed. ::', JSON.stringify(result));
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "RecorderService", actionName, args);
    });
}

RecorderService.prototype.initLesson = function(lessonMetadataFile) {
    lessonMetadataFile = lessonMetadataFile.replace("file://", "");
    return this.handleAction("initLesson", [lessonMetadataFile]);
}

RecorderService.prototype.startRecording = function(recordingFile) {
    recordingFile = recordingFile.replace("file://", "");
    return this.handleAction("startRecording", [recordingFile]);
}

RecorderService.prototype.stopRecording = function() {
    return this.handleAction("stopRecording", []);
}

RecorderService.prototype.processRecording = function(recordingFile, lineNumber) {
    recordingFile = recordingFile.replace("file://", "");
    return this.handleAction("processRecording", [recordingFile, lineNumber]);
}


var recorderService = new RecorderService();
module.exports = recorderService;
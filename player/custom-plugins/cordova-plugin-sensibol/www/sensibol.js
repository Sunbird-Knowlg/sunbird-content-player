var exec = require('cordova/exec');

function sensibol() {
}

sensibol.prototype.handleAction = function(actionName, args) {
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
            "sensibol", actionName, args);
    });
}

sensibol.prototype.initLesson = function(lessonMetadataFile) {
    lessonMetadataFile = lessonMetadataFile.replace("file://", "");
    return this.handleAction("initLesson", [lessonMetadataFile]);
}

sensibol.prototype.startRecording = function(recordingFile) {
    recordingFile = recordingFile.replace("file://", "");
    return this.handleAction("startRecording", [recordingFile]);
}

sensibol.prototype.stopRecording = function() {
    return this.handleAction("stopRecording", []);
}

sensibol.prototype.processRecording = function(recordingFile, lineNumber) {
    recordingFile = recordingFile.replace("file://", "");
    return this.handleAction("processRecording", [recordingFile, lineNumber]);
}


var recorderService = new sensibol();
module.exports = recorderService;
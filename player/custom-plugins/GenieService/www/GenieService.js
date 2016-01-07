var exec = require('cordova/exec');

function GenieService() {}

GenieService.prototype.handleAction = function(actionName, args) {
    console.info("GenieService Action: " + actionName + " args: ", args);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                console.log("GenieService result of "+actionName+": ", result);
                resolve(result);
            },
            function(error) {
                console.log("GenieService error of "+actionName+": ", error);
                reject(error);
            },
            "GenieService", actionName, args);
    });
}

GenieService.prototype.sendTelemetry = function(aString) {
    console.log("GenieService sendTelemetry: ", aString);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                if (result.status == 'success') {
                    console.log('Telemetry successfully sent');
                    resolve(true);
                } else {
                    reject(result);
                }
            },
            function(error) {
                reject(error);
            },
            "GenieService", "sendTelemetry", [aString]);
    });
}

GenieService.prototype.getCurrentUser = function() {
    return this.handleAction("getCurrentUser", []);
}

GenieService.prototype.getMetaData = function() {
    return this.handleAction("getMetaData", []);
}

GenieService.prototype.getContent = function(id) {
    return this.handleAction("getContent", [id]);
}

GenieService.prototype.getContentList = function(filter) {
    return this.handleAction("getContentList", [filter]);
}

var genieService = new GenieService();
module.exports = genieService;
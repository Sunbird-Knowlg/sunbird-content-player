var exec = require('cordova/exec');

function GenieService() {}

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
    console.log("GenieService getCurrentUser... ");
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                resolve(result);
            },
            function(error) {
                reject(error);
            },
            "GenieService", "getCurrentUser", []);
    });
}

GenieService.prototype.getMetaData = function() {
    console.log("GenieService getMetaData... ");
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                resolve(result);
            },
            function(error) {
                reject(error);
            },
            "GenieService", "getMetaData", []);
    });
}

GenieService.prototype.getContent = function(id) {
    console.log("GenieService getContent...");
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                console.log("GenieService.getContent Result:", JSON.stringify(result));
                resolve(result);
            },
            function(error) {
                console.log("GenieService.getContent Error:", error);
                reject(error);
            },
            "GenieService", "getContent", [id]);
    });
}

var genieService = new GenieService();
module.exports = genieService;
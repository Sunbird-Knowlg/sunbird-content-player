var exec = require('cordova/exec');

function telemetry() {}

telemetry.prototype.send = function(aString) {
    console.log("telemetry send: ", aString);
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
            "GenieServicePlugin", "sendTelemetry", [aString]);
    });
}

module.exports = new telemetry();

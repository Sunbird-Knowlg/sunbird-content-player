var exec = require('cordova/exec');

function genieservice() {}

genieservice.prototype.handleAction = function(actionName, args) {
    console.info("genieservice Action: " + actionName + " args: ", args);
    return new Promise(function(resolve, reject) {
        exec(function(result) {
                console.log("genieservice result of " + actionName + ": ", result);
                resolve(result);
            },
            function(error) {
                console.log("genieservice error of " + actionName + ": ", error);
                reject(error);
            },
            "GenieServicePlugin", actionName, args);
    });
}

genieservice.prototype.getCurrentUser = function() {
    return this.handleAction("getCurrentUser", []);
}

genieservice.prototype.getMetaData = function() {
    return this.handleAction("getMetaData", []);
}

genieservice.prototype.getContent = function(id) {
    return this.handleAction("getContent", [id]);
}

genieservice.prototype.getContentList = function(filter) {
    return this.handleAction("getContentList", [filter]);
}

genieservice.prototype.endGenieCanvas = function() {
    // return this.handleAction("endGenieCanvas", []);
    exec(function(result) {
            console.log("End Genie Canvas successful: ", result);
        },
        function(error) {
            console.log("End Genie Canvas error: ", error);
        },
        "GenieServicePlugin", "endGenieCanvas", []);
}

module.exports = new genieservice();
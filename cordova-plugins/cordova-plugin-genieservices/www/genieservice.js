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

genieservice.prototype.getRelatedContent = function(id) {
    return this.handleAction("getRelatedContent", [id]);
}

genieservice.prototype.getLearnerAssessment = function(uid, id) {
    return this.handleAction("getLearnerAssessment", [uid,id]);
}

genieservice.prototype.getContentList = function(filter) {
    return this.handleAction("getContentList", [filter]);
}

genieservice.prototype.sendFeedback = function(evt) {
    return this.handleAction("sendFeedback", [evt]);
}

genieservice.prototype.languageSearch = function(filter) {
    return this.handleAction("languageSearch", [filter]);
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

genieservice.prototype.launchContent = function(id){
    this.handleAction("getContent", [id])
    .then(function(resp){
        var item = {};
        item = resp;
        var data = item.localData || item.serverData;
        if (item.path && data) {
            var path = (item.path.charAt(item.path.length-1) == '/')? item.path.substring(0, item.path.length-1): item.path;
            var contentUrl = "file://" + path + '/index.html?eksCid='+ data.identifier;
          
            console.log("Opening through cordova custom webview.");
            //webview.Show(contentUrl);
            window.cordova.InAppBrowser.open(contentUrl, '_self', 'location=no,hardwareback=no');
          
        } else {
            if(!data) data = {};
            data.status = "error";
            console.info("Path is not available for content:", item);
        }
    })
    .catch(function(err){
        console.log("Failed to lunch new content", err);
    })
}

module.exports = new genieservice();
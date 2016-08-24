genieservice_HTMLdev = {
    localData: {},
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            result.data = {
                "avatar": "resource1",
                "gender": "male",
                "handle": "handle1",
                "uid": "8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy",
                "age": 6,
                "standard": -1
            };
            resolve(result);
        });
    },
    getContent: function(id) {
         return new Promise(function(resolve, reject) {
            var result = _.findWhere(genieservice_HTMLdev.localData.content, {"identifier": id});
            resolve(result);
        });
    },
    getLocalData: function(){
       jQuery.getJSON("test/localData.json", function(json) {
            genieservice_HTMLdev.localData = json;
            console.log("LocalData json loaded", genieservice_HTMLdev.localData);
        });
    },
    languageSearch: function(inputFilter){
        return new Promise(function(resolve, reject) {
            resolve(genieservice_HTMLdev.localData.languageSearch);
        });
    },
    launchContent:function(contentId, config){
        if("undefined" == typeof contentId){
            contentId = "do_20045479"
        }

        //Get new content data from GenieService
        var newContent = {};
        genieservice_HTMLdev.getContent(contentId)
        .then(function(resp){
            newContent.metadata = resp;
            console.log("Launch new HTML content..");
            if (newContent && newContent.metadata.mimeType && newContent.metadata.mimeType == 'application/vnd.ekstep.html-archive') {
              // Launching new content 
              var basePath = (newContent.metadata.path.charAt(newContent.metadata.path.length-1) == '/')? newContent.metadata.path.substring(0, newContent.metadata.path.length-1): newContent.metadata.path;
              var path = "http://"+ location.host + "/" + basePath; 

              newContent.metadata.baseDir =  path;
              var contentUrl =  newContent.metadata.baseDir + '/index.html?cid='+ contentId + "&config="+ config;
              console.log("Opening through window.open");
              window.open(contentUrl, '_self');              
            }else{

            }
        })
        .catch(function(err){
            console.log("Failed", err);
        })
    }
};
genieservice_portal = {
    api: {
        basePath: '/v2/content/',
        getFullAPI: function() {
            return AppConfig[AppConfig.flavor] + this.basePath;
        }
    },
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            result.data = {
                "avatar": "resource1",
                "gender": "male",
                "handle": "handle1",
                "uid": "8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy",
                "age": 6,
                "standard": -1
            };
            resolve(result);
        });
    },
    getMetaData: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result = {
                "flavor": "sandbox",
                "version": "1.0.1"
            };
            resolve(result);
        });
    },
    getContentBody: function(id) {
        return new Promise(function(resolve, reject) {    
        jQuery.get(genieservice_portal.api.getFullAPI() + id + "?fields=body", {"Content-Type" : "application/json"}, function(resp) {
            var result = {};
            if (!resp.error) {
                result.list = resp;
                resolve(resp.result.content);
            } else {
                console.info("err : ", resp.error)
            }
        });
        });
    },
    getContent: function(id){
        return new Promise(function(resolve, reject) {
            if(COLLECTION_MIMETYPE == content.metadata.mimeType) {
                resolve(genieservice.getContentMetadata(id));
            } else {
                if(content) {
                    resolve(content.metadata);
                } 
            }
        });
    },
    getContentMetadata: function(id) {
        return new Promise(function(resolve, reject) {    
        jQuery.get(genieservice_portal.api.getFullAPI() + id, {"Content-Type" : "application/json"}, function(resp) {
            var result = {};
            if (!resp.error) {
                result.list = resp;
                var metadata = resp.result.content;
                var map = {};
                map.identifier = metadata.identifier;
                map.localData = metadata;
                map.mimeType = metadata.mimeType;
                map.isAvailable = true;
                map.path = "stories/" + metadata.code;
                resolve(map);
            } else {
                console.info("err : ", resp.error)
            }
        });
        });
    },
    launchContent:function(contentId){
        if("undefined" == typeof contentId){
            contentId = "do_20045479"
        }

        //Get new content data from GenieService
        var newContent = {};
        genieservice_HTMLdev.getContent(contentId)
        .then(function(resp){
            newContent.metadata = resp;
            console.log("Launch new HTML content..");
            if (newContent && newContent.metadata.mimeType && newContent.metadata.mimeType == 'application/vnd.ekstep.html-archive') {
              // Launching new content 
              var basePath = (newContent.metadata.path.charAt(newContent.metadata.path.length-1) == '/')? newContent.metadata.path.substring(0, newContent.metadata.path.length-1): newContent.metadata.path;
              var path = "http://"+ location.host + "/" + basePath; 

              newContent.metadata.baseDir =  path;
              var contentUrl =  newContent.metadata.baseDir + '/index.html?eksCid='+ contentId;
              console.log("Opening through window.open");
              window.open(contentUrl, '_self');              
            }
        })
        .catch(function(err){
            console.log("Failed", err);
        })
    }

};
if ("undefined" == typeof cordova) {
    if("undefined" == typeof isbrowserpreview) {
        if("undefined" == typeof AppConfig){
            genieservice = genieservice_HTMLdev;
            genieservice.getLocalData();
            console.log("Local genieservice", genieservice);
        }
    }
    else{
        genieservice = genieservice_portal;
         console.log("Portal genieservice", genieservice);
    }
}

telemetry_web = {
    tList: [],
    send: function(string) {
        console.log(string);
        return new Promise(function(resolve, reject) {
            telemetry_web.tList.push(string);
            resolve(true);
        });
    }
};
if ("undefined" == typeof cordova) telemetry = telemetry_web;
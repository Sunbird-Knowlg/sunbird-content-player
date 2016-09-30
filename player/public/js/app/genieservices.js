genieservice_web = {
    api: {
        basePath: '/genie-canvas/v2/',
        contentList: 'content/list',
        getFullAPI: function(specificApi) {
            return this.basePath + specificApi;
        },
        getContentList: function() {
            return this.getFullAPI(this.contentList);
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
    getContent: function(id, url) {
        if(isbrowserpreview) {
            return new Promise(function(resolve, reject) {
                if(content) {
                    resolve(content.metadata);
                } 
            });
        } else {
            return new Promise(function(resolve, reject) {
                    jQuery.post(genieservice_web.api.getContentList(), function(resp) {
                        var result = {};
                        if (!resp.error) {
                            result.list = resp;
                            var item = _.findWhere(resp.content, { "identifier": id });
                            resolve(item);
                        } else {
                            
                            reject(resp);
                        }
                    })
                    .fail(function(err) {
                        reject(err);
                    });
                });
            }     
    },
    getContentList: function(filter) {
        return new Promise(function(resolve, reject) {
            jQuery.post(genieservice_web.api.getContentList(), function(resp) {
                    var result = {};
                    if (!resp.error) {
                        result.list = resp.content;
                        resolve(result);
                    } else {
                        reject(resp);
                    }
                })
                .fail(function(err) {
                    reject(err);
                });
        });
    },
    setAPIEndpoint: function(endpoint) {
        return endpoint;
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
            if(!(typeof content == 'undefined')) {
                if("application/vnd.ekstep.content-collection" == content.metadata.mimeType) {
                    resolve(genieservice.getContentMetadata(id));
                } else {                
                    resolve(content.metadata);                
                }
            } else{
                resolve(genieservice.getContentMetadata(id));
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
    }
};

genieservice_html = {
    localData: {},
    _jsFilesToLoad: [],
    _callback: undefined,
    _jsFileIndex: 0,
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            /*var result = {};
            result.status = "success";
            result.data = {
                "avatar": "resource1",
                "gender": "male",
                "handle": "handle1",
                "uid": "8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy",
                "age": 6,
                "standard": -1
            };
            resolve(result);*/
            if(genieservice_html.localData.user) {
                var user = {};
                _.isArray(genieservice_html.localData.user) ? resolve(genieservice_html.localData.user[0]) : resolve(genieservice_html.localData.user);
            } else {
                reject("no user found.")
            }
            
        });
    },
    getContent: function(id) {
         return new Promise(function(resolve, reject) {
            var result = _.findWhere(genieservice_html.localData.content, {"identifier": id});
            resolve(result);
        });
    },
    getLocalData: function(callback){
        genieservice_html._callback = callback;
        genieservice_html._jsFileIndex = 0;
        genieservice_html._jsFilesToLoad = [];
        
        genieservice_html._jsFilesToLoad.push("test/fixture-content-list.json");
        genieservice_html._jsFilesToLoad.push("test/fixture-user-list.json");
        genieservice_html._jsFilesToLoad.push("test/fixture-word-list.json");
        genieservice_html.loadJsFilesSequentially();
    },
    loadJsFilesSequentially: function(){
         if (genieservice_html._jsFilesToLoad[genieservice_html._jsFileIndex]) {
            var fileLoaded = genieservice_html._jsFilesToLoad[genieservice_html._jsFileIndex];
            jQuery.getJSON(fileLoaded, function(json) {
                _.extend(genieservice_html.localData, json);
                console.log("LocalData json loaded", genieservice_html.localData);
                genieservice_html._jsFileIndex = genieservice_html._jsFileIndex + 1;
                genieservice_html.loadJsFilesSequentially();
            });
        } else {
            console.log("js files load complete.");
            if(genieservice_html._callback){
                console.log("local Files loaded successfully.");
                genieservice_html._callback();                
            }else{
                console.log("local Files loaded successfully. But no callback function");
            }
        }
    }
};
if ("undefined" == typeof cordova) {
    if("undefined" == typeof isbrowserpreview) {
        if("undefined" == typeof AppConfig){
            genieservice = genieservice_html;
            console.log("HTML Local genieservice", genieservice);
        }else{
             genieservice = genieservice_web;
        }
    }
    else{
        genieservice = genieservice_portal;
        console.log("Portal genieservice", genieservice);
    }
    /*if(isbrowserpreview) {
        genieservice = genieservice_portal;
    }
    else{
        genieservice = genieservice_web;
    }*/
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
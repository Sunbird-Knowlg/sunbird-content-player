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
        console.log("AppConfig : ", id);
        if(AppConfig.APP_STATUS == 'AT') {
            return new Promise(function(resolve, reject) {
                if(contentMetadata) {
                    resolve(contentMetadata);
                } else {
                    jQuery.post(genieservice_web.api.getContentList(), function(resp) {
                        // console.log("resp : ", resp);
                        var result = {};
                        if (!resp.error) {
                            result.list = resp;
                            console.log(result.list);
                            var item = _.findWhere(resp.content, { "identifier": id });
                            console.log(item);
                            resolve(item);
                        } else {
                            
                            reject(resp);
                        }
                    })
                    .fail(function(err) {
                        reject(err);
                    });
                }
            });
        } else {
            return new Promise(function(resolve, reject) {
                jQuery.post(genieservice_web.api.getContentList(), function(resp) {
                    var result = {};
                    if (!resp.error) {
                        result.list = resp.content;
                        console.log(result.list);
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
if ("undefined" == typeof cordova) genieservice = genieservice_web;

telemetry_web = {
    tList: [],
    send: function(string) {
        return new Promise(function(resolve, reject) {
            console.log(string);
            telemetry_web.tList.push(string);
            resolve(true);
        });
    }
};
if ("undefined" == typeof cordova) telemetry = telemetry_web;
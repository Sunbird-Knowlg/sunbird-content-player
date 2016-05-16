genieservice_web = {
    api: {
        basePath: '/genie-canvas/v2/',
        contentList: 'content/list',
        getFullAPI: function(specificApi){
            return this.basePath + specificApi;
        },
        getContentList: function(){
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
        return new Promise(function(resolve, reject) {
            jQuery.post(genieservice_web.api.getContentList(), function(resp) {
                    var result = {};
                    if (!resp.error) {
                        result.list = resp.content;
                        var item = _.findWhere(resp.content, { "identifier": id });
                        resolve(item);
                    } else {
                        reject(resp);
                    }
                })
                .fail(function(err) {
                    reject(err);
                });
        //     resolve({
        //     "identifier": "org.ekstep.quiz.app",
        //     "mimeType": "application/vnd.ekstep.content-collection",
        //     "localData": {
        //         "questionnaire": null,
        //         "appIcon": "stories/quizapp_bugs/logo.png",
        //         "subject": "literacy_v2",
        //         "description": "Ekstep Content App",
        //         "name": "Ekstep Content App",
        //         "downloadUrl": "",
        //         "checksum": null,
        //         "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...",
        //         "concepts": [{
        //             "identifier": "LO1",
        //             "name": "Receptive Vocabulary",
        //             "objectType": "Concept"
        //         }],
        //         "identifier": "org.ekstep.quiz.app",
        //         "grayScaleAppIcon": null,
        //         "pkgVersion": 1
        //     },
        //     "isAvailable": true,
        //     "path": "stories/quizapp_bugs"
        // });

        });
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
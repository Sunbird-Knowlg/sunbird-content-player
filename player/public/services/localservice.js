org.ekstep.service.local = new(org.ekstep.service.mainService.extend({
    init:function(){
        console.info('Local service init');
    },
    initialize:function(){
        console.info("html service intialize");
    },
    api: {
        basePath: '/genie-canvas/v2/',
        contentList: 'content/list',
        getAPI: function(specificApi) {
            return this.basePath + specificApi;
        },
        getContentList: function() {
            return this.getAPI(this.contentList);
        }
    },
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            $.getJSON("assets/user_list/user_list.json",function(data){
                result.data = data.userList[0];
                resolve(result);
            })
        });
    },
    getUsersList: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            $.getJSON("assets/user_list/user_list.json",function(data){
                // console.log("===== data =====", data);
                result.data = data.userList;
                resolve(result);
            })
        });
    },
    setCurrentUser: function(uid) {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            // result.data = usersList;
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
                    jQuery.post(org.ekstep.service.local.api.getContentList(), function(resp) {
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
            jQuery.post(org.ekstep.service.local.api.getContentList(), function(resp) {
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
    sendTelemetry: function(data) {
        return new Promise(function(resolve, reject) {
            resolve(data);
        });
    },
    setAPIEndpoint: function(endpoint) {
        return endpoint;
    }
}));
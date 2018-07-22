org.ekstep.service.local = new(org.ekstep.service.mainService.extend({
    init:function(){
    },
    initialize:function(){
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
            $.getJSON("assets/user_list/user_list.json", function(data) {
                if (data.length == 0) {
                    data = [{"uid": "9g8h4ndAnonymouscg56ngd"}];
                }
                resolve(data[0]);
            })
        });
    },

    getAllUserProfile: function() {
        return new Promise(function(resolve, reject) {
            $.getJSON("assets/user_list/user_list.json",function(data){
                resolve(data);
            })
        });
    },

    getAllGroupUsers: function() {
        return new Promise(function(resolve, reject) {
            $.getJSON("assets/user_list/group_user_list.json", function(data) {
                resolve(data);
            })
        });
    },

    setUser: function(uid) {
        return new Promise(function(resolve, reject) {
            resolve(true);
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
org.ekstep.service.renderer = org.ekstep.service.local;
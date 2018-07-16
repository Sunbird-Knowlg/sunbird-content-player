org.ekstep.service.content = new(org.ekstep.service.mainService.extend({
    assessEvents: {},
    init: function() {
    },
    getContentList: function(filter, childrenIds) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.content._filterContentList(filter, childrenIds)
                .then(function(result) {
                    resolve(org.ekstep.service.content._getAvailableContentList(result));
                })
                .catch(function(err) {
                    console.log(AppErrors.contentListFetch, err);
                    reject(err);
                });
        });
    },
    getContent: function(id) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getContent(id)
                .then(function(resp) {
                    var item = resp;

                    // New genie resp object having diffrent fields. Hence we are assigning new feilds to old fields
                    if (item.contentData) item.localData = item.contentData;
                    if (item.isAvailableLocally) item.isAvailable = item.isAvailableLocally;

                    if (item.isAvailable) {
                        resolve(org.ekstep.service.content._prepareContent(item));
                    } else {
                        reject("Content is not available.");
                    }
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    getContentAvailability: function(id) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getContent(id)
                .then(function(contentData) {
                    if (!_.isUndefined(contentData)) {
                        contentData.isAvailable = contentData.isAvailableLocally;
                        resolve(contentData.isAvailable);
                    } else {
                        console.error("Content is not available.");
                        reject("Content is not available.");
                    }
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    getRelatedContent: function(list, contentId, uid) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getRelatedContent(list, contentId, uid)
                .then(function(item) {
                    if (item) {
                        resolve(item);
                    } else {
                        reject("Content is not available.");
                    }
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    // Get the Total Assessment score of particular user of particular content.
    getLearnerAssessment: function(uid, id, contentExtras) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getLearnerAssessment(uid, id, contentExtras)
                .then(function(score) {
                    if (score)
                        resolve(score);
                    else
                        reject("Score is not available.")
                });
        });
    },
    getContentBody: function(id, urlParams) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getContentBody(id, urlParams)
                .then(function(body) {
                    resolve(body);
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    getContentMetadata: function(id, urlParams) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getContentMetadata(id, urlParams)
                .then(function(metadata) {
                    resolve(metadata);
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    _prepareContent: function(item) {
        var data = item.localData || item.serverData || item.contentData;
        if (_.isUndefined(item.path)) {
            item.path = item.basePath;
        }

        if (item.path && data) {
            var path = (item.path.charAt(item.path.length - 1) == '/') ? item.path.substring(0, item.path.length - 1) : item.path;
            path = (window.cordova) ? "file://" + path : path;
            data.baseDir = path;
            globalConfig.basepath = path;
            if ("undefined" != typeof cordova)
                data.appIcon = (data.appIcon) ? path + "/" + data.appIcon : path + "/logo.png";
            else
                data.appIcon = (isbrowserpreview) ? data.appIcon : path + "/logo.png";
            data.mimeType = item.mimeType;
            data.status = "ready";
            data.isAvailable = item.isAvailable;
        } else {
            if (!data) data = {};
            data.status = "error";
            console.info("Path is not available for content:", item);
        }
        return data;
    },
    _filterContentList: function(filter, childrenIds) {
        return new Promise(function(resolve, reject) {
            var list = [];
            var returnResult = function(list, errorMessage) {
                if (errorMessage) console.error(errorMessage);
                resolve(list);
            };
            if (filter || childrenIds) {
                new Promise(function(resolve, reject) {
                        var promises = [];
                        if (childrenIds && childrenIds.length > 0) {
                            _.each(childrenIds, function(childId) {
                                promises.push(function(callback) {
                                    org.ekstep.service.renderer.getContent(childId)
                                        .then(function(item) {
                                            callback(null, item);
                                        })
                                        .catch(function(err) {
                                            callback(null, err);
                                        });
                                });
                            });
                            async.parallel(promises, function(err, resList) {
                                list = resList;
                                resolve(list);
                            });
                        } else {
                            resolve(list);
                        }
                    })
                    .then(function() {
                        if (filter) {
                            org.ekstep.service.renderer.getContentList(filter)
                                .then(function(result) {
                                    list = _.union(list, result.list);
                                    returnResult(list);
                                })
                                .catch(function(err) {
                                    returnResult(list, "Error while fetching filtered content:" + JSON.stringify(err));
                                });
                        } else {
                            returnResult(list);
                        }
                    })
                    .catch(function(err) {
                        returnResult(list, "Error while fetching filterContentList:" + JSON.stringify(err));
                    })
            } else {
                if ("undefined" != typeof cordova) {
                    returnResult(list, "Error while fetching filtered content: Empty Collection");
                } else {
                    org.ekstep.service.renderer.getContentList([])
                        .then(function(result) {
                            returnResult(result.list);
                        })
                        .catch(function(err) {
                            returnResult(list, "Error while fetching filterContentList:" + JSON.stringify(err));
                        });
                }
            }
        });
    },
    _getAvailableContentList: function(list) {
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        list = _.filter(list, function(item) {
            return item.isAvailable && _.indexOf(globalConfig.mimetypes, item.mimeType) > -1;
        });
        list = _.map(list, function(item) {
            return org.ekstep.service.content._prepareContent(item);
        });
        list = _.filter(list, function(data) {
            return data.status == "ready";
        });
        return list;
    },
    getAllUserProfile: function() {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getAllUserProfile()
                .then(function(data) {
                    resolve(data);
                })
                .catch(function(err) {
                    console.error(AppErrors.contetnPathFetch, err);
                    reject(err);
                });
        });
    },
    getUser: function(uid) {

    },
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.getCurrentUser().then(function(data) {
                resolve(data);
            }).catch(function(err) {
                console.error(AppErrors.contetnPathFetch, err);
                reject(err);
            });
        });
    },
    setUser: function(uid) {
        return new Promise(function(resolve, reject) {
            org.ekstep.service.renderer.setUser(uid).then(function(data) {
                resolve(data);
            }).catch(function(err) {
                console.error(AppErrors.contetnPathFetch, err);
                reject(err);
            });
        });
    },
    cacheAssessEvent: function(qid, event) {
        this.assessEvents[qid] = event;
    },
    getTelemetryAssessEvents: function() {
        return this.assessEvents;
    },
    clearCacheAssessEvent: function() {
        this.assessEvents = {};
    }

}));
angular.module('genie-canvas.services', ['ngResource'])
    .factory('ContentService', ['$window', '$rootScope', function($window, $rootScope) {
        var returnObject = {
            _SUPPORTED_MIMETYPES: ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive", "application/vnd.ekstep.content-collection"],
            getContentList: function(filter, childrenIds) {
                return new Promise(function(resolve, reject) {
                    returnObject._filterContentList(filter, childrenIds)
                        .then(function(result) {
                            resolve(returnObject._getAvailableContentList(result));
                        })
                        .catch(function(err) {
                            console.log(AppErrors.contentListFetch, err);
                            reject(err);
                        });
                });
            },
            getContent: function(id) {
                return new Promise(function(resolve, reject) {
                    genieservice.getContent(id)
                        .then(function(item) {
                            if (item.isAvailable) {
                                resolve(returnObject._prepareContent(item));
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
                    genieservice.getContent(id)
                       .then(function(contentData) {
                           if(!_.isUndefined(contentData)){
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
            getRelatedContent: function(uid, list) {
                return new Promise(function(resolve, reject) {
                    genieservice.getRelatedContent(uid, list)
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
            getLearnerAssessment: function(uid, id) {
                return new Promise(function(resolve, reject) {
                    genieservice.getLearnerAssessment(uid, id)
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
                    genieservice.getContentBody(id, urlParams)
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
                    genieservice.getContentMetadata(id, urlParams)
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
                var data = item.localData || item.serverData;
                if (item.path && data) {
                    var path = (item.path.charAt(item.path.length - 1) == '/') ? item.path.substring(0, item.path.length - 1) : item.path;
                    path = ($window.cordova) ? "file://" + path : path;
                    data.baseDir = path;
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
                                            genieservice.getContent(childId)
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
                                    genieservice.getContentList(filter)
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
                            genieservice.getContentList([])
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
                list = _.filter(list, function(item) {
                    return item.isAvailable && _.indexOf(returnObject._SUPPORTED_MIMETYPES, item.mimeType) > -1;
                });
                list = _.map(list, function(item) {
                    return returnObject._prepareContent(item);
                });
                list = _.filter(list, function(data) {
                    return data.status == "ready";
                });
                return list;
            }
        };
        return returnObject;
    }]);

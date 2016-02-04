angular.module('quiz.services', ['ngResource'])
    .factory('ContentService', ['$window', '$rootScope', function($window, $rootScope) {
        var returnObject = {
            _SUPPORTED_MIMETYPES: ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
            getContentList: function(filter, childrenIds) {
                return new Promise(function(resolve, reject) {
                    returnObject._filterContentList(filter, childrenIds)
                    .then(function(result) {
                        resolve(returnObject._getAvailableContentList(result));
                    })
                    .catch(function(err) {
                        console.log("Error while fetching content list:", err);
                        reject("Error while fetching content list.");
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
                        console.error("Error while fetching content path:", err);
                        reject(err);
                    });
                });
            },
            _prepareContent: function(item) {
                var data = item.localData || item.serverData;
                if (item.path && data) {
                    var path = (item.path.charAt(item.path.length-1) == '/')? item.path.substring(0, item.path.length-1): item.path;
                    path = ($window.cordova)? "file://" + path : path; 
                    data.baseDir =  path;
                    data.appIcon = path + "/logo.png";
                    data.mimeType = item.mimeType;
                    data.status = "ready";
                } else {
                    if(!data) data = {};
                    data.status = "error";
                    console.info("Path is not available for content:", item);
                }
                return data;
            },
            _filterContentList: function(filter, childrenIds) {
                return new Promise(function(resolve, reject) {
                    genieservice.getContentList(filter)
                    .then(function(result) {
                        if (childrenIds && childrenIds.length > 0) {
                            resolve(_.filter(result.list, function(item) {
                                return childrenIds.indexOf(item.id) > -1;
                            }));
                        } else {
                            resolve(result.list);
                        }
                    })
                    .catch(function(err) {
                        console.error("Error while fetching and filtering content list: ", err);
                        reject(err);
                    });
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


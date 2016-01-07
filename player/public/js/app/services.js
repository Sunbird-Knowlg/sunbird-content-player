angular.module('quiz.services', ['ngResource'])
    .factory('ContentService', ['$window', '$rootScope', function($window, $rootScope) {
        var returnObject = {
            getContentList: function(filter) {
                return new Promise(function(resolve, reject) {
                    var service = ($window.cordova)? GenieService: PlatformService;
                    service.getContentList(filter)
                    .then(function(result) {
                        resolve(returnObject._filterContentList(result.list));
                    })
                    .catch(function(err) {
                        console.log("Error while fetching content list:", err);
                        reject("Error while fetching content list.");
                    });
                });
            },
            getContent: function(id) {
                return new Promise(function(resolve, reject) {
                    GenieService.getContent(id)
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
                var data = item.serverData;
                if (item.path) {
                    var path = (item.path.charAt(item.path.length-1) == '/')? item.path.substring(0, item.path.length-1): item.path;
                    path = "file://" + path; 
                    data.baseDir =  path;
                    data.appIcon = path + "/logo.png";
                    data.status = "ready";
                } else {
                    data.status = "error";
                    console.info("Path is not available for content:", item);
                }
                return data;
            },
            _filterContentList: function(list) {
                list = _.filter(list, function(item) {
                    return item.isAvailable && (item.mimeType == "application/vnd.ekstep.ecml-archive" || item.mimeType == "application/vnd.ekstep.html-archive");
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


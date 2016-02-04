/**
 * Content Service - Invoke MW API's, transform data for UI and viceversa
 * @author Jitendra Singh Sankhwar
 */
var async = require('async'),
    restClient = require('../helpers/RESTClientWrapper'),
    _ = require('underscore'),
    fs = require('fs'),
    Download = require('download'),
    jsonfile = require('jsonfile'),
    mimeType = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    downloading = false,
    isAvailableList = [],
    contentList = [],
    path = "app-data/content-list.json";

exports.getContentList = function(cb, type, contentType) {
    var args = {
        path: {
            type: type,
            contentType: contentType
        },
        data: {
            request: {}
        }
    }
    if (!downloading) {
        downloading = true;
        restClient.postCall("/taxonomy-service/v1/game/list", args, function(err, data) {
            if (err) {
                cb(err);
            } else {
                var contents = data.result;
                var result = {};
                var contentList = [];
                _.each(contents.games, function(object) {
                    if (_.contains(mimeType, object.mimeType)) {
                        var map = {};
                        map.identifier = object.identifier;
                        map.localData = object;
                        map.mimeType = object.mimeType;
                        map.isAvailable = false;
                        map.path = "stories/" + object.code;
                        contentList.push(map);
                    }

                });
                localStorage(contentList, function(err, data) {
                    if (err)
                        console.log(err);
                });
            }
        });
    } else {
        var result = {};
        result.content = isAvailableList;
        cb(null, result);
    }
}

function localStorage(contents, cb) {
    var localMap = {};
    var asyncTask = [];

    jsonfile.readFile(path, function(err, localMap) {
        if (localMap == undefined) {
            var promises = [];
            _.each(contents, function(content) {
                asyncTask.push(function(callback) {
                    downloadHelper(content);
                })
            });
            async.parallel(asyncTask, function(err, result) {
                cb(err, result);
            });
        } else {
            _.each(contents, function(content) {
                var dir = appConfig.STORY + "/" + content.localData.code;

                if (fs.existsSync(dir) && _.findWhere(localMap, {
                        "identifier": content.identifier
                    })) {
                    var localContent = _.findWhere(localMap, {
                        "identifier": content.identifier
                    });
                    if (content.localData.pkgVersion != localContent.localData.pkgVersion) {
                        asyncTask.push(function(callback) {
                            downloadHelper(content);
                        })
                    } else {
                        localContent.isAvailable = true;
                        isAvailableList.push(localContent);
                        contentList.push(localContent);
                        writeFile(contentList);
                        cb(localContent);
                    }
                } else {
                    asyncTask.push(function(callback) {
                        downloadHelper(content);
                    })
                }
            });
            async.parallel(asyncTask, function(err, result) {
                cb(err, result);
            });
        }
    });
}

function writeFile(obj) {
    jsonfile.writeFile(path, obj, {
        spaces: 2
    }, function(err) {
        if (err)
            console.error(err);
    });
}

function downloadHelper(content) {
    return new Promise(function(resolve, reject) {
        download(content.localData.downloadUrl, appConfig.STORY + content.localData.code)
            .then(function(resp) {
                content.isAvailable = true;
                isAvailableList.push(content);
                contentList.push(content);
                writeFile(contentList);
                resolve(content);
            }).catch(function(err) {
                reject(err);
            });
    });
}

function download(src, dest) {
    return new Promise(function(resolve, reject) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        new Download({
                mode: '777',
                extract: true
            }).get(src).dest(dest)
            .run(function(err, files) {
                if (err)
                    reject(err)
                else
                    resolve({
                        "downloading": "success"
                    });
            });
    });
}
'use strict';

app.controllerProvider.register("ContentListCtrl", function($scope, $rootScope, $state) {
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    $scope.imageBasePath = globalConfig.assetbase;
    $rootScope.pageId = 'ContentApp-Collection';
    $scope.version = GlobalContext.game.ver;
    $scope.stories = [];

    $scope.resetContentListCache = function() {
        var collectionContentId = "org.ekstep.contentplayer";
        org.ekstep.service.content.getContent(collectionContentId)
            .then(function(content) {
                GlobalContext.previousContentId = content.identifier;
                if (!_.findWhere(collectionPath, {
                        identifier: collectionContentId
                    }))
                    collectionPath.push({
                        identifier: content.identifier,
                        mediaType: "Collection"
                    });

                if (collectionPathMap[content.identifier]) {
                    var pathArr = collectionPathMap[content.identifier];
                    if (pathArr[pathArr.length - 1].mediaType.toLowerCase() == "content") {
                        collectionPath = pathArr;
                        collectionPath.pop()
                    } else {
                        collectionPath = pathArr;
                    }
                }
                if (!_.contains(stack, content.identifier))
                    stack.push(content.identifier);
                if (COLLECTION_MIMETYPE == content.mimeType) {
                    $rootScope.title = content.name;
                    $rootScope.collection = content;
                    TelemetryService.start(content.identifier, content.pkgVersion);
                } else {
                    $rootScope.collection = {};
                }
                var childrenIds = (content.children) ? _.pluck(_.sortBy(content.children, function(child) {
                    return child.index;
                }), "identifier") : null;
                if (childrenIds)
                    collectionChildrenIds = childrenIds;
                collectionChildren = true;
                var filter = (content.filter) ? JSON.parse(content.filter) : content.filter;
                return org.ekstep.service.content.getContentList(filter, childrenIds);
            })
            .then(function(result) {
                EkstepRendererAPI.dispatchEvent("renderer:splash:hide");

                $scope.$apply(function() {
                    $scope.stories = result;
                });
                if ($scope.stories && $scope.stories.length <= 0) {
                    showToaster('error', AppMessages.NO_CONTENT_LIST_FOUND);
                }
            })
            .catch(function(err) {
                $scope.$apply(function() {
                    $scope.stories = [];
                });
                console.error(err);
                showToaster('error', AppMessages.ERR_GET_CONTENT_LIST);
            });
    };
    $scope.playContent = function(content) {
        globalConfig.basepath = content.baseDir;
        globalConfig.basePath = globalConfig.basepath
        EkstepRendererAPI.dispatchEvent("renderer:splash:show");
        $rootScope.content = content;
        if (content.mimeType == COLLECTION_MIMETYPE) {
            console.info("collection nat handled")
        } else {
            GlobalContext.currentContentId = content.identifier;
            GlobalContext.currentContentMimeType = content.mimeType;
            collectionPath.push({
                identifier: content.identifier,
                mediaType: "Content"
            });
            $scope.showCollection = false;
           org.ekstep.contentrenderer.startGame(content);
        }
    };
    $scope.simulateCrash = function(fatal) {
        if (navigator.crashlytics) {
            if (fatal === true) {
                console.log("Simulating fatal crash for Crashlytics");
                navigator.crashlytics.simulateCrash("Simulated crash");
            } else {
                console.log("Simulating non-fatal error for Crashlytics");
                navigator.crashlytics.logException("Simulated non-fatal error");
            }
            console.log("Simulation sent to Crashlytics");
        } else {
            console.log("Crashlytics not available for reporting");
        }
    };

    $scope.exitApp = function() {
        exitApp();
    };
    $scope.init = function() {
        $scope.showCollection = true;
        $rootScope.title = GlobalContext.config.appInfo ? GlobalContext.config.appInfo.name : "";
        $scope.resetContentListCache();
    };
    EkstepRendererAPI.addEventListener('renderer:collection:hide',function(){
        $scope.showCollection = false;
    });

    EkstepRendererAPI.addEventListener('renderer:collection:show',function(){
        $scope.showCollection = true;
        $scope.init();
    });
    $scope.init();
});
//# sourceURL=contentlistAPP.js

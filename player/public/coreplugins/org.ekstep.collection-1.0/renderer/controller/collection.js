'use strict';

app.controllerProvider.register("ContentListCtrl", function($scope, $rootScope, $state) {
    $rootScope.pageId = 'ContentApp-Collection';
    $scope.version = GlobalContext.game.ver;
    $rootScope.stories = [];
    $rootScope.showMessage = false;

    $rootScope.$on('show-message', function(event, data) {
        if (data.message && data.message != '') {
            $rootScope.$apply(function() {
                $rootScope.showMessage = true;
                $rootScope.message = data.message;
            });
        }
        if (data.timeout) {
            setTimeout(function() {
                $rootScope.$apply(function() {
                    $rootScope.showMessage = false;
                });
                if (data.callback) {
                    data.callback();
                }
            }, data.timeout);
        }
    });

    $rootScope.renderMessage = function(message, timeout, reload) {
        $rootScope.$broadcast('show-message', {
            "message": message,
            "timeout": timeout
        });
    }

    $scope.resetContentListCache = function() {
        org.ekstep.contentrenderer.progressbar(false);
        var collectionContentId = "org.ekstep.quiz.app";
        $rootScope.renderMessage("", 0);
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
                    localStorageGC.setItem("collection", $rootScope.collection);
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
                $rootScope.$apply(function() {
                    $rootScope.stories = result;
                });
                if ($rootScope.stories && $rootScope.stories.length <= 0) {
                    $rootScope.renderMessage(AppMessages.NO_CONTENT_LIST_FOUND);
                }
            })
            .catch(function(err) {
                $rootScope.$apply(function() {
                    $rootScope.stories = [];
                });
                console.error(err);
                $rootScope.renderMessage(AppMessages.ERR_GET_CONTENT_LIST, 3000);
            });
    };
    $scope.playContent = function(content) {
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
           org.ekstep.contentrenderer.startGame();
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
    });
    
    $scope.init();


});
//# sourceURL=contentlistAPP.js
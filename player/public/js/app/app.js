// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var stack = new Array();

function launchInitialPage(appInfo, $state) {
    TelemetryService.init(GlobalContext.game, GlobalContext.user).then(function() {
        if (CONTENT_MIMETYPES.indexOf(appInfo.mimeType) > -1) {
            $state.go('showContent', {"contentId": GlobalContext.game.id});
        } else if ((COLLECTION_MIMETYPE == appInfo.mimeType) ||
            (ANDROID_PKG_MIMETYPE == appInfo.mimeType && appInfo.code == packageName)) {
            //$state.go('showContent', {});
             $state.go('contentList', { "id": GlobalContext.game.id });
        } else {
            alert("App launched with invalid context.");
            exitApp();
        }
    }).catch(function(error) {
        console.log('TelemetryService init failed');
        alert('TelemetryService init failed.');
        exitApp();
    });
}

angular.module('genie-canvas', ['genie-canvas.theme','ionic', 'ngCordova', 'genie-canvas.services', 'genie-canvas.template'])
    .run(function($ionicPlatform, $ionicModal, $cordovaFile, $cordovaToast, ContentService, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            console.log('ionic platform is ready...');
            if ("undefined" == typeof Promise) {
                alert("Your device isn’t compatible with this version of Genie.");
                exitApp();
            }
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            } else {
                AppConfig.recorder = "android";
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            $ionicPlatform.onHardwareBackButton(function() {
                backbuttonPressed();
            });
            $ionicPlatform.on("pause", function() {
                Renderer.pause();
            });
            $ionicPlatform.on("resume", function() {
                Renderer.resume();
            });

            genieservice.getMetaData().then(function(data) {
                var flavor = data.flavor;
                if (AppConfig[flavor] == undefined)
                    flavor = "sandbox";
                GlobalContext.config.flavor = flavor;
            });


            GlobalContext.init(packageName, version).then(function(appInfo) {
                launchInitialPage(GlobalContext.config.appInfo, $state);
            }).catch(function(res) {
                console.log("Error Globalcontext.init:", res);
                alert(res.errors);
                exitApp();
            });
        });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('contentList', {
                cache: false,
                url: "/content/list/:id",
                templateUrl: "templates/content-list.html",
                controller: 'ContentListCtrl'
            })
            .state('showContent', {
                url: "/show/content/:contentId",
                templateUrl: "templates/content.html",
                controller: 'ContentHomeCtrl'
            })
            .state('showContentEnd', {
                url: "/content/end/:contentId",
                templateUrl: "templates/end.html",
                controller: 'EndPageCtrl'
            })
            .state('playContent', {
                url: "/play/content/:itemId",
                templateUrl: "templates/renderer.html",
                controller: 'ContentCtrl'
            });
    })
    .controller('ContentListCtrl', function($scope, $rootScope, $http, $ionicModal, $cordovaFile, $cordovaDialogs, $cordovaToast, $ionicPopover, $state, $stateParams, $q, ContentService, $ionicHistory) {

        var id = $stateParams.id;

        $ionicModal.fromTemplateUrl('about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.aboutModal = modal;
        });

        $scope.version = GlobalContext.game.ver;
        $scope.flavor = GlobalContext.config.flavor;
        $scope.currentUser = GlobalContext.user;
        $rootScope.title = GlobalContext.config.appInfo.name;
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
            // jQuery("#loadingDiv").show();

            $rootScope.isCollection = true;
            $rootScope.renderMessage("", 0);
            ContentService.getContent(id)
                .then(function(content) {
                    GlobalContext.previousContentId = content.identifier;
                    stack.push(content.identifier);
                    if (COLLECTION_MIMETYPE == content.mimeType) {
                        $rootScope.title = content.name;
                        // if (!_.isEmpty($rootScope.collection))
                        //     TelemetryService.end();
                        $rootScope.collection = content;
                        TelemetryService.start(content.identifier, content.pkgVersion);
                    } else {
                        $rootScope.collection = {};
                    }
                    var childrenIds = (content.children) ? _.pluck(_.sortBy(content.children, function(child) {
                        return child.index; }), "identifier") : null;
                    var filter = (content.filter) ? JSON.parse(content.filter) : content.filter;
                    return ContentService.getContentList(filter, childrenIds);
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
            if (content.mimeType == COLLECTION_MIMETYPE) {
                $state.go('contentList', { "id": content.identifier });
                GlobalContext.previousContentMimeType = content.mimeType;
                GlobalContext.previousContentId = content.identifier;
            } else {
                stack.pop();
                GlobalContext.currentContentId = content.identifier;
                GlobalContext.currentContentMimeType = content.mimeType;
                // $state.go('playContent', { 'itemId': content.identifier });
                 $state.go('showContent', {"contentId": content.identifier});
            }
        };


        //  

        $scope.showAboutUsPage = function() {
            $scope.aboutModal.show();
        };

        $scope.hideAboutUsPage = function() {
            $scope.aboutModal.hide();
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

        $scope.goBack = function() {
            stack.pop();
            var id = stack.pop();
            if(id)
                $state.go('contentList', { "id": id});
            else
                exitApp();

            // window.history.back();
            // // Note: the below condition is valid only on mobile.
            // setTimeout(function() {
            //     if ("file:///android_asset/www/index.html" == window.location.href) {
            //         exitApp();
            //     } else if (window.location.href.indexOf('/content/list/') == -1) {
            //         window.history.go(-3);
            //     }
            // }, 50);

        }

        $scope.resetContentListCache();

    }).controller('ContentCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
        if ($stateParams.itemId) {
            $scope.item = _.findWhere($rootScope.stories, { identifier: $stateParams.itemId });
            console.log($scope.item, $stateParams.itemId, $rootScope.stories);
            if ($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
                HTMLRenderer.start($scope.item.baseDir, 'gameCanvas', $scope.item, function() {
                    jQuery('#gameAreaLoad').hide();
                    jQuery('#gameArea').hide();
                    var path = $scope.item.baseDir + '/index.html';
                    $scope.currentProjectUrl = path;
                    jQuery("#htmlFrame").show();
                });
            } else {
                Renderer.start($scope.item.baseDir, 'gameCanvas', $scope.item);
            }
        } else {
            alert('Name or Launch URL not found.');
            $state.go('contentList', { "id": GlobalContext.game.id });
        }

        // new methods for new ui impl for GoTOGenie and GoToHome buttons.

        $scope.gotToEndPage = function() {
            $state.go('showEndPage', {});
        }

        $scope.reloadStage = function() {
            reloadStage();
        }
       

        $scope.$on('$destroy', function() {
            setTimeout(function() {
                if ($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
                    HTMLRenderer.cleanUp();
                } else {
                    Renderer.cleanUp();
                }
            }, 100);
        })
        $rootScope.showMessage = false;
        $rootScope.$on('show-message', function(event, data) {
            if (data.message && data.message != '') {
                $rootScope.$apply(function() {
                    $rootScope.showMessage = true;
                    $rootScope.message = data.message;
                });
            }
            if (data) {
                setTimeout(function() {
                    $rootScope.$apply(function() {
                        $rootScope.showMessage = false;
                    });
                }, 5000);
            }
        });
    });

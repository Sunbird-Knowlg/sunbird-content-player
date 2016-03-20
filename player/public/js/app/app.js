// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive";


function backbuttonPressed() {
    var data = (Renderer.running || HTMLRenderer.running) ? {
        type: 'EXIT_CONTENT',
        stageId: Renderer.theme._currentStage
    } : {
        type: 'EXIT_APP'
    };
    TelemetryService.interact('END', 'DEVICE_BACK_BTN', 'EXIT', data);
}

function exitApp() {
     navigator.startApp.start(geniePackageName, function(message) {
            try {
                TelemetryService.exit(packageName, version);
            } catch (err) {
                console.error('End telemetry error:', err.message);
            }
            if (navigator.app) {
                navigator.app.exitApp();
            }
            if (navigator.device) {
                navigator.device.exitApp();
            }
            if (window) {
                window.close();
            }
        },
        function(error) {
            alert("Unable to start Genie App.");
        });
}

function startApp(app) {
     if (!app) app = geniePackageName;
    navigator.startApp.start(app, function(message) {
            exitApp();
            TelemetryService.exit(packageName, version)
        },
        function(error) {
            if (app == geniePackageName)
                alert("Unable to start Genie App.");
            else {
                var bool = confirm('App not found. Do you want to search on PlayStore?');
                if (bool) cordova.plugins.market.open(app);
            }
        });
}

function launchInitialPage(appInfo, $state) {    
        TelemetryService.init(GlobalContext.game, GlobalContext.user).then(function() {
            if (CONTENT_MIMETYPES.indexOf(appInfo.mimeType) > -1) {
                $state.go('showContent', {});
            } else if ((COLLECTION_MIMETYPE == appInfo.mimeType) || 
                (ANDROID_PKG_MIMETYPE == appInfo.mimeType && appInfo.code == packageName)) {
                GlobalContext.game.id = GlobalContext.config.appInfo.code;
                $state.go('contentList', {"id": GlobalContext.game.id});
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

function contentNotAvailable() {
    alert(AppMessages.NO_CONTENT_FOUND);
    exitApp();
}

angular.module('quiz', ['ionic', 'ngCordova', 'quiz.services'])
    .run(function($ionicPlatform, $ionicModal, $cordovaFile, $cordovaToast, ContentService, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            console.log('ionic platform is ready...');
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
            }).catch(function(error) {
                console.log("Error Globalcontext.init:", error);
                if (error == 'CONTENT_NOT_FOUND') {
                    contentNotAvailable();
                } else {
                    alert('Please open this app from Genie.');
                    exitApp();    
                }
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
                url: "/show/content",
                templateUrl: "templates/content.html",
                controller: 'ContentHomeCtrl'
            })
            .state('playContent', {
                url: "/play/content/:itemId",
                templateUrl: "templates/renderer.html",
                controller: 'ContentCtrl'
            });
    })
    .controller('ContentListCtrl', function($scope, $rootScope, $http, $ionicModal, $cordovaFile, $cordovaDialogs, $cordovaToast, $ionicPopover, $state, $stateParams, $q, ContentService) {

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
            if (data.reload) {
                // TODO: remove this if condition.
            }
        });

        $rootScope.renderMessage = function(message, timeout, reload) {
            $rootScope.$broadcast('show-message', {
                "message": message,
                "timeout": timeout,
                "reload": reload
            });
        }

        $scope.resetContentListCache = function() {
            // jQuery("#loadingDiv").show();
            $rootScope.renderMessage("", 0);            
            ContentService.getContent(id)
            .then(function(content) {
                var childrenIds = (content.children) ? _.pluck(content.children, 'identifier') :null;
                if (COLLECTION_MIMETYPE == content.mimeType) {
                    $rootScope.title = content.name;
                    if (!_.isEmpty($rootScope.collection)) 
                        TelemetryService.end();
                    $rootScope.collection = content;
                    TelemetryService.start(content.identifier, content.pkgVersion);
                } else {
                    $rootScope.collection = {};
                }
                return ContentService.getContentList(content.filter, childrenIds);
            })
            .then(function(result) {
                $rootScope.$apply(function() {
                    $rootScope.stories = result;
                });
                if($rootScope.stories && $rootScope.stories.length <=0) {
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

        $scope.showBackButton = function(){
            if($scope.collectionItems.length > 0){
                return true;
            }else{
                return false;
            }
        }

        $scope.playContent = function(content) {
            if (content.mimeType == COLLECTION_MIMETYPE) {
                $state.go('contentList', {"id": content.identifier});
            } else {
                $state.go('playContent', {'itemId': content.identifier});    
            }
        };

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
                }
                else {
                    console.log("Simulating non-fatal error for Crashlytics");
                    navigator.crashlytics.logException("Simulated non-fatal error");
                }
                console.log("Simulation sent to Crashlytics");
            }
            else {
                console.log("Crashlytics not available for reporting");
            }
        };

        $scope.exitApp = function() {
            exitApp();
        };
        // TODO: remove this method.
        $scope.clearAllContent = function() {}

        $scope.resetContentListCache();

    }).controller('ContentCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
        if ($stateParams.itemId) {
            console.log("$rootScope.stories:", $rootScope.stories);
            $scope.item = _.findWhere($rootScope.stories, {identifier: $stateParams.itemId});
            console.log($scope.item);
            if($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
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
            $state.go('contentList', {"id": GlobalContext.game.id});
        }
        $scope.$on('$destroy', function() {
            setTimeout(function() {
                if($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
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
    }).controller('ContentHomeCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
        $rootScope.showMessage = false;
        if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.identifier) {
            $scope.playContent = function(content) {
                $state.go('playContent', {
                    'itemId': content.identifier
                });
            };

            $scope.updateContent = function(content) {
                ContentService.getContent(content.identifier)
                    .then(function(data) {
                        $scope.$apply(function() {
                            $scope.item = data;
                        });
                        $rootScope.stories = [data];
                    })
                    .catch(function(err) {
                        contentNotAvailable();
                    });
            }

            $scope.startGenie = function() {
                console.log("Start Genie.");
                exitApp();
            };

            $scope.updateContent(GlobalContext.config.appInfo);
            $rootScope.$on('show-message', function(event, data) {
                if (data.message && data.message != '') {
                    $rootScope.showMessage = true;
                    $rootScope.message = data.message;
                    $rootScope.$apply();
                }
                if (data.timeout) {
                    setTimeout(function() {
                        $rootScope.showMessage = false;
                        $rootScope.$apply();
                        if (data.callback) {
                            data.callback();
                        }
                    }, data.timeout);
                }
            });

            $rootScope.$on('process-complete', function(event, result) {
                $scope.$apply(function() {
                    $scope.item = result.data;
                });
            });
        } else {
            alert('Sorry. Could not find the content.');
            startApp();
        }
    });

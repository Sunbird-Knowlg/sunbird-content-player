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
        // TODO: check and remove this event.
        type: 'EXIT_APP'
    };
    TelemetryService.interact('END', 'DEVICE_BACK_BTN', 'EXIT', data);
    if (Renderer.running || HTMLRenderer.running) 
        initBookshelf();
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
                TelemetryService.start();
                $state.go('showContent', {});
            } else if (COLLECTION_MIMETYPE == appInfo.mimeType) {
                GlobalContext.game.id = GlobalContext.config.appInfo.code;
                TelemetryService.start();
                $state.go('contentList', {});
            } else if (ANDROID_PKG_MIMETYPE == appInfo.mimeType && appInfo.code == packageName) {
                GlobalContext.game.id = GlobalContext.config.appInfo.code;
                TelemetryService.start();
                $state.go('contentList', {});
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

function onEnterController() {
    jQuery('#loading').hide();
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
                if (!Renderer.running) {
                    setTimeout(function() {
                        initBookshelf();
                    }, 500);
                }
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
                url: "/content/list",
                templateUrl: "templates/content-list.html",
                controller: 'ContentListCtrl',
                onEnter: onEnterController()
            })
            .state('showContent', {
                url: "/show/content",
                templateUrl: "templates/content.html",
                controller: 'ContentHomeCtrl',
                onEnter: onEnterController()
            })
            .state('playContent', {
                url: "/play/content/:itemId",
                templateUrl: "templates/renderer.html",
                controller: 'ContentCtrl'
            });
    })
    .controller('ContentListCtrl', function($scope, $rootScope, $http, $ionicModal, $cordovaFile, $cordovaDialogs, $cordovaToast, $ionicPopover, $state, $q, ContentService) {
        
        //To Store current selected collectio item
        $scope.collectionItem; 
        $scope.rootStories;
        $scope.collectionItems = [];

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
                $rootScope.$apply(function() {
                    $rootScope.loadBookshelf();
                });
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
            jQuery("#loadingDiv").show();
            $rootScope.renderMessage("", 0);
            var childrenIds = (GlobalContext.config.appInfo.children) ? _.pluck(GlobalContext.config.appInfo.children, 'identifier') :null;
            ContentService.getContentList(GlobalContext.filter, childrenIds)
            .then(function(result) {
                $rootScope.$apply(function() {
                    $rootScope.stories = result;
                });
                $rootScope.loadBookshelf();
                if($rootScope.stories && $rootScope.stories.length <=0) {
                    $rootScope.renderMessage(AppMessages.NO_CONTENT_LIST_FOUND);
                } else {
                    // No need to show this message
                    //$rootScope.renderMessage(AppMessages.SUCCESS_GET_CONTENT_LIST, 3000);
                }
            })
            .catch(function(err) {
                $rootScope.$apply(function() {
                    $rootScope.stories = [];
                });
                console.error(err);
                $rootScope.loadBookshelf();
                $rootScope.renderMessage(AppMessages.ERR_GET_CONTENT_LIST, 3000);
            });
        };

        $rootScope.loadBookshelf = function() {
            initBookshelf();
        };

        $scope.showBackButton = function(){
            if($scope.collectionItems.length > 0){
                return true;
            }else{
                return false;
            }
        }

        /**
         * This is to show the selected collection, children in BookShell
         */
        $scope.showCollectionItems = function(){
            if($scope.collectionItem.children){
                var contChildren = $scope.collectionItem.children;
                if(contChildren.length > 0){
                    //For Back button reference
                    $scope.updateCollectionItems($scope.collectionItem);

                    //Used to go back to home
                    $scope.duplicateRootStories();

                    $scope.stories = [];
                    //Getting selected collection item childrens to show in the bookshell
                    _.each(contChildren, function(child){
                        var story = _.findWhere($scope.rootStories, {'identifier': child.identifier});
                        $scope.stories.push(story);
                    });                        
                }
            }
        };

        /**
         * Back to parent collection in bookshell
         */
        $scope.backToParentCollection = function(){
            if($scope.collectionItems.length == 1){
                //Go to root/home list
                $scope.stories = angular.copy($scope.rootStories);
                $scope.collectionItems = [];
                $scope.collectionItem = null;
            }else{
                //go to parent collection list 
                var parentCollection = $scope.collectionItems.pop();
                parentCollection = _.findWhere($scope.rootStories, {'identifier': parentCollection.identifier});
                $scope.playContent(parentCollection);
            }
        };

        /**
         * this is to duplicate root stories. 
         * After selecting nested collection items, we can show root items directly 
         */
        $scope.duplicateRootStories = function(){
            //Storing base root stories
            if(_.isUndefined($scope.rootStories)){
                $scope.rootStories = angular.copy($scope.stories);                
            }
        };

        /**
         * This is used to back button functionality.
         * When user want to go back to parent collection, then we are getting the last item from this collection 
         */
        $scope.updateCollectionItems = function(content){
            var collectionItem = {
                identifier: content.identifier,
            }
            $scope.collectionItems[$scope.collectionItems.length] = collectionItem;
        }

        $scope.playContent = function(content) {
            if(content.mimeType == COLLECTION_MIMETYPE){
                //Selected item is of type "Collection". So show its child items in BookShell
                $scope.collectionItem = content;
                $scope.showCollectionItems();
                return;
            }
            $state.go('playContent', {
                'itemId': content.identifier
            });
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

        $rootScope.loadBookshelf();
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
            $state.go('contentList');
        }
        $scope.$on('$destroy', function() {
            setTimeout(function() {
                if($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
                    HTMLRenderer.cleanUp();
                } else {
                    Renderer.cleanUp();
                }
                initBookshelf();
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

function initBookshelf() {
    setTimeout(function() {

        var numRows = ((screen.height < 599) ? 1 : 2);
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }

        console.log('Loading completed....');
        jQuery("#loadingDiv").hide();
    }, 100);
}

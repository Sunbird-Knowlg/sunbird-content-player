// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var packageName = "org.ekstep.quiz.app";
var version = AppConfig.version;
var packageNameDelhi = "org.ekstep.delhi.curriculum";
var geniePackageName = "org.ekstep.android.genie";

function backbuttonPressed() {
    var ext = (Renderer.running || HTMLRenderer.running) ? {
        type: 'EXIT_CONTENT',
        stageId: Renderer.theme._currentStage
    } : {
        type: 'EXIT_APP'
    };
    TelemetryService.interact('END', 'DEVICE_BACK_BTN', 'EXIT').ext(ext).flush();
    (Renderer.running || HTMLRenderer.running) ? initBookshelf(): exitApp();
}

function exitApp() {
    navigator.startApp.start(geniePackageName, function(message) {
            try {
                if (TelemetryService._gameData) {
                    TelemetryService.end(packageName, version);
                }
            } catch(err) {
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
    if(!app) app = geniePackageName;
    navigator.startApp.start(app, function(message) {
            exitApp();
            if (TelemetryService._gameData) {
                TelemetryService.end(packageName, version);
            }
        },
        function(error) {
            if(app == geniePackageName)
                alert("Unable to start Genie App.");
            else {
                var bool = confirm('App not found. Do you want to search on PlayStore?');
                if(bool) cordova.plugins.market.open(app);
            }
        });
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

            GlobalContext.init(packageName, version).then(function() {
                if (!TelemetryService._gameData) {
                    TelemetryService.init(GlobalContext.game).then(function() {
                        if (GlobalContext.config.appInfo &&
                            GlobalContext.config.appInfo.code &&
                            GlobalContext.config.appInfo.code != packageName
                                && (typeof GlobalContext.config.appInfo.filter == 'undefined')) {
                            TelemetryService.start();
                            $state.go('showContent', {});
                        } else {
                            if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.code) {
                                GlobalContext.game.id = GlobalContext.config.appInfo.code;
                            }
                            TelemetryService.start();
                            $state.go('contentList', {});
                        }
                    }).catch(function(error) {
                        console.log('TelemetryService init failed');
                    });
                }
            }).catch(function(error) {
                alert('Please open this app from Genie.');
                exitApp();
            });
        });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('contentList', {
                url: "/content/list",
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
    .controller('ContentListCtrl', function($scope, $rootScope, $http, $ionicModal, $cordovaFile, $cordovaDialogs, $cordovaToast, $ionicPopover, $state, $q, ContentService) {

        $ionicModal.fromTemplateUrl('about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.aboutModal = modal;
        });

        $scope.environmentList = [{
            text: "Sandbox",
            value: "API_SANDBOX"
        }, {
            text: "Production",
            value: "API_PRODUCTION"
        }];
        $scope.selectedEnvironment = {
            value: "API_SANDBOX"
        };
        $scope.version = GlobalContext.game.ver;
        $scope.flavor = GlobalContext.config.flavor;
        $scope.tab1 = 'Stories';
        $scope.tab2 = 'Worksheets';
        if (GlobalContext.game.id == packageNameDelhi) {
            $scope.tab1 = 'Literacy';
            $scope.tab2 = 'Numeracy';
        }
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
            $("#loadingDiv").show();
            $rootScope.renderMessage("", 0);
            ContentService.getContentList(GlobalContext.filter)
            .then(function(result) {
                $rootScope.$apply(function() {
                    $rootScope.stories = result;
                });
                $rootScope.loadBookshelf();
                if($rootScope.stories && $rootScope.stories.length <=0) {
                    $rootScope.renderMessage(AppMessages.NO_CONTENT_FOUND);
                } else {
                    $rootScope.renderMessage(AppMessages.SUCCESS_GET_CONTENT_LIST, 3000);
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
        }

        $rootScope.loadBookshelf = function() {
            initBookshelf();
        };

        $scope.playContent = function(content) {
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
                HTMLRenderer.start($scope.item.baseDir, 'gameCanvas', $scope.item.identifier, $scope);
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
                        console.log(err);
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
        $(".product_title").remove();
        $(".fx_shadow").remove();
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }
        // $.bookshelfSlider('#bookshelf_slider', {
        //     'item_width': newWidth,
        //     'item_height': newHeight,
        //     'products_box_margin_left': 30,
        //     'product_title_textcolor': '#ffffff',
        //     'product_title_bgcolor': '#990000',
        //     'product_margin': 30,
        //     'product_show_title': true,
        //     'show_icons': true,
        //     'buttons_margin': 15,
        //     'buttons_align': 'center', // left, center, right
        //     'slide_duration': 800,
        //     'slide_easing': 'easeOutCirc',
        //     'arrow_duration': 800,
        //     'arrow_easing': 'easeInCirc',
        //     'folder': ''
        // });
        $(".panel_slider").height($(".view-container").height() - $(".panel_title").height() - $(".panel_bar").height());
        console.log('Loading completed....');
        $("#loadingDiv").hide();
    }, 100);
}

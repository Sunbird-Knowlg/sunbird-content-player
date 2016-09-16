// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var stack = new Array(),
    collectionChildrenIds = new Array(),
    content = {},
    collectionChildren = true,
    defaultMetadata = { "identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.ecml-archive", "name": "Content Preview ", "author":"EkStep", "localData": { "questionnaire": null, "appIcon": "fixture-stories/item_sample/logo.png", "subject": "literacy_v2", "description": "Ekstep Content App", "name": "Content Preview ", "downloadUrl": "", "checksum": null, "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "concepts": [{ "identifier": "LO1", "name": "Receptive Vocabulary", "objectType": "Concept" }], "identifier": "org.ekstep.item.sample", "grayScaleAppIcon": null, "pkgVersion": 1 }, "isAvailable": true,   "path": "fixture-stories/item_sample" },
    config = {
        showStartPage : true,
        showEndPage : true,
        showHTMLPages : true
    },
    isbrowserpreview = getUrlParameter("webview"),
    appState = undefined;


window.setContentData = function (metadata, data, configuration) {
    if(metadata) {
        content.metadata = metadata;
    } else {
        content.metadata = defaultMetadata;
    }
    content.body = data;
    _.map(configuration, function(val, key) {
        config[key] = val;
    });
    var $state = appState;
    if(!config.showHTMLPages){
        config.showStartPage = false;
        config.showEndPage = false;
    }
    if(!config.showStartPage) {
        $state.go('playContent', {
                'itemId': content.metadata.identifier
        });
    }
    else if(content) {
        newContentId = content.metadata.identifier;
        if (CONTENT_MIMETYPES.indexOf(content.metadata.mimeType) > -1) {
            $state.go('showContent', {"contentId": newContentId});
        } else if ((COLLECTION_MIMETYPE == content.metadata.mimeType) ||
            (ANDROID_PKG_MIMETYPE == content.metadata.mimeType && content.metadata.code == packageName)) {
            $state.go('contentList', { "id": newContentId });
        }
    } 
}

function getContentObj(data) {
    if(_.isObject(data.body))
        return data.body;
    var tempData = data;
    var x2js = new X2JS({attributePrefix: 'none'});
    data = x2js.xml_str2json(tempData.body);
    if(!data || data.parsererror)
        data = JSON.parse(tempData.body)
    return data;
}

function launchInitialPage(appInfo, $state) {

    TelemetryService.init(GlobalContext.game, GlobalContext.user).then(function() {
        if (CONTENT_MIMETYPES.indexOf(appInfo.mimeType) > -1) {
            $state.go('showContent', {"contentId": GlobalContext.game.id});
        } else if ((COLLECTION_MIMETYPE == appInfo.mimeType) ||
            (ANDROID_PKG_MIMETYPE == appInfo.mimeType && appInfo.code == packageName)) {
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
    .run(function($rootScope, $ionicPlatform, $ionicModal, $location,  $cordovaFile, $cordovaToast, ContentService, $state, $stateParams) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            appState = $state;
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
                var id = getUrlParameter("id");  
                if(isbrowserpreview) {
                    if ("undefined" != typeof $location && id) {
                        ContentService.getContentMetadata(id)
                        .then(function(data) {
                            content["metadata"] = data;
                            newContentId = content.metadata.identifier;
                             TelemetryService.init({id: content.metadata.identifier, ver: "1.0"}, {}).then(function() { 
                                if (CONTENT_MIMETYPES.indexOf(content.metadata.mimeType) > -1) {
                                    $state.go('showContent', {"contentId": newContentId});
                                } else if ((COLLECTION_MIMETYPE == content.metadata.mimeType) ||
                                    (ANDROID_PKG_MIMETYPE == content.metadata.mimeType && content.metadata.code == packageName)) {
                                    $state.go('contentList', { "id": newContentId });
                                }
                            }).catch(function(error) {
                                console.log('TelemetryService init failed');
                                alert('TelemetryService init failed.');
                                exitApp();
                            });
                                                    
                        })
                        .catch(function(err) {
                            console.info("contentNotAvailable : ", err);
                            contentNotAvailable();
                        });
                        ContentService.getContentBody(id)
                        .then(function(data) {
                            content["body"] = data.body;
                            
                        })
                        .catch(function(err) {
                            console.info("contentNotAvailable : ", err);
                            contentNotAvailable();
                        });
                    }
                }
                else{
                    launchInitialPage(GlobalContext.config.appInfo, $state);
                }
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
                cache: false,
                url: "/show/content/:contentId",
                templateUrl: "templates/content.html",
                controller: 'ContentHomeCtrl',
                reload: true
            })
            .state('showContentEnd', {
                cache: false,
                url: "/content/end/:contentId",
                templateUrl: "templates/end.html",
                controller: 'EndPageCtrl'
            })
            .state('playContent', {
                cache: false,
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
            jQuery('#loading').hide();
            $rootScope.renderMessage("", 0);
            ContentService.getContent(id)
                .then(function(content) {
                    GlobalContext.previousContentId = content.identifier;
                    if(!_.contains(stack, content.identifier))
                        stack.push(content.identifier);
                    if (COLLECTION_MIMETYPE == content.mimeType) {
                        $rootScope.title = content.name;
                        $rootScope.collection = content;
                        TelemetryService.start(content.identifier, content.pkgVersion);
                    } else {
                        $rootScope.collection = {};
                    }
                    var childrenIds = (content.children) ? _.pluck(_.sortBy(content.children, function(child) {
                        return child.index; }), "identifier") : null;
                    if(childrenIds)
                        collectionChildrenIds = childrenIds;
                    collectionChildren = true;
                    console.info("collectionChildrenIds : ", collectionChildrenIds);
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
                    //$rootScope.showLoader = false;
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
                GlobalContext.currentContentId = content.identifier;
                GlobalContext.currentContentMimeType = content.mimeType;
                $state.go('showContent', {"contentId": content.identifier});
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
            TelemetryService.end();
            stack.pop();
            var id = stack.pop();
            if(id)
                $state.go('contentList', { "id": id});
            else
                exitApp();
        }

        $scope.resetContentListCache();

    }).controller('ContentCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
        $rootScope.pageId = "renderer";
        
        $scope.init = function(){   
            if ($stateParams.itemId) {
            $scope.item = $rootScope.content;
            if ($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
                // HTMLRenderer.start($scope.item.baseDir, 'gameCanvas', $scope.item, function() {
                //     jQuery('#loading').hide();
                //     jQuery('#gameArea').hide();
                //     var path = $scope.item.baseDir + '/index.html';
                //     /*$scope.currentProjectUrl = path;
                //     jQuery("#htmlFrame").show();*/
                //     if (window.cordova){
                //         console.log("Opening through cordova custom webview.");
                //         webview.Show(path);
                //         //cordova.InAppBrowser.open(path, '_self', 'location=no');
                //         //window.open(path, '_self');   
                //     }else{
                //         console.log("Opening through window.open");
                //         window.open(path, '_self'); 
                //         //window.location.replace(path);                    
                //     }
                // });

                //Checking is mobile or not
                var isMobile = window.cordova ? true : false;
                
                // For HTML content, lunach eve is required
                // setting launch evironment as "app"/"portal" for "mobile"/"portal(web)"
                var envHTML = isMobile ? "app" : "portal";

                var launchData = {"env": envHTML, "envpath": AppConfig[AppConfig.flavor]};
                //Adding contentId and LaunchData as query parameter
                var path = $scope.item.baseDir + '/index.html?contentId='+ $stateParams.itemId + '&launchdata=' + JSON.stringify(launchData);
                
                //Adding config as query parameter for HTML content
                if($scope.item.config){
                    path += "&config=" + JSON.stringify($scope.item.config);
                }
                
                if (isMobile){
                    console.log("Opening through cordova custom webview.");
                    cordova.InAppBrowser.open(path, '_self', 'location=no,hardwareback=no');
                }else{
                    console.log("Opening through window.open");
                    window.open(path, '_self');              
                }
            } else { 
                if(collectionChildren) {
                    collectionChildrenIds.splice(collectionChildrenIds.indexOf($stateParams.itemId), 1); 
                    collectionChildren = false;
                }
                if (isbrowserpreview) {
                    var contentBody = undefined;
                    if(COLLECTION_MIMETYPE == content.metadata.mimeType) {
                        ContentService.getContentBody($stateParams.itemId)
                            .then(function(data) {
                               
                                Renderer.start("", 'gameCanvas', $scope.item, getContentObj(data), true);
                                
                            })
                            .catch(function(err) {
                                console.info("contentNotAvailable : ", err);
                                contentNotAvailable();
                            });
                    } else {
                        Renderer.start("", 'gameCanvas', $scope.item, getContentObj(content), true);
                    }
                    
                }
                else
                    Renderer.start($scope.item.baseDir, 'gameCanvas', $scope.item);
            }
            } else {
                alert('Name or Launch URL not found.');
                $state.go('contentList', { "id": GlobalContext.game.id });
            }
        }
        

        $scope.gotToEndPage = function() {
            $state.go('showEndPage', {});
        }

        $scope.reloadStage = function() {
            reloadStage();
            TelemetryService.interact("TOUCH", "gc_reload", "TOUCH", {stageId : Renderer.theme._currentStage});
        }
       

        $scope.$on('$destroy', function() {
            // setTimeout(function() {
            //     if ($scope.item && $scope.item.mimeType && $scope.item.mimeType == 'application/vnd.ekstep.html-archive') {
            //         HTMLRenderer.cleanUp();
            //     } else {
            //         Renderer.cleanUp();
            //     }
            // }, 100);
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

        // This is to fix FTB preview issue of causing by Ionic and Angular combination
        // childnodes error causing by ionic framework whiel rendering FTB item
        // reference: http://stackoverflow.com/questions/27776174/type-error-cannot-read-property-childnodes-of-undefined
        setTimeout(function(){
            $scope.init();
        }, 0);
    });

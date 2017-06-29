// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('genie-canvas', ['ionic', 'ngCordova', 'oc.lazyLoad'])
    .constant("appConstants", {"contentId": "contentId", "stateContentList": "contentList", "stateShowContent": "showContent", "statePlayContent": "playContent", "stateShowContentEnd": "showContentEnd"})
    .run(function($rootScope, $ionicPlatform, $location, $timeout, $state, $stateParams, appConstants) {
        $rootScope.imageBasePath = "assets/icons/";
        $rootScope.enableEval = false;
        $rootScope.userSwitcherEnabled = undefined;
        $rootScope.showUser = undefined;
        $rootScope.sortingIndex = 0;
        $rootScope.users = [];
        // serverPath and localPreview is a global variable defined in index.html file inside a story
        if ("undefined" != typeof localPreview && "local" == localPreview)
            $rootScope.imageBasePath = serverPath + $rootScope.imageBasePath;
        $rootScope.languageSupport = AppLables;
        $rootScope.safeApply = function(fn) {
            if (this.$root) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            }
        };
        $rootScope.addIonicEvents = function() {
            $ionicPlatform.onHardwareBackButton(function() {
                backbuttonPressed($rootScope.pageId);
            });
            $ionicPlatform.on("pause", function() {
                Renderer.pause();
            });
            $ionicPlatform.on("resume", function() {
                Renderer.resume();
            });
        };
        $timeout(function() {
            $ionicPlatform.ready(function() {
                isMobile = window.cordova ? true : false,
                    console.log('ionic platform is ready...');
                org.ekstep.service.init();
                if ("undefined" == typeof Promise) {
                    alert("Your device isn’t compatible with this version of Genie.");
                    exitApp();
                }
                Renderer &&  $rootScope.addIonicEvents();
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                } else {
                    AppConfig.recorder = "android";
                }
                window.StatusBar && StatusBar.styleDefault();
                GlobalContext.init(packageName, version).then(function(appInfo) {
                    if ("undefined" != typeof localPreview && "local" == localPreview)
                        return;
                    if (!isbrowserpreview) {
                        localStorageGC.setItem("contentExtras", GlobalContext.game.contentExtras);
                        org.ekstep.contentrenderer.device();
                    }
                }).catch(function(res) {
                    console.log("Error Globalcontext.init:", res);
                    EkstepRendererAPI.logErrorEvent(res, {
                        'type': 'system',
                        'severity': 'fatal',
                        'action': 'play'
                    })
                    alert(res.errors);
                    exitApp();
                });
            });

        });
    }).config(function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider) {
        app.controllerProvider = $controllerProvider;
        app.compileProvider = $compileProvider;
        $stateProvider
            .state('contentList', {
                cache: false,
                url: "/content/list/:id",
                templateUrl: "templates/content-list.html",
                controller: 'ContentListCtrl'
            })
            .state('playContent', {
                cache: false,
                url: "/play/content/:itemId",
                templateUrl: "templates/renderer.html",
                controller: 'ContentCtrl'
            })
    }).controller('BaseCtrl', function($scope, $rootScope, $state, $ocLazyLoad, $stateParams, $compile, appConstants) {
        $rootScope.replayContent = function() {
            $scope.endContent('gc_replay');
            $scope.startContent();
        }
        $scope.endContent = function(eleId) {
            if (!$rootScope.content) {
                org.ekstep.contentrenderer.getContentMetadata($stateParams.itemId);
            }
            $rootScope.pageTitle = $rootScope.content.name;
            org.ekstep.contentrenderer.progressbar(true);
            if (!_.isUndefined(Renderer) && Renderer.theme) {
                TelemetryService.interact("TOUCH", eleId, "TOUCH", {
                    stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
                });
            }
            if (eleId === 'gc_userswitch_replayContent') {
                TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
            }
            var menuReplay = $state.current.name == appConstants.statePlayContent;
            org.ekstep.contentrenderer.progressbar(false);
            // 1) For HTML content onclick of replay EventListeners will be not available hence calling Telemetryservice end .
            // 2) OE_START for the HTML/ECML content will be takne care by the contentctrl rendere method always.
            EventBus.hasEventListener('actionReplay') ? EventBus.dispatch('actionReplay', {
                'menuReplay': menuReplay
            }) : TelemetryService.end();
        }
        $scope.startContent = function() {
            if ($state.current.name == appConstants.stateShowContentEnd) {
                $state.go(appConstants.statePlayContent, {
                    'itemId': $rootScope.content.identifier
                });
            }
        }
        $rootScope.us_replayContent = function() {
            $scope.endContent('gc_userswitch_replayContent');
            var stageId =
                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);

            EventBus.dispatch('event:closeUserSwitchingModal')
            EkstepRendererAPI.hideEndPage();
            $scope.startContent();
        }
        $rootScope.us_continueContent = function(userSwitchHappened) {
            TelemetryService.interact("TOUCH", 'gc_userswitch_continue', "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            });
            if (userSwitchHappened) {
                var version = TelemetryService.getGameVer();;
                var gameId = TelemetryService.getGameId();
                TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);

                TelemetryService.end();
                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                var data = {};
                data.mode = getPreviewMode();
                TelemetryService.start(gameId, version, data);
            }
        }

        /*function injectTemplates(templatePath, place) {
            $scope.safeApply(function() {
                $scope.templates = templatePath + "?a=" + Date.now();
            });*/

        $scope.templates = { };
        function loadNgModules(templatePath, controllerPath, callback) {
            $ocLazyLoad.load([
                { type: 'html', path: templatePath },
                { type: 'js', path: controllerPath }
            ]).then(function(){
                // injectTemplates(templatePath);
                if(callback) callback(injectTemplates);
            });
        };

        function injectTemplates(templatePath, scopeVariable, toElement) {
            console.log("inject templates", templatePath);

            //$scope.templates = templatePath +"?a=" +  Date.now();
            // if(toElement) {
                // $scope.overlayTemplatePath = templatePath;
                $scope.templates[scopeVariable] = templatePath;
                var el = angular.element(toElement);
                $compile(el.contents())($scope);
                $scope.safeApply();

            // }
        }
        EkstepRendererAPI.addEventListener("renderer:add:template", function(event){
            var data = event.target;
            injectTemplates(data.templatePath, data.scopeVariable, data.toElement);
        });


        org.ekstep.service.controller.initService(loadNgModules);
        // org.ekstep.service.controller.injectTemplate(injectTemplates, null);
        EkstepRendererAPI.addEventListener("event:loadContent", function() {
            var configuration = EkstepRendererAPI.getPreviewData();
            content.metadata = (_.isUndefined(configuration.metadata) || _.isNull(configuration.metadata)) ? AppConfig.DEFAULT_METADATA : configuration.metadata
            if (_.isUndefined(configuration.data)) {
                org.ekstep.contentrenderer.web(configuration.context.contentId);
            } else {
                content.body = configuration.data;
                console.info("Content id is undefined or body is available !!");
                var $state = angular.element(document.body).injector().get('$state')
                updateContentData($state, content.metadata.identifier)
            }
        }, this);
    }).controller('ContentListCtrl', function($scope, $rootScope, $state, $stateParams) {
        /* contentListCtrl for the localDevelopment*/
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
            org.ekstep.contentrenderer.progressbar(false)
            var collectionContentId = $stateParams.id;
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
                $state.go('playContent', {
                    'itemId': content.identifier
                });
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
            $rootScope.title = GlobalContext.config.appInfo ? GlobalContext.config.appInfo.name : "";
            $scope.resetContentListCache();
        };
        $scope.init();
    }).controller('ContentCtrl', function($scope, $rootScope, $state, $stateParams) {
        $rootScope.pageId = "ContentApp-Renderer";
        $scope.init = function() {
            if (_.isUndefined($rootScope.content)) {
                if (!_.isUndefined(content.metadata)) {
                    $rootScope.content = content.metadata;
                    $scope.renderContent();
                }else{
                    console.info('contentMetada is undefined');
                }

            } else {
                $scope.renderContent();
            }
        }
        $scope.callStartTelemetry = function(content, cb) {
            var identifier = (content && content.identifier) ? content.identifier : null;
            var pkgVersion = !_.isUndefined(content.pkgVersion) ? content.pkgVersion.toString() : null;
            var version = (content && pkgVersion) ? pkgVersion : "1";
            startTelemetry(identifier, version, cb);
        }
        $scope.renderContent = function() {
            //EkstepRendererAPI.dispatchEvent('renderer:launcher:initLauncher');
            if ($stateParams.itemId && $rootScope.content) {
                localStorageGC.setItem("content", $rootScope.content);
                $rootScope.pageTitle = $rootScope.content.name;
                org.ekstep.contentrenderer.progressbar(true);
                GlobalContext.currentContentId = _.isUndefined(GlobalContext.currentContentId) ? $rootScope.content.identifier : GlobalContext.currentContentId;
                $scope.callStartTelemetry($rootScope.content, function() {
                    $scope.item = $rootScope.content;
                    $scope.callStartTelemetry($rootScope.content, function() {
                        $rootScope.content.body = isbrowserpreview ? content.body : undefined;
                        EkstepRendererAPI.dispatchEvent('renderer:launcher:initLauncher', undefined, $rootScope.content);
                    });
                });
            } else {
                alert('Name or Launch URL not found.');
                exitApp();
            }

        }
        $scope.reloadStage = function() {
            reloadStage();
        }

        $scope.$on('$destroy', function() {})
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
        setTimeout(function() {
            $scope.init();
        }, 0);
    });

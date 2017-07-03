// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('genie-canvas', ['ionic', 'ngCordova', 'oc.lazyLoad'])
    .constant("appConstants", {"contentId": "contentId", "stateContentList": "contentList", "stateShowContent": "showContent", "statePlayContent": "playContent", "stateShowContentEnd": "showContentEnd"})
    .run(function($rootScope, $ionicPlatform, $location, $timeout, $state, $stateParams, appConstants) {
        $rootScope.enableEval = false;
        $rootScope.userSwitcherEnabled = undefined;
        $rootScope.showUser = undefined;
        $rootScope.sortingIndex = 0;
        $rootScope.users = [];
        // serverPath and localPreview is a global variable defined in index.html file inside a story
        if ("undefined" != typeof localPreview && "local" == localPreview)
            AppConfig.assetbase = serverPath + AppConfig.assetbase;
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
            // To override back button behaviour
            $ionicPlatform.registerBackButtonAction(function() {
                //TODO: Add Telemetry interact for on and Cancle
                if (confirm("Press 'OK' to go back to Genie.")) {
                    backbuttonPressed(EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                }
            }, 100);
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

    }).controller('BaseCtrl', function($scope, $rootScope, $state, $ocLazyLoad, $stateParams, $compile, appConstants) {
        $rootScope.replayContent = function() {
            $scope.endContent('gc_replay');
            EkstepRendererAPI.dispatchEvent('renderer:content:replay');
        }
        $scope.endContent = function(eleId) {
            if (!$rootScope.content) {
                org.ekstep.contentrenderer.getContentMetadata($stateParams.itemId);
            }
            $rootScope.pageTitle = $rootScope.content.name;
            if (!_.isUndefined(Renderer) && Renderer.theme) {
                TelemetryService.interact("TOUCH", eleId, "TOUCH", {
                    stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
                });
            }
            if (eleId === 'gc_userswitch_replayContent') {
                TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
            }
            var menuReplay = $state.current.name == appConstants.statePlayContent;
            // 1) For HTML content onclick of replay EventListeners will be not available hence calling Telemetryservice end .
            // 2) OE_START for the HTML/ECML content will be takne care by the contentctrl rendere method always.
            EventBus.hasEventListener('actionReplay') ? EventBus.dispatch('actionReplay', {
                'menuReplay': menuReplay
            }) : TelemetryService.end();
        }
        
        $rootScope.us_replayContent = function() {
            $scope.endContent('gc_userswitch_replayContent');
            EkstepRendererAPI.dispatchEvent('renderer:content:replay');
            var stageId =
                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);

            EventBus.dispatch('event:closeUserSwitchingModal')
            EkstepRendererAPI.hideEndPage();
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
        $scope.templates = [];
        function loadNgModules(templatePath, controllerPath, callback) {
            var loadFiles = [];
            if(templatePath){
                if(_.isArray(templatePath)){
                    _.each(templatePath, function(template){
                        console.log("template", template);
                        loadFiles.push({ type: 'html', path: template });
                    });
                } else {
                    loadFiles.push({ type: 'html', path: templatePath });
                }
            }
            if(controllerPath){
                loadFiles.push({ type: 'js', path: controllerPath });
            }
            $ocLazyLoad.load(loadFiles).then(function(){
                if(!_.isArray(templatePath)){
                    injectTemplates(templatePath);
                }
            });
        };

        function injectTemplates(templatePath, scopeVariable, toElement) {
            console.log("inject templates", templatePath);
                $scope.templates.push(templatePath);
                var el = angular.element("content-holder");
                $compile(el.contents())($scope);
                $scope.safeApply();
        }
        EkstepRendererAPI.addEventListener("renderer:add:template", function(event){
            var data = event.target;
            injectTemplates(data.templatePath, data.scopeVariable, data.toElement);
        });


        org.ekstep.service.controller.initService(loadNgModules);
        EkstepRendererAPI.addEventListener("event:loadContent", function() {
            var configuration = EkstepRendererAPI.getPreviewData();
            content.metadata = (_.isUndefined(configuration.metadata) || _.isNull(configuration.metadata)) ? AppConfig.DEFAULT_METADATA : configuration.metadata
            if (_.isUndefined(configuration.data)) {
                org.ekstep.contentrenderer.web(configuration.context.contentId);
            } else {
                content.body = configuration.data;
                org.ekstep.contentrenderer.startGame(content.metadata)
            }
        }, this);
    });

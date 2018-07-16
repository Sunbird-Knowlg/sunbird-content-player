// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('genie-canvas', ['ionic', 'ngCordova', 'oc.lazyLoad'])
    .constant("appConstants", {"contentId": "contentId", "stateContentList": "contentList", "stateShowContent": "showContent", "statePlayContent": "playContent", "stateShowContentEnd": "showContentEnd"})
    .run(function($rootScope, $ionicPlatform, $location, $timeout, $state, $stateParams, appConstants) {
        $rootScope.enableEval = false;
        $rootScope.enableUserSwitcher = undefined;
        $rootScope.showUser = undefined;
        $rootScope.sortingIndex = 0;
        $rootScope.users = [];
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        // serverPath and localPreview is a global variable defined in index.html file inside a story
        if ("undefined" != typeof localPreview && "local" == localPreview)
            globalConfig.assetbase = serverPath + globalConfig.assetbase;
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
                if (EkstepRendererAPI.hasEventListener(EkstepRendererEvents['renderer:device:back'])) {
                    EkstepRendererAPI.dispatchEvent(EkstepRendererEvents['renderer:device:back']);
                } else {
                    var type = (Renderer && !Renderer.running) ? 'EXIT_APP' : 'EXIT_CONTENT';
                    var stageId = getCurrentStageId();
                    TelemetryService.interact('TOUCH', 'DEVICE_BACK_BTN', 'EXIT', {type:type,stageId:stageId});
                    contentExitCall();
                }
            }, 100);
            $ionicPlatform.on("pause", function() {
                Renderer && Renderer.pause();
                TelemetryService.interrupt("BACKGROUND", getCurrentStageId);
            });
            $ionicPlatform.on("resume", function() {
                Renderer && Renderer.resume();
                TelemetryService.interrupt("RESUME", getCurrentStageId);
            });
        };
        $timeout(function() {
            $ionicPlatform.ready(function() {
                splashScreen.addEvents();
                isMobile = window.cordova ? true : false,
                org.ekstep.service.init();
                if ("undefined" == typeof Promise) {
                    alert("Your device isn’t compatible with this version of Genie.");
                    exitApp();
                }
                $rootScope.addIonicEvents();
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    StatusBar.hide();
                    window.navigationbar.setUp(true); 
                    navigationbar.hideNavigationBar();
                } else {
                    globalConfig.recorder = "android";
                }
                window.StatusBar && StatusBar.styleDefault();
                GlobalContext.init(packageName, version).then(function(appInfo) {
                    if ("undefined" != typeof localPreview && "local" == localPreview)
                        return;
                    if (!isbrowserpreview) {
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

        $scope.templates = [];
        function loadNgModules(templatePath, controllerPath, callback) {
            var loadFiles = [];
            if(templatePath){
                if(_.isArray(templatePath)){
                    _.each(templatePath, function(template){
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
            $scope.templates.push(templatePath);
            var el = angular.element("content-holder");
            $compile(el.contents())($scope);
            $scope.safeApply();
        }
        EkstepRendererAPI.addEventListener("renderer:add:template", function(event){
            var data = event.target;
            injectTemplates(data.templatePath, data.scopeVariable, data.toElement);
        }, this);


        EkstepRendererAPI.addEventListener("renderer:content:close", function(event, data) {
            if (data && data.interactId) {
                var eventName = 'OE_INTERACT';
                if (TelemetryService.instance) var isTelemetryStartActive = TelemetryService.instance.telemetryStartActive();
                if (!isTelemetryStartActive) {
                    eventName = 'GE_INTERACT'
                }
              TelemetryService.interact("TOUCH", data.interactId, "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
              }, eventName);
            }
            EkstepRendererAPI.dispatchEvent('renderer:telemetry:end');
            if (data && data.callback) data.callback();
        });

        org.ekstep.service.controller.initService(loadNgModules);
        EkstepRendererAPI.addEventListener("renderer.content.getMetadata", function() {
            var configuration = EkstepRendererAPI.getGlobalConfig();
            content.metadata = (_.isUndefined(configuration.metadata) || _.isNull(configuration.metadata)) ? globalConfig.defaultMetadata : configuration.metadata
            if (_.isUndefined(configuration.data)) {
                org.ekstep.contentrenderer.web(configuration.context.contentId);
            } else {
                content.body = configuration.data;
                org.ekstep.contentrenderer.startGame(content.metadata)
            }
        }, this);
    });

window.app = app;    

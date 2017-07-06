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

        EkstepRendererAPI.addEventListener("renderer:content:end", function(event, data){
            TelemetryService.interact("TOUCH", data.interactId, "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            });
            TelemetryService.end();
            data.callback();
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

// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module("genie-canvas", ["ionic", "ngCordova", "oc.lazyLoad"])
	.constant("appConstants", { "contentId": "contentId", "stateContentList": "contentList", "stateShowContent": "showContent", "statePlayContent": "playContent", "stateShowContentEnd": "showContentEnd" })
	.run(function ($rootScope, $ionicPlatform, $timeout) {
		$rootScope.enableEval = false
		$rootScope.enableUserSwitcher = undefined
		$rootScope.showUser = undefined
		$rootScope.sortingIndex = 0
		$rootScope.users = []
		var globalConfig = EkstepRendererAPI.getGlobalConfig()
		// serverPath and localPreview is a global variable defined in index.html file inside a story
		if (typeof localPreview !== "undefined" && localPreview === "local") { globalConfig.assetbase = serverPath + globalConfig.assetbase }
		$rootScope.safeApply = function (fn) {
			if (this.$root) {
				var phase = this.$root.$$phase
				if (phase === "$apply" || phase === "$digest") {
					if (fn && (typeof (fn) === "function")) {
						fn()
					}
				} else {
					this.$apply(fn)
				}
			}
		}

		splashScreen.addEvents()
		org.ekstep.service.init()
		if (typeof org.ekstep.contentrenderer.local === "function") {
			org.ekstep.contentrenderer.local()
			return
		}
		if (isMobile) {
			mobileView.init($ionicPlatform, $timeout)
		}
	}).config(function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $sceDelegateProvider) {
		if (window.ionic && window.ionic.Platform.isIOS()) {
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|ionic):|data:image/)
		}
		app.controllerProvider = $controllerProvider
		app.compileProvider = $compileProvider
		EkstepRendererAPI.addEventListener("renderer.content.mergeWhiteListUrl", function () {
			$sceDelegateProvider.resourceUrlWhitelist(window.globalConfig.whiteListUrl)
			angular.module("org.ekstep.question", []).config(function ($sceDelegateProvider) {
				$sceDelegateProvider.resourceUrlWhitelist(window.globalConfig.whiteListUrl)
				console.log("AppConfig", window.globalConfig.whiteListUrl)
			})
		}, this)
	}).controller("BaseCtrl", function ($scope, $rootScope, $state, $ocLazyLoad, $stateParams, $compile, $templateCache, appConstants) {
		$scope.templates = []

		function loadNgModules (templatePath, controllerPath, allowTemplateCache) {
			var loadFiles = []
			if (!allowTemplateCache) {
				if (templatePath) {
					if (_.isArray(templatePath)) {
						_.each(templatePath, function (template) {
							loadFiles.push({ type: "html", path: template })
						})
					} else {
						loadFiles.push({ type: "html", path: templatePath })
					}
				}
				if (controllerPath) {
					loadFiles.push({ type: "js", path: controllerPath })
				}
				$ocLazyLoad.load(loadFiles).then(function () {
					if (!_.isArray(templatePath)) {
						injectTemplates(templatePath)
					}
				})
			} else {
				if (angular.isString(templatePath) && templatePath.length > 0) {
					angular.forEach(angular.element(templatePath), function (node) {
						console.log("NodeId", node.id)
						$templateCache.put(node.id, node.innerHTML)
						$scope.templates.push({ id: node.id })
						var el = angular.element("content-holder")
						$compile(el.contents())($scope)
						$scope.safeApply()
					})
				}
			}
		};

		function injectTemplates (templatePath, scopeVariable, toElement) {
			if (!templatePath) { return }
			$scope.templates.push({
				path: templatePath
			})
			var el = angular.element("content-holder")
			$compile(el.contents())($scope)
			$scope.safeApply()
		}
		EkstepRendererAPI.addEventListener("renderer:add:template", function (event) {
			var data = event.target
			injectTemplates(data.templatePath, data.scopeVariable, data.toElement)
		}, this)

		EkstepRendererAPI.addEventListener("renderer:content:close", function (event, data) {
			if (data && data.interactId) {
				var eventName = "OE_INTERACT"
				if (TelemetryService.instance) var isTelemetryStartActive = TelemetryService.instance.telemetryStartActive()
				if (!isTelemetryStartActive) {
					eventName = "GE_INTERACT"
				}
				TelemetryService.interact("TOUCH", data.interactId, "TOUCH", {
					stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
				}, eventName)
			}
			EkstepRendererAPI.dispatchEvent("renderer:telemetry:end")
			if (data && data.callback) data.callback()
		})

		org.ekstep.service.controller.initService(loadNgModules)
		EkstepRendererAPI.addEventListener("renderer.content.getMetadata", function () {
			var configuration = EkstepRendererAPI.getGlobalConfig()
			content.metadata = (_.isUndefined(configuration.metadata) || _.isNull(configuration.metadata)) ? globalConfig.defaultMetadata : configuration.metadata

			if (_.isUndefined(configuration.data)) {
				org.ekstep.contentrenderer.web(configuration.context.contentId)
			} else {
				content.body = configuration.data
				org.ekstep.contentrenderer.startGame(content.metadata)
			}
		}, this)
	})

window.app = app

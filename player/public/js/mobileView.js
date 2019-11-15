var mobileView = {
	init: function($ionicPlatform, $timeout){
		console.log("======Mobile View======");
		var globalconfig = EkstepRendererAPI.getGlobalConfig();
		var instance = this;

		$timeout(function () {
			$ionicPlatform.ready(function () {
				splashScreen.addEvents()
				org.ekstep.service.init()
				if (typeof Promise === "undefined") {
					alert("Your device isn’t compatible with this version of Genie.")
					exitApp()
				}
				instance.addIonicEvents($ionicPlatform);
				if (window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
					StatusBar.hide()
					MobileAccessibility.usePreferredTextZoom(false)
					window.navigationbar.setUp(true)
					navigationbar.hideNavigationBar()
				} else {
					globalConfig.recorder = "android"
				}
				window.StatusBar && StatusBar.styleDefault()
				GlobalContext.init(packageName, version).then(function (appInfo) {
					if (globalconfig.metadata) {
						org.ekstep.contentrenderer.setContentMetadata(globalconfig.metadata, function () {
							org.ekstep.contentrenderer.startGame(content.metadata)
						})
					} else {
						org.ekstep.contentrenderer.getContentMetadata(globalconfig.contentId, function () {
							org.ekstep.contentrenderer.startGame(content.metadata)
						})
					}
				}).catch(function (res) {
					console.log("Error Globalcontext.init:", res)
					EkstepRendererAPI.logErrorEvent(res, {
						"type": "system",
						"severity": "fatal",
						"action": "play"
					})
					alert(res.errors)
					exitApp()
				})
			})
		})
	},
	addIonicEvents: function($ionicPlatform){
		// To override back button behaviour
		$ionicPlatform.registerBackButtonAction(function () {
			if (EkstepRendererAPI.hasEventListener(EkstepRendererEvents["renderer:device:back"])) {
				EkstepRendererAPI.dispatchEvent(EkstepRendererEvents["renderer:device:back"])
			} else {
				var type = (Renderer && !Renderer.running) ? "EXIT_APP" : "EXIT_CONTENT"
				var stageId = getCurrentStageId()
				TelemetryService.interact("TOUCH", "DEVICE_BACK_BTN", "EXIT", { type: type, stageId: stageId })
				contentExitCall()
			}
		}, 100)
		$ionicPlatform.on("pause", function () {
			Renderer && Renderer.pause()
			TelemetryService.interrupt("BACKGROUND", getCurrentStageId)
		})
		$ionicPlatform.on("resume", function () {
			Renderer && Renderer.resume()
			TelemetryService.interrupt("RESUME", getCurrentStageId)
		})
	}
}

window.mobileView = mobileView;
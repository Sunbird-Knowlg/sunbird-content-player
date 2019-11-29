var mobileView = {
		init: function($ionicPlatform, $timeout){
			console.log("======Mobile View======");
			var globalconfig = EkstepRendererAPI.getGlobalConfig();
			var instance = this;

			$timeout(function () {
				$ionicPlatform.ready(function () {
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
				})
			})
		},
		addIonicEvents: function(ionicPlatform){
			// To override back button behaviour
			ionicPlatform.registerBackButtonAction(function () {
				if (EkstepRendererAPI.hasEventListener(EkstepRendererEvents["renderer:device:back"])) {
					EkstepRendererAPI.dispatchEvent(EkstepRendererEvents["renderer:device:back"])
				} else {
					var type = (Renderer && !Renderer.running) ? "EXIT_APP" : "EXIT_CONTENT"
					var stageId = getCurrentStageId()
					TelemetryService.interact("TOUCH", "DEVICE_BACK_BTN", "EXIT", { type: type, stageId: stageId })
					contentExitCall()
				}
			}, 100)
			ionicPlatform.on("pause", function () {
				Renderer && Renderer.pause()
				TelemetryService.interrupt("BACKGROUND", getCurrentStageId)
			})
			ionicPlatform.on("resume", function () {
				Renderer && Renderer.resume()
				TelemetryService.interrupt("RESUME", getCurrentStageId)
			})
		}	
};
window.mobileView  = mobileView;
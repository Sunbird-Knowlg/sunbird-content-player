/**
 * User switcher controller
 * @author Gourav More <gourav_m@tekditechnologies.com>
 */

app.compileProvider.directive("alert", ["$rootScope", "$compile", function ($rootScope, $compile) {
	return {
		restrict: "E",
		template: "<div ng-include='getAlertPluginTemplate()' ></div>",
		link: function (scope, element, attrs, controller) {
			var upIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.alert", "1.0", "assets/up.png")
			var downIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.alert", "1.0", "assets/down.png")
			scope.title = ""
			scope.text = ""
			scope.type = null
			scope.showCancelButton = true
			scope.detailBtnText = "Details"
			scope.okBtnText = "Exit"
			scope.copyAnswer = "Copy"
			scope.callback = function (){}
			scope.showDetailsPopUp = false
			scope.rendererVersion = EkstepRendererAPI.getGlobalConfig().canvasVersion
			scope.detailsIcon = downIcon
			scope.init = function () {
				/**
                 * renderer:alert:show event to show the alerts.
                 * @event renderer:alert:show
                 * @listens renderer:alert:show
                 * @memberof EkstepRendererEvents
                 */
				EkstepRendererAPI.addEventListener("renderer:alert:show", scope.showAlert)

				/**
                 * renderer:alert:hide event to hide alert popup.
                 * @event renderer:alert:hide
                 * @listens renderer:alert:hide
                 * @memberof EkstepRendererEvents
                 */

				EkstepRendererAPI.addEventListener("renderer:alert:hide", scope.hidePopup)
			}
			scope.showAlert = function (event, data) {
				scope.text = data.text
				scope.details = data.data
				scope.showPopup = true
				scope.okBtnText = data.okBtnText ? data.okBtnText : scope.okBtnText;
				scope.callback = data.callback ? data.callback : scope.callback;
				scope.safeApply()
			}
			scope.hidePopup = function () {
				scope.callback();
				scope.showPopup = false
				if (typeof cordova !== "undefined") exitApp()
				scope.safeApply()
			}
			scope.showDetails = function () {
				if (scope.showDetailsPopUp) {
					scope.showDetailsPopUp = false
					scope.copyAnswer = "Copy"
					scope.detailsIcon = downIcon
				} else {
					scope.showDetailsPopUp = true
					scope.detailsIcon = upIcon
				}
				scope.safeApply()
			}
			scope.hideDetails = function () {
				scope.showDetailsPopUp = false
				scope.safeApply()
			}
			/**
                 *   function to copy content preview link
                 *   @memberof collaborator
                 */
			scope.getUrlLink = function () {
				$("#copyTarget").select()

				try {
					var successful = document.execCommand("copy")
					successful ? scope.copyAnswer = "Copied" : scope.copyAnswer = "Unable to copy!"
				} catch (err) {
					scope.copyAnswer = "Unsupported Browser!"
				}
			}
			scope.getAlertPluginTemplate = function () {
				var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.alert");
				return alertPluginInstance._templatePath;
			}
		}
	}
}])

// # sourceMappingURL=alert.js.ctrl

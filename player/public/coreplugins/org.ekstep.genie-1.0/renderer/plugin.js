/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
Plugin.extend({
    initialize: function() {
        app.compileProvider.directive("genie", ["$rootScope", function($rootScope) {
            return {
                restrict: "E",
                template: '<div ng-class="enableGenie ? \'genie-home\' : \'icon-opacity genie-home\'" role="button" aria-label="{{AppLables.exit}}" tabindex="0" aria-disabled="true" ng-keydown="$event.keyCode === 13 && showInstructions()" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}icn_home.png"/><span> {{AppLables.exit}} </span></div>',
                link: function(scope) {
                    scope.AppLables = AppLables
                    scope.enableGenie = typeof cordova !== "undefined"
                    if (scope.enableGenie) {
                        scope.goToGenie = function() {
                            EkstepRendererAPI.dispatchEvent("renderer:telemetry:end");
                            var stageId = !_.isUndefined(Renderer) ? Renderer.theme._currentStage : " "
                            TelemetryService.interact("TOUCH", "gc_genie", "TOUCH", { stageId: stageId })
                            exitApp()
                        }
                    }
                }
            }
        }])
    }
})
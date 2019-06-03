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
                template: '<div ng-class="enableGenie ? \'genie-home\' : \'icon-opacity genie-home\'" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}icn_home.png"/><span> {{AppLables.exit}} </span></div>',
                link: function(scope) {
                    scope.AppLables = AppLables
                    scope.enableGenie = (!isbrowserpreview && !_.isUndefined(isbrowserpreview))
                    if (scope.enableGenie) {
                        scope.goToGenie = function() {
                            EkstepRendererAPI.hideEndPage()
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
/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
Plugin.extend({
    initialize: function() {
        var icon = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/assets/icn_home.png");
        app.compileProvider.directive('genie', ['$rootScope', function($rootScope) {
            return {
                restrict: 'E',
                template: '<div ng-class="enableGenie ? \'genie-home\' : \'icon-opacity genie-home\'" ng-click="goToGenie()"><img ng-src="{{imgSrc}}"/><span> {{AppLables.home}} </span></div>',
                link: function(scope) {
                    scope.AppLables = AppLables;
                    scope.enableGenie = ("undefined" == typeof cordova) ? false : true;
                    scope.imgSrc = icon;
                    if (scope.enableGenie) {
                        scope.goToGenie = function() {
                            EkstepRendererAPI.hideEndPage();
                            stageId = !_.isUndefined(Renderer) ? Renderer.theme._currentStage : " ";
                            TelemetryService.interact("TOUCH", "gc_genie", "TOUCH", { stageId: stageId });
                            exitApp();
                        }
                    }
                }
            }
        }]);
    }
})
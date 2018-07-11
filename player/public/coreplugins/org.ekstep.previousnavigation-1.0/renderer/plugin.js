/**
 * Plugin to create create previous navigation directive and handle show and hide of previous nav button
 * @extends EkstepRenderer.Plugin
 * @author Akash Gupta <akash.gupta@tarento.com>
 */
Plugin.extend({
    _type: "navigation",
    initialize: function() {
        console.info('Previous navigation intialize');
        var previousIcon = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/assets/previous.png");
        app.compileProvider.directive('previousNavigation', ['$rootScope', function($rootScope) {
            return {
                restrict: 'E',
                template: '<div><a class="nav-icon nav-previous" ng-show="showOverlayPrevious !== state_off" ng-class="{\'nav-disable\': showOverlayPrevious == state_disable}" href="javascript:void(0);"><img ng-src="{{previousIcon}}" ng-click="navigate(\'previous\')"></a></div>',
                link: function(scope) {
                    var events = ["renderer:previous:show", "renderer:previous:hide", "overlayPrevious"];
                    scope.previousIcon = previousIcon;
                    scope.changeValue = function(event) {
                        var val;
                        var globalConfig = EkstepRendererAPI.getGlobalConfig();
                        var defaultValue = globalConfig.overlay.showPrevious ? "on" : "off";
                        switch (event.type) {
                            case "overlayPrevious":
                                val = event.target ? event.target : defaultValue;
                                break;
                                /**
                                 * renderer:previous:show Event to show previous navigation icon.
                                 * @event renderer:previous:show
                                 * @listen renderer:previous:show
                                 * @memberOf EkstepRendererEvents
                                 */
                            case "renderer:previous:show":
                                val = "on";
                                break;
                                /**
                                 * renderer:previous:hide Event to hide previous navigation icon.
                                 * @event renderer:previous:hide
                                 * @listen renderer:previous:hide
                                 * @memberOf EkstepRendererEvents
                                 */
                            case "renderer:previous:hide":
                                val = "off";
                                break;
                        }
                        if (val == "on") {
                            var navigateToStage = EkstepRendererAPI.getStageParam('previous');
                            if (_.isUndefined(navigateToStage)) {
                                val = "disable";
                                if (EkstepRendererAPI.isItemScene() && EkstepRendererAPI.getCurrentController().hasPrevious()) {
                                    val = "enable"
                                }
                            } else {
                                val = "enable"
                            }
                        }
                        scope.showOverlayPrevious = val;
                        $rootScope.safeApply();
                    }
                    _.each(events, function(event) {
                        EkstepRendererAPI.addEventListener(event, scope.changeValue, scope)
                    })
                }
            }
        }]);
    }
})

//# sourceURL=previousnavigationplugin.js
/**
 * Plugin to create create next navigation directive and handle show and hide of next nav button
 * @extends EkstepRenderer.Plugin
 * @author Akash Gupta <akash.gupta@tarento.com>
 */
Plugin.extend({
    _type: "nextNavigation",
    initialize: function() {
        console.info('Next navigation intialize');
        var nextIcon = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/assets/next.png");
        app.compileProvider.directive('nextNavigation', function($rootScope) {
            return {
                restrict: 'E',
                template: '<div><a class="nav-icon nav-next" ng-show="showOverlayNext !== state_off" href="javascript:void(0);"><img ng-src="{{nextIcon}}" ng-click="navigate(\'next\')"></a></div>',
                link: function(scope) {
                    scope.nextIcon = nextIcon;
                    var events = ["overlayNext", "renderer:next:show", "renderer:next:hide"];
                    scope.toggleNav = function(event) {
                        var val;
                        var globalConfig = EkstepRendererAPI.getGlobalConfig();
                        var defaultValue = globalConfig.overlay.showNext ? "on" : "off";
                        switch (event.type) {
                            case "renderer:next:show":
                                val = "on";
                                break;
                            case "renderer:next:hide":
                                val = "off";
                                break;
                            case "overlayNext":
                                val = event.target ? event.target : defaultValue;
                        }
                        scope.showOverlayNext = val;
                        $rootScope.safeApply();
                    };
                    _.each(events, function(event) {
                        EkstepRendererAPI.addEventListener(event, scope.toggleNav, scope)
                    });
                }
            }
        });
    }
})

//# sourceURL=nextnavigationplugin.js
/**
 * Plugin to create create next navigation directive and handle show and hide of next nav button
 * @extends EkstepRenderer.Plugin
 * @author Akash Gupta <akash.gupta@tarento.com>
 */
Plugin.extend({
	_type: "nextNavigation",
	initialize: function () {
		console.info('Next navigation intialize');
		this.templateName_top = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/top.html");
		this.templateName_default = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/default.html");
		app.compileProvider.directive("nextNavigation", ["$rootScope", function ($rootScope) {
			return {
				restrict: "E",
				// template: '<button class="sb-btn sb-btn-primary sb-btn-xs sb-btn-arrows next" id="naviage_top_next" ng-click="navigate(\'next\')"><i class="chevron right icon"></i></button>',
				template: '<ng-include ng-show="showOverlayNext !== state_off" src="getNextTemplateUrl()" ng-click="navigate(\'next\')"/>',
				link: function (scope) {
					var events = ["overlayNext", "renderer:next:show", "renderer:next:hide"]
					scope.toggleNav = function (event) {
						var val
						var globalConfig = EkstepRendererAPI.getGlobalConfig()
						var defaultValue = globalConfig.overlay.showNext ? "on" : "off"
						switch (event.type) {
						/**
                             * renderer:next:show Event to show next navigation icon.
                             * @event renderer:next:show
                             * @listen renderer:next:show
                             * @memberOf EkstepRendererEvents
                             */
						case "renderer:next:show":
							val = "on"
							break
							/**
                                 * renderer:next:hide Event to hide next navigation icon.
                                 * @event renderer:next:hide
                                 * @listen renderer:next:hide
                                 * @memberOf EkstepRendererEvents
                                 */
						case "renderer:next:hide":
							val = "off"
							break
						case "overlayNext":
							val = event.target ? event.target : defaultValue
						}
						scope.showOverlayNext = val
						scope.getNextTemplateUrl = function() {
							var pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.nextnavigation")
							if($rootScope.enableDefaultNav){
								return pluginInstance.templateName_default
							}else{								
								return pluginInstance.templateName_top;
							}												
						}
						$rootScope.safeApply()
					}
					_.each(events, function (event) {
						EkstepRendererAPI.addEventListener(event, scope.toggleNav, scope)
					})
				}
			}
		}])
	}
})

// # sourceURL=nextnavigationplugin.js

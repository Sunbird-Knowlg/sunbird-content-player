/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Akash Gupta <akash.gupta@tarento.com>
 */
Plugin.extend({
    _templatePath: undefined,
    _type: "userswitcher",
    initialize: function() {
        console.info('user switch plugin is doing initialize....');
        var instance = this;
        this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/user-switch-popup.html");
        this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/userSwitcher.js");
        org.ekstep.service.controller.loadNgModules(undefined, this.controllerPath);
        app.compileProvider.directive('userSwitcher', function($rootScope, $compile) {
            return {
                restrict: 'E',
                controller: 'UserSwitchController',
                link: function(scope, element, attrs, controller) {
                    // get the user selection div
                    var userSlider = element.find("#userSlider");
                    var groupSlider = element.find("#groupSlider");
                    scope.render = function() {
                        userSlider.mCustomScrollbar({
                            axis: "x",
                            theme: "dark-3",
                            advanced: {
                                autoExpandHorizontalScroll: true
                            }
                        });
                        groupSlider.mCustomScrollbar({
                            axis: "x",
                            theme: "dark-3",
                            advanced: {
                                autoExpandHorizontalScroll: true
                            }
                        });
                    }
                    scope.init = function() {
                        if (globalConfig.overlay.showUser === true) {
                            userSlider.mCustomScrollbar('destroy');
                            groupSlider.mCustomScrollbar('destroy');
                            scope.initializeCtrl();
                            scope.render();
                        }
                    }();
                },
                template: "<div ng-include=getUserSwitcherTemplate()></div>"
            }
        });
    }
});

//# sourceURL=userSwitcher.js
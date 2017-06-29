/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */
Plugin.extend({
    _templatePath: undefined,
    userSwitcherTemplatePath: undefined,
    menuTemplatePath: undefined,
    _type: "overlay",
    _ngScopeVar: "overlay",
    initialize: function() {
        console.info('overlay plugin is doing initialize....', this);
        this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/overlay.html");
        this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/overlay.js");

        this.userSwitcherTemplatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/user-switch-popup.html");
        this.menuTemplatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/menu.html");

        var instance = this;
        org.ekstep.service.controller.loadNgModules(this._templatePath, this.controllerPath, function(injectTemplateFn){
            injectTemplateFn(instance._templatePath, instance._ngScopeVar, '#gameArea');
        });
    },
    showOverlay:function(injectTemplates){
        /*var gameArea = angular.element("#gameArea");
        gameArea.append("<ng-include src="+this.templatePath+"></ng-include>");
        $compile(gameArea)(scope);*/
       /* EkstepRendererAPI.dispatchEvent("renderer:init:overlay");*/
        console.info('overlay showpage');

    }
})

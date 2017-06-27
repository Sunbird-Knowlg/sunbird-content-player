/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */
Plugin.extend({
    initialize: function() {
        this.templatePath = undefined;
        console.info('overlay plugin is doing initialize....', this);
        this.templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/overlay.html");
        this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/overlay.js");
        //console.log("templatePath:"+ this.templatePath, "controllerPath:"+this.controllerPath);
        org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath, this.showOverlay);
    },
    showOverlay:function(scope){
        // org.ekstep.service.controller.inject(templatePath, "#ngoverlay");
        // var gameArea = angular.element("#gameArea");
        // gameArea.append("<ng-include src="+this.templatePath+"></ng-include>");
        // $compile(gameArea)(scope);
       /* EkstepRendererAPI.dispatchEvent("renderer:init:overlay");*/
        console.info('overlay showpage'); 

    },
    configEndPage:function(){
        console.info("Config end page");
    }

})
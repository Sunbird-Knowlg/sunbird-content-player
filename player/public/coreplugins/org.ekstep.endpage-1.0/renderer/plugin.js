/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */
Plugin.extend({
    myApp: undefined,
    templatePath : undefined,
    controllerPath:undefined,
    initialize: function() {
        console.info('Endpage plugin is doing initialize....');
        templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/end.html");
        controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/endpageApp.js");
        org.ekstep.service.controller.loadNgModules(templatePath, controllerPath);
        EkstepRendererAPI.addEventListener('renderer:init:endpage', this.showEndPage, this);
    },
    showEndPage:function(){
        console.info('Endpage display'); 
        this.configEndPage();
        org.ekstep.service.controller.inject(templatePath);
        jQuery("#pluginTemplate").show();
    },
    configEndPage:function(){
        console.info("Config end page");
    }

})
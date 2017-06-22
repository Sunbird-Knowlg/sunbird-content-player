/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */
Plugin.extend({
    myApp: undefined,
    templatePath : undefined,
    initialize: function() {
        console.info('Endpage plugin is doing initialize....');
        templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource('org.ekstep.endpage', '1.0', "renderer/templates/end.html");
        var controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource('org.ekstep.endpage', '1.0', "renderer/js/endpageApp.js");
        org.ekstep.service.controller.loadNgModules(templatePath, controllerPath);
        EkstepRendererAPI.addEventListener('renderer:init:endpage', this.showEndPage, this);
    },
    showEndPage:function(){
        console.info('Endpage display'); 
        this.configEndPage();
        org.ekstep.service.controller.inject(templatePath);
        jQuery("#pluginTemplate").show();
        /*jQuery("#pluginTemplate").css("z-index", "999");*/
    },
    configEndPage:function(){
        console.info("Config end page");
    }
})
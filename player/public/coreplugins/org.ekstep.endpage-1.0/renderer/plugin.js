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
    _ngScopeVar: "endPage",
    _injectTemplateFn: undefined,
    initialize: function() {
        console.info('Endpage plugin is doing initialize....');
        this.templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/end.html");
        this.controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/endpageApp.js");
        //org.ekstep.service.controller.loadNgModules(templatePath, controllerPath);

        var instance = this;
        org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath, function(injectTemplateFn){
           injectTemplateFn(instance.templatePath, instance._ngScopeVar, '#pluginTemplate');
        });
    },
    initEndPage:function(event, instance){
        console.info('Endpage display'); 
        this.configEndPage();
        //this._injectTemplateFn(this.templatePath, this._ngScopeVar);
        EkstepRendererAPI.dispatchEvent("renderer:add:template", {templatePath: this.templatePath, scopeVariable: this._ngScopeVar, toElement: '#pluginTemplate'});
        // jQuery("#pluginTemplate").show();
    },
    configEndPage:function(){
        console.info("Config end page");
    }

})
Plugin.extend({
    _type: "content-list",
    initialize: function() {
        console.info('contentlist plugin is doing initialize....');
        var templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/content-list.html");
        var controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/contentlist.js");

        var instance = this;
        org.ekstep.service.controller.loadNgModules(templatePath, controllerPath, function(injectTemplateFn){
            injectTemplateFn(templatePath, "contentlist", '#org.ekstep.contentlist');
        });
    }
});
//# sourceURL=contentlist.js
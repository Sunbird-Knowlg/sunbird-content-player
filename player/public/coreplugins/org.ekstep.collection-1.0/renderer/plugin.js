Plugin.extend({
    _type: "collection",
    initialize: function() {
        console.info('collection plugin is ready..')
        var templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/collection.html");
        var controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/collection.js");

        var instance = this;
        org.ekstep.service.controller.loadNgModules(templatePath, controllerPath, function(injectTemplateFn){
            injectTemplateFn(templatePath, "collection", '#org.ekstep.collection');
        });
    }
});
//# sourceURL=contentlist.js
/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Gourav More <gourav_m@tekditechnologies.com>
 */
Plugin.extend({
    _templatePath: undefined,
    _type: "alert",
    initialize: function() {
        console.info('alert plugin is doing initialize....');
        var instance = this;
        this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/alert-popup.html");
        this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/alert.js");
        org.ekstep.service.controller.loadNgModules(this._templatePath, this.controllerPath);
    }
});

//# sourceURL=alert.js
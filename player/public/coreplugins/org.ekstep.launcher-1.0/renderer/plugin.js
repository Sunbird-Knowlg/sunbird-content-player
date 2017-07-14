/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
Plugin.extend({
    templatePath : undefined,
    controllerPath: undefined,
    _ngScopeVar: "playerContent",
    _injectTemplateFn: undefined,
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:launcher:load', this.start, this);
        this.templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/renderer.html");
        this.controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/rendererApp.js");
        var instance = this;
        org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath);
    },
    start: function(evt, content) {
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var instance = this;
        var contentTypePlugin = _.findWhere(globalConfig.contentLaunchers, {
            'mimeType': content.mimeType
        });
        
        // Loading chore plugins of GenieCanvas
        org.ekstep.contentrenderer.initPlugins('',globalConfig.corePluginspath);
        instance.loadCommonPlugins(function(){
            if (!_.isUndefined(contentTypePlugin)) {
                instance.loadPlugin(contentTypePlugin, content);
            }            
        });
    },
    loadCommonPlugins: function(cb) {
        var plugins = []
        if (GlobalContext.config.showEndPage){
            plugins.push({"id": "org.ekstep.endpage", "ver": "1.0", "type": 'plugin'});
        }
        if (GlobalContext.config.overlay.showOverlay){
            plugins.push({"id": "org.ekstep.overlay", "ver": "1.0", "type": 'plugin'});
        }
         
        org.ekstep.contentrenderer.loadPlugins(plugins, [], function() {
            console.info('Endpage plugin is loaded..');
            if(cb) cb();
        });
    },
    loadPlugin: function(plugin, contentData) {
        var instance = this;
        content = contentData;
        org.ekstep.contentrenderer.loadPlugins(plugin, [], function() {
            EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
        });
    }
})
//# sourceURL=ContentLauncher.js
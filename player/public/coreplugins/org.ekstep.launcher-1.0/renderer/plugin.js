/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
Plugin.extend({
        templatePath: undefined,
        controllerPath: undefined,
        _ngScopeVar: "playerContent",
        _injectTemplateFn: undefined,
        // Hashmap for launchers
        launcherMap: {},
        initialize: function() {
            EkstepRendererAPI.addEventListener('renderer:launcher:load', this.start, this);
            EkstepRendererAPI.addEventListener('renderer:launcher:register', this.registerLauncher, this);
            this.templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/renderer.html");
            this.controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/rendererApp.js");
            org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath);
            this.loadCommonPlugins();
        },
        registerLauncher: function(event) {
            var plugin = event.target;
            try {
                plugin.mimeType.forEach(mimetype => {
                    this.launcherMap[mimetype] = {
                        event: plugin.launchEvent,
                        pluginId: plugin.manifest.id
                    }
                });
            } catch (error) {
                console.error('Plugin mimetype is not defined ', error)
            }
        },
        start: function(evt, contentObj) {
            content = contentObj;
            var launcherPluginMap = this.launcherMap[content.mimeType];
            // Checking if mimetype launcher is already loaded or not
            var pluginInstance = EkstepRendererAPI.getPluginObjs(launcherPluginMap.pluginId);
            EkstepRendererAPI.dispatchEvent('renderer:launcher:clean')
            if (pluginInstance) {
                // If already loaded just start the content
                EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
                EkstepRendererAPI.dispatchEvent(launcherPluginMap.event);
            } else {
                console.error('No plugin available to handle "' + content.mimetype + '" Mimetype')
            }
            EkstepRendererAPI.dispatchEvent('renderer:player:show');
        },
        loadCommonPlugins: function(cb) {
            var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
            var plugins = globalConfigObj.contentLaunchers;
            if (GlobalContext.config.showEndPage) {
                plugins.push({ "id": "org.ekstep.endpage", "ver": "1.0", "type": 'plugin' });
            }
            if (GlobalContext.config.overlay.showOverlay) {
                plugins.push({ "id": "org.ekstep.overlay", "ver": "1.0", "type": 'plugin' });
            }
            org.ekstep.contentrenderer.loadPlugins(plugins, [], function() {
                if (cb) cb();
            });
        }
    })
    //# sourceURL=ContentLauncher.js
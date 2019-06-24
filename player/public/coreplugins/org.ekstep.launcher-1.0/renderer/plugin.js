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
        rendererMap: {},
        initialize: function() {
            EkstepRendererAPI.addEventListener('renderer:launcher:load', this.start, this);
            EkstepRendererAPI.addEventListener('renderer:launcher:register', this.registerLauncher, this);
            EkstepRendererAPI.addEventListener('renderer:launcher:loadRendererPlugins', this.loadLauncherPlugins, this);
            this.templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/renderer.html");
            this.controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/rendererApp.js");
            org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath);
        },
        registerLauncher: function(event) {
            var instance = this;
            var plugin = event.target;
            try {
                plugin._constants.mimeType.forEach(function(mimetype) {
                    instance.rendererMap[mimetype] = {
                        event: plugin._constants.events.launchEvent,
                        pluginId: plugin.manifest.id
                    };
                });
            } catch (error) {
                console.error("Plugin mimetype is not defined ", error);
            }
        },
        start: function(evt, contentObj) {
            content = contentObj;
            var launcherPluginMap = this.rendererMap[content.mimeType];
            if (_.isUndefined(launcherPluginMap)) return;
            // Checking if mimetype launcher is already loaded or not
            var pluginInstance = EkstepRendererAPI.getPluginObjs(launcherPluginMap.pluginId);
            EkstepRendererAPI.dispatchEvent("renderer:launcher:clean")
            if (pluginInstance) {
                // If already loaded just start the content
                EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
                EkstepRendererAPI.dispatchEvent(launcherPluginMap.event);
            } else {
                // If not loaded load the launcher
                EkstepRendererAPI.logErrorEvent({stack: "No plugin available to handle '" + content.mimeType + "' Mimetype in launch manager"}, {
                    'severity': 'fatal',
                    'type': 'content',
                    'action': 'play'
                });
                EkstepRendererAPI.dispatchEvent("renderer:alert:show", undefined, {
                    title: "Error",
                    text: "Plugin not available",
                    type: "error",
                    data: {text: 'Plugin not available', data: "No plugin available to handle '" + content.mimeType + "' Mimetype"}
                })
            }
            EkstepRendererAPI.dispatchEvent("renderer:player:show");
        },
        loadLauncherPlugins: function(cb) {
            console.log("Loading launchers")
            var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
            var plugins = globalConfigObj.contentLaunchers;
            EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, {
                path: globalConfigObj.corePluginspath,
                position: 0
            });
            if (GlobalContext.config.showEndPage) {
                plugins.push({ "id": "org.ekstep.endpage", "ver": "1.0", "type": 'plugin' });
            }
            if (GlobalContext.config.overlay.showOverlay) {
                plugins.push({ "id": "org.ekstep.overlay", "ver": "1.0", "type": 'plugin' });
            }
            org.ekstep.contentrenderer.loadPlugins(plugins, [], function() {
                if (cb && typeof cb.target == "function") cb.target();
            });
        }
    })
    //# sourceURL=ContentLauncher.js
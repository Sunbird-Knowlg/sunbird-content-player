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
            var contentTypePlugin = _.find(globalConfig.contentLaunchers, function(eachConfig) {
                if (_.contains(eachConfig.mimeType, content.mimeType)) return eachConfig;
            });
            // Checking if mimetype launcher is already loaded or not
            var pluginInstance = EkstepRendererAPI.getPluginObjs(contentTypePlugin.id);
            if (pluginInstance) {
                // If already loaded just start the content
                pluginInstance.start();
            } else {
                // If not loaded load the launcher
                /**
                 * renderer:repo:create event will get dispatch to add a custom repo to load the plugins from the path.
                 * @event 'renderer:repo:create'
                 * @fires 'renderer:repo:create'
                 * @memberof EkstepRendererEvents
                 */
                EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, [globalConfig.corePluginspath]);
                instance.loadCommonPlugins(function() {
                    if (!_.isUndefined(contentTypePlugin)) {
                        // Except current Mimetype destroying all mimetype launchers
                        _.find(globalConfig.contentLaunchers, function(eachConfig) {
                            var plugin = org.ekstep.pluginframework.pluginManager.pluginObjs[eachConfig.id];
                            if (!_.contains(eachConfig.mimeType, content.mimeType) && plugin) {
                                plugin.destroy();
                            }
                        });
                        instance.loadPlugin(contentTypePlugin, content);
                    }
                });
            }
            EkstepRendererAPI.dispatchEvent('renderer:player:show');
        },
        loadCommonPlugins: function(cb) {
            var plugins = []
            if (GlobalContext.config.showEndPage) {
                plugins.push({ "id": "org.ekstep.endpage", "ver": "1.0", "type": 'plugin' });
            }
            if (GlobalContext.config.overlay.showOverlay) {
                plugins.push({ "id": "org.ekstep.overlay", "ver": "1.0", "type": 'plugin' });
            }

            org.ekstep.contentrenderer.loadPlugins(plugins, [], function() {
                if (cb) cb();
            });
        },
        loadPlugin: function(plugin, contentData) {
            var instance = this;
            content = contentData;
            org.ekstep.contentrenderer.loadPlugins(plugin, [], function() {
                /**
                 * telemetryPlugin:intialize event will get dispatch to Initialize the telemetry plugin before loading of the launchers.
                 * @event 'telemetryPlugin:intialize'
                 * @fires 'telemetryPlugin:intialize'
                 * @memberof EkstepRendererEvents
                 */
                EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
            });
        }
    })
    //# sourceURL=ContentLauncher.js
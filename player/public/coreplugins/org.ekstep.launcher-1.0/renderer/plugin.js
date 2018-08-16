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
        launcherMap: {},
        initialize: function() {
            EkstepRendererAPI.addEventListener('renderer:launcher:load', this.start, this);
            EkstepRendererAPI.addEventListener('renderer:launcher:register', this.registerLauncher, this);
            this.templatePath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/renderer.html");
            this.controllerPath = EkstepRendererAPI.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/js/rendererApp.js");
            org.ekstep.service.controller.loadNgModules(this.templatePath, this.controllerPath);
            EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, [globalConfig.corePluginspath]);
        },
        registerLauncher: function(event) {
            var plugin = event.target;
            plugin.mimeType.forEach(mimetype => {
                this.launcherMap[mimetype] = plugin;
            });
        },
        start: function(evt, contentObj) {
            this.loadCommonPlugins(() => {
                content = contentObj;
                // var contentTypePlugin = _.find(this.launcherMap, function(eachConfig) {
                //     if (_.contains(eachConfig.mimeType, content.mimeType)) return eachConfig;
                // });
            // Checking if mimetype launcher is already loaded or not
                // var pluginInstance = EkstepRendererAPI.getPluginObjs(contentTypePlugin.manifest.id);
                EkstepRendererAPI.dispatchEvent('renderer:launcher:clean')
            // if (pluginInstance) {
                // If already loaded just start the content
                EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
                EkstepRendererAPI.dispatchEvent('content:load:' + content.mimeType);
                // pluginInstance.start();
            // } else {
                // If not loaded load the launcher
                /**
                 * renderer:repo:create event will get dispatch to add a custom repo to load the plugins from the path.
                 * @event 'renderer:repo:create'
                 * @fires 'renderer:repo:create'
                 * @memberof EkstepRendererEvents
                 */
                // EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, [globalConfig.corePluginspath]);
                // instance.loadCommonPlugins(function() {
                //     if (!_.isUndefined(contentTypePlugin)) {
                //         // Except current Mimetype destroying all mimetype launchers
                //         // _.find(globalConfig.contentLaunchers, function(eachConfig) {
                //         //     var plugin = org.ekstep.pluginframework.pluginManager.pluginObjs[eachConfig.id];
                //         //     if (!_.contains(eachConfig.mimeType, content.mimeType) && plugin) {
                //         //         plugin.destroy();
                //         //     }
                //         // });
                //         instance.loadPlugin(contentTypePlugin, content);
                //     }
                });
            // }
            EkstepRendererAPI.dispatchEvent('renderer:player:show');
        },
        loadCommonPlugins: function(cb) {
            var plugins = [
                {id: "org.ekstep.ecmlrenderer",ver: 1.0,type: 'plugin'},
                {id: "org.ekstep.htmlrenderer",ver: 1.0,type: 'plugin'},
                {id: "org.ekstep.videorenderer",ver: 1.0,type: 'plugin'},
                {id: "org.ekstep.pdfrenderer",ver: 1.0,type: 'plugin'},
                {id: "org.ekstep.epubrenderer",ver: 1.0,type: 'plugin'},
                {id: "org.ekstep.extcontentpreview",ver: 1.0,type: 'plugin'}
            ]
            if (GlobalContext.config.showEndPage) {
                plugins.push({ "id": "org.ekstep.endpage", "ver": "1.0", "type": 'plugin' });
            }
            if (GlobalContext.config.overlay.showOverlay) {
                plugins.push({ "id": "org.ekstep.overlay", "ver": "1.0", "type": 'plugin' });
            }
            org.ekstep.contentrenderer.loadPlugins(plugins, [], function() {
                if (cb) cb();
            });
        // },
        // loadPlugin: function(plugin, contentData) {
        //     content = contentData;
        //     org.ekstep.contentrenderer.loadPlugins(plugin, [], function() {
        //         /**
        //          * telemetryPlugin:intialize event will get dispatch to Initialize the telemetry plugin before loading of the launchers.
        //          * @event 'telemetryPlugin:intialize'
        //          * @fires 'telemetryPlugin:intialize'
        //          * @memberof EkstepRendererEvents
        //          */
        //         EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
        //         EkstepRendererAPI.dispatchEvent('content:load:' + content.mimeType);
        //     });
        }
    })
    //# sourceURL=ContentLauncher.js
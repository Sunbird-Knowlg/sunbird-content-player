Plugin.extend({
    initialize: function() {
        console.info('ECML Renderer initialize')
        EkstepRendererAPI.addEventListener('renderer:ecml:launch', this.start, this);
    },
    start: function(evt, renderObj) {
        var instance = this;
        if (_.isUndefined(renderObj)) return;
        try {
            if (Renderer.running) {
                Renderer.cleanUp();
                TelemetryService.start(renderObj.identifier, renderObj.pkgVersion);
            }
            Renderer.running = true;
            Renderer.preview = renderObj.preview || false;
            if (renderObj.body) {
                instance.load(renderObj.body, 'gameCanvas', renderObj.gameRelPath);
            } else {
                instance.initByJSON(renderObj.baseDir, 'gameCanvas');
                if (typeof sensibol != "undefined") {
                    sensibol.recorder.init(renderObj.baseDir + "/lesson.metadata")
                        .then(function(res) {
                            console.info("Init lesson successful.", res);
                        })
                        .catch(function(err) {
                            console.error("Error while init lesson:", err);
                        });
                }
            }
        } catch (e) {
            showToaster('error', 'Lesson fails to play');
            EkstepRendererAPI.logErrorEvent(e, {
                'severity': 'fatal',
                'type': 'content',
                'action': 'play'
            });
            console.warn("Canvas Renderer init is failed", e);
        }
    },
    initByJSON: function(gameRelPath, canvasId) {
        var instance = this;
        jQuery.getJSON(gameRelPath + '/index.json', function(data) {
                instance.load(data, canvasId, gameRelPath);
            })
            .fail(function() {
                instance.initByXML(gameRelPath, canvasId)
            });
    },
    initByXML: function(gameRelPath, canvasId) {
        var instance = this;
        jQuery.get(gameRelPath + '/index.ecml', function(data) {
                instance.load(data, canvasId, gameRelPath);
            }, null, 'xml')
            .fail(function(err) {
                EkstepRendererAPI.logErrorEvent(err, {'severity':'fatal','type':'content','action':'play'}); 
                alert("Invalid ECML please correct the Ecml : ", err);
                checkStage();
            });
    },
    load: function(data, canvasId, gameRelPath) {
        var instance = this;
        tempData = data;
        if (!jQuery.isPlainObject(data)) {
            var x2js = new X2JS({
                attributePrefix: 'none'
            });
            data = x2js.xml2json(data);
        }
        Renderer.gdata = data;
        var content = data.theme || data.ecml;
        content.canvasId = canvasId;
        Renderer.theme = new ThemePlugin(content);
        Renderer.resizeGame(true);
        Renderer.theme.baseDir = gameRelPath;
        var manifest = content.manifest ? content.manifest : AssetManager.getManifest(content);
        PluginManager.init(gameRelPath);
        var resource = instance.handleRelativePath(instance.getResource(manifest), gameRelPath + '/widgets/');
        var pluginManifest = content["plugin-manifest"];
        (_.isUndefined(pluginManifest) || _.isEmpty(pluginManifest)) && (pluginManifest = { plugin: [] });
        var previewPlugins = EkstepRendererAPI.getPreviewData().config.plugins;
        if (previewPlugins) {
            _.each(previewPlugins, function(item) { pluginManifest.plugin.push({id: item.id, ver: item.ver || 1.0, type: item.type || "plugin", depends: item.depends || ""}); });
        }
        try {
            PluginManager.loadPlugins(pluginManifest.plugin, resource, function() {
                Renderer.theme.start(gameRelPath.replace('file:///', '') + "/assets/");
            });
        } catch (e) {
            console.warn("Framework fails to load plugins", e);
            EkstepRendererAPI.logErrorEvent(e, {'severity':'fatal','type':'system','action':'play'}); 
            showToaster('error', 'Framework fails to load plugins');
        }
        createjs.Ticker.addEventListener("tick", function() {
            if (Renderer.update) {
                if (!_(Renderer.theme).isUndefined()) {
                    Renderer.theme.update();
                    Renderer.update = false;
                }
            } else {
                if (Renderer.theme) {
                    Renderer.theme.tick();
                }
            }
        });
    },
    handleRelativePath: function(manifestMedia, pluginPath) {
        _.each(manifestMedia, function(p) {
            if (p.src.substring(0, 4) != 'http') {
                if (!isbrowserpreview) {
                    p.src = pluginPath + p.src;
                }else{
                   p.src = AppConfig.host + p.src;
                }
            }
        });
        return manifestMedia;
    },
    getResource: function(manifest) {
        var plugins = _.filter(!_.isArray(manifest.media) ? [manifest.media] : manifest.media, function(media) {
            return media.type === 'css' || media.type === 'js' || media.type === 'plugin' || media.type === ' library';
        });
        return plugins;
    }
});

//# sourceURL=ECMLRenderer.js
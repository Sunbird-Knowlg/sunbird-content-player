Plugin.extend({
    loader: undefined,
    gdata: undefined,
    running: false,
    preview: false,
    initialize: function() {
        console.info('ECML Renderer initialize')
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.ecml-archive', this.start, this);
    },
    start: function(evt, renderObj) {
        var instance = this;
        if (_.isUndefined(renderObj)) return;
        try {
            if (this.running) {
                Renderer.cleanUp();
                TelemetryService.start(renderObj.identifier, renderObj.pkgVersion);
            }
            this.running = true;
            this.preview = renderObj.preview || false;
            if (renderObj.body) {
                var dataObj = {
                    'body': renderObj.body,
                    'canvasId': 'gameCanvas',
                    'path': renderObj.gameRelPath
                }
                instance.load(dataObj);
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
    resizeGame: function(disableDraw) {
        var gameArea = document.getElementById(Renderer.divIds.gameArea);
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
            gameArea.style.height = newHeight + 'px';
            gameArea.style.width = newWidth + 'px';
        } else {
            newHeight = newWidth / widthToHeight;
            gameArea.style.width = newWidth + 'px';
            gameArea.style.height = newHeight + 'px';
        }

        gameArea.style.marginTop = (-newHeight / 2) + 'px';
        gameArea.style.marginLeft = (-newWidth / 2) + 'px';
        Renderer.theme.updateCanvas(newWidth, newHeight);
        if (!disableDraw) Renderer.theme.reRender();
    },
    initByJSON: function(gameRelPath, canvasId) {
        var instance = this;
        jQuery.getJSON(gameRelPath + '/index.json', function(data) {
                var dataObj = {
                    'body': data,
                    'canvasId': canvasId,
                    'path': gameRelPath
                }
                instance.load(dataObj);
            })
            .fail(function() {
                instance.initByXML(gameRelPath, canvasId)
            });
    },
    initByXML: function(gameRelPath, canvasId) {
        var instance = this;
        jQuery.get(gameRelPath + '/index.ecml', function(data) {
                var dataObj = {
                    'body': data,
                    'canvasId': canvasId,
                    'path': gameRelPath
                }
                instance.load(dataObj);
            }, null, 'xml')
            .fail(function(err) {
                EkstepRendererAPI.logErrorEvent(err, { 'severity': 'fatal', 'type': 'content', 'action': 'play' });
                alert("Invalid ECML please correct the Ecml : ", err);
            });
    },
    load: function(dataObj) {
        var instance = this,
            data = dataObj.body;
        if (!jQuery.isPlainObject(data)) {
            var x2js = new X2JS({
                attributePrefix: 'none'
            });
            data = x2js.xml2json(data);
        }
        this.gdata = data;
        var content = data.theme || data.ecml;
        content.canvasId = dataObj.canvasId;
        Renderer.theme = new ThemePlugin(content);
        instance.resizeGame(true);
        Renderer.theme.baseDir = dataObj.path;
        var manifest = content.manifest ? content.manifest : AssetManager.getManifest(content);
        PluginManager.init(dataObj.path);
        var resource = instance.handleRelativePath(instance.getResource(manifest), dataObj.path + '/widgets/');
        var pluginManifest = content["plugin-manifest"];
        (_.isUndefined(pluginManifest) || _.isEmpty(pluginManifest)) && (pluginManifest = { plugin: [] });
        var previewPlugins = EkstepRendererAPI.getPreviewData().config.plugins;
        if (previewPlugins) {
            _.each(previewPlugins, function(item) { pluginManifest.plugin.push({ id: item.id, ver: item.ver || 1.0, type: item.type || "plugin", depends: item.depends || "" }); });
        }
        try {
            PluginManager.loadPlugins(pluginManifest.plugin, resource, function() {
                Renderer.theme.start(dataObj.path.replace('file:///', '') + "/assets/");
                instance.initializeEndpage();
            });
        } catch (e) {
            console.warn("Framework fails to load plugins", e);
            EkstepRendererAPI.logErrorEvent(e, { 'severity': 'fatal', 'type': 'system', 'action': 'play' });
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
                } else {
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
    },
    initializeEndpage:function(){
        EkstepRendererAPI.dispatchEvent('renderer:init:endpage');
    },
});

//# sourceURL=ECMLRenderer.js

Renderer = {
    loader: undefined,
    theme: undefined,
    update: true,
    gdata: undefined,
    running: false,
    preview: false,
    divIds: {
        gameArea: 'gameArea',
        canvas: 'gameCanvas'
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
    start: function(gameRelPath, canvasId, game, data, preview) {
        try {
            if (Renderer.running) {
                Renderer.cleanUp();
                TelemetryService.start(game.identifier, game.pkgVersion);
            }
            Renderer.running = true;
            Renderer.preview = preview || false;
            if (data) {
                Renderer.init(data, canvasId, gameRelPath);
            } else {
                Renderer.initByJSON(gameRelPath, canvasId);
                if (typeof sensibol != "undefined") {
                    sensibol.recorder.init(gameRelPath + "/lesson.metadata")
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
            console.warn("Canvas Renderer init is failed", e);
        }
    },
    initByJSON: function(gameRelPath, canvasId) {
        jQuery.getJSON(gameRelPath + '/index.json', function(data) {
                Renderer.init(data, canvasId, gameRelPath);
            })
            .fail(function() {
                Renderer.initByXML(gameRelPath, canvasId)
            });
    },
    initByXML: function(gameRelPath, canvasId) {
        jQuery.get(gameRelPath + '/index.ecml', function(data) {
                Renderer.init(data, canvasId, gameRelPath);
            }, null, 'xml')
            .fail(function(err) {
                alert("Invalid ECML please correct the Ecml : ", err);
                checkStage();
            });
    },
    init: function(data, canvasId, gameRelPath) {
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
        initializePluginFramwork(gameRelPath);
        var media = this.getCanvasMedia();
        var pluginManifest = content.pluginManifest;
        pluginManifest = _.isUndefined(pluginManifest) ? {} : content.pluginManifest.plugin;
        try {
            instance.loadPlugins(pluginManifest, function() {
                instance.loadPlugins(media, function() {
                    PluginManager.loadPlugins(media, function() {
                        Renderer.theme.start(gameRelPath.replace('file:///', '') + "/assets/");
                    });
                });
            });
        } catch (e) {
            console.warn("Framework fails to load plugins", e);
            showToaster('Framework fails to load plugin');
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
    loadPlugins: function(media, cb) {
        var pluginsObj = {};
        console.info("media",media);
        if (media) {
            _.each(media, function(p) {
                pluginsObj[p.id] = "1.0" || p.ver;
            });
        }
        org.ekstep.pluginframework.pluginManager.loadAllPlugins(pluginsObj, function() {
            console.info("Framework Loaded the plugins", pluginsObj);
            if (cb) cb();
        });
    },
    getCanvasMedia: function() {
        var data = Renderer.theme._data;
        var manifest = data.manifest ? data.manifest : AssetManager.getManifest(data);
        var plugins = _.filter(!_.isArray(manifest.media) ? [manifest.media] : manifest.media, function(media) {
            return media.type == 'plugin' || media.type == 'js' || media.type == 'css';
        });
        return plugins;
    },
    cleanUp: function() {
        Renderer.running = false;
        AnimationManager.cleanUp();
        AssetManager.destroy();
        TimerManager.destroy();
        AudioManager.cleanUp();
        Renderer.theme.cleanUp();
        Renderer.theme = undefined;
    },
    pause: function() {
        if (Renderer.theme)
            Renderer.theme.pause();
    },
    resume: function() {
        if (Renderer.theme)
            Renderer.theme.resume();
    },
}
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
        var manifest = content.manifest ? content.manifest : AssetManager.getManifest(content);
        PluginManager.init(gameRelPath);
        var resource = instance.handleRelativePath(instance.getResource(manifest), gameRelPath + '/widgets/');
        var pluginManifest = content["plugin-manifest"];
        pluginManifest = _.isUndefined(pluginManifest) || _.isEmpty(pluginManifest) ? []: pluginManifest.plugin;
        try {
            PluginManager.loadPlugins(pluginManifest, resource, function() {
                Renderer.theme.start(gameRelPath.replace('file:///', '') + "/assets/");
            });
        } catch (e) {
            console.warn("Framework fails to load plugins", e);
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
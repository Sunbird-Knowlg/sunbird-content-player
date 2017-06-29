/**
 * This plugin is used to play ECML comntent
 * @class ecmlRenderer
 * @extends basePlugin
 * @author Kartheek Palla <kartheekp@ilimi.in>
 */

Plugin.extend({
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
    /**
     * registers events
     * @memberof ecmlRenderer
     */
    initialize: function() {
        console.info('ECML Renderer initialize');
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.ecml-archive', this.start, this);
        EkstepRendererAPI.addEventListener('renderer:cleanUp', this.cleanUp, this);
    },
    /**
     * 
     * @memberof ecmlRenderer
     */
    start: function(evt, renderObj) {
        var instance = this;
        if (_.isUndefined(renderObj)) return;
        try {
            if (this.running) {
                this.cleanUp();
                TelemetryService.start(renderObj.identifier, renderObj.pkgVersion);
            }
            this.running = true;
            this.preview = renderObj.preview || false;
            if (renderObj.body) {
                var dataObj = {
                    'body': renderObj.body,
                    'canvasId': 'gameCanvas',
                    'path': renderObj.path
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
    /**
     * This method used for resize the gamearea
     * @memberof ecmlRenderer
     */
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
    /**
     * This method is used to read content json
     * @memberof ecmlRenderer
     */
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
    /**
     * This method is used to read content ECML
     * @memberof ecmlRenderer
     */
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
    /**
     * This method is used load the content
     * @memberof ecmlRenderer
     */
    load: function(dataObj) {
        var instance = this,
            data = dataObj.body;

        if (!jQuery.isPlainObject(data)) {
            var x2js = new X2JS({
                attributePrefix: 'none'
            });
            var tempData = data;
            if(isbrowserpreview){
                data = x2js.xml_str2json(tempData)
                if (!data || data.parsererror)
                    data = JSON.parse(tempData)
            }else{
                data = x2js.xml2json(tempData);
            }
        }

        this.gdata = data;
        var content = data.theme || data.ecml;
        content.canvasId = dataObj.canvasId;
        EkstepRendererAPI.setRenderer(instance);
        Renderer.theme = new ThemePlugin(content);
        instance.resizeGame(true);
        Renderer.theme.baseDir = dataObj.path;
        var manifest = content.manifest ? content.manifest : AssetManager.getManifest(content);
        org.ekstep.contentrenderer.initPlugins(dataObj.path);
        var resource = instance.handleRelativePath(instance.getResource(manifest), dataObj.path + '/widgets/');
        var pluginManifest = content["plugin-manifest"];
        (_.isUndefined(pluginManifest) || _.isEmpty(pluginManifest)) && (pluginManifest = { plugin: [] });
        var previewPlugins = EkstepRendererAPI.getPreviewData().config.plugins;
        if (previewPlugins) {
            _.each(previewPlugins, function(item) { pluginManifest.plugin.push({ id: item.id, ver: item.ver || 1.0, type: item.type || "plugin", depends: item.depends || "" }); });
        }
        try {
            org.ekstep.contentrenderer.loadPlugins(pluginManifest.plugin, resource, function() {
                Renderer.theme.start(dataObj.path.replace('file:///', '') + "/assets/");
            });
        } catch (e) {
            console.warn("Framework fails to load plugins", e);
            EkstepRendererAPI.logErrorEvent(e, { 'severity': 'fatal', 'type': 'system', 'action': 'play' });
            showToaster('error', 'Framework fails to load plugins');
        }
        createjs.Ticker.addEventListener("tick", function() {
            if (Renderer.update && (typeof Renderer.theme !== 'undefined')) {
                Renderer.theme.update();
                Renderer.update = false;
            } else if (Renderer.theme) {
                Renderer.theme.tick();
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
    /**
     * This method is used clean renderer objects
     * @memberof ecmlRenderer
     */
    cleanUp: function() {
        this.running = false;
        AnimationManager.cleanUp();
        AssetManager.destroy();
        TimerManager.destroy();
        AudioManager.cleanUp();
        if(Renderer.theme)
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
    }
});

//# sourceURL=ECMLRenderer.js

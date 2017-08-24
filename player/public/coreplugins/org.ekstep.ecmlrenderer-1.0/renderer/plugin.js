/**
 * This plugin is used to play ECML comntent
 * @class ecmlRenderer
 * @extends basePlugin
 * @author Kartheek Palla <kartheekp@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher.extend({
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
    stageId:[],
    qid:[],
    /**
     * registers events
     * @memberof ecmlRenderer
     */
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:content:replay', this.relaunchGame, this);
        EkstepRendererAPI.addEventListener('renderer:content:load', this.start, this);
        EkstepRendererAPI.addEventListener('renderer:cleanUp', this.cleanUp, this);
        EkstepRendererAPI.addEventListener('renderer:content:end',this.onContentEnd,this);
        var instance = this;
        setTimeout(function(){
            // This is required to initialize angular controllers & directives 
            instance.start();
        }, 0);
    },
    /**
     * 
     * @memberof ecmlRenderer
     */
    start: function(evt, renderObj) {
        var instance = this;
        renderObj = content;
        if (_.isUndefined(renderObj)) return;
        instance.initContentProgress();
        if(isbrowserpreview){
            renderObj.path = '';
        }
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
                    'path': renderObj.path || ""
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
        EkstepRendererAPI.dispatchEvent("render:overlay:applyStyles");
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
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
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
        var pluginsPath = isbrowserpreview ? globalConfig.previewPluginspath : globalConfig.devicePluginspath;
        EkstepRendererAPI.dispatchEvent("renderer:repo:create",undefined, {path: dataObj.path + pluginsPath, position:0});
        var resource = instance.handleRelativePath(instance.getResource(manifest), dataObj.path + '/widgets/');
        var pluginManifest = content["plugin-manifest"];
        (_.isUndefined(pluginManifest) || _.isEmpty(pluginManifest)) && (pluginManifest = { plugin: [] });
        try {
            org.ekstep.contentrenderer.loadPlugins(pluginManifest.plugin, resource, function() {
                Renderer.theme.start(dataObj.path.replace('file:///', '') + "/assets/");
            });
        } catch (e) {
            logConsoleMessage.warn("Framework fails to load plugins", e);
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
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        _.each(manifestMedia, function(p) {
            if (p.src.substring(0, 4) != 'http') {
                if (!isbrowserpreview) {
                    p.src = pluginPath + p.src;
                } else {
                    p.src = globalConfig.host + p.src;
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
    },
    relaunchGame: function(){
        this.relaunch();
        this.qid = [];
        this.stageId = [];
        Renderer.theme.removeHtmlElements();
        Renderer.theme.reRender();
    },
    onContentEnd:function(){
        this.endTelemetry();
    },
    getContentAssesmentCount: function() {
        var questionCount = 0;
        _.find(Renderer.theme._data.stage, function(obj) {
            if (obj['org.ekstep.quiz']) {
                var itemData = JSON.parse(obj['org.ekstep.quiz'].data);
                questionCount = questionCount + (itemData.questionnaire.total_items - 1);
                console.info("questionCount", questionCount);
            }
        });
        return questionCount;
    },
    initContentProgress: function(){
        var instance = this;
        EkstepRendererAPI.addEventListener("sceneEnter",function(event){
             instance.stageId.push(event.target.id);
        });

        EkstepRendererAPI.addEventListener("renderer:assesment:eval",function(event){
            instance.qid.push(event.target.event.edata.eks.qid);
            instance.stageId = _.without(instance.stageId, Renderer.theme._currentStage);;
        });
    },
    contentProgress:function(){
       var currentStageIndex = _.size(_.uniq(this.stageId)) + _.size(_.uniq(this.qid))  ;
       var totalStages = Renderer.theme._data.stage.length + this.getContentAssesmentCount();
        return this.progres(currentStageIndex, totalStages);
    },

});

//# sourceURL=ECMLRenderer.js

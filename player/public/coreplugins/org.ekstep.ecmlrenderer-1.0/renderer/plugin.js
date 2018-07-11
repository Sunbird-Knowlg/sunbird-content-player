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
    enableHeartBeatEvent:false,

    /**
     * registers events
     * @memberof ecmlRenderer
     */
    initLauncher: function(manifest) {
        EkstepRendererAPI.addEventListener('renderer:content:load', this.start, this);
        EkstepRendererAPI.addEventListener('renderer:cleanUp', this.cleanUp, this);
        var instance = this;
        setTimeout(function(){
            instance.start();
        }, 0);
    },
    /**
     *
     * @memberof ecmlRenderer
     */
    start: function(evt, renderObj) {
        this._super();
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var instance = this;
        renderObj = content;
        if (_.isUndefined(renderObj)) return;
        this.initContentProgress();
        if(isbrowserpreview){
            renderObj.path = '';
        }
        try {
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
                instance.initByJSON(globalConfigObj.basepath, 'gameCanvas');
                if (typeof sensibol != "undefined") {
                    sensibol.recorder.init(globalConfigObj.basepath + "/lesson.metadata")
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
        var newWidth = (window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;
        var newHeight = (window.innerWidth > window.innerHeight) ? window.innerHeight : window.innerWidth;
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
        gameArea.style.left = "";
        gameArea.style.top = "";
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
                EventBus.dispatch("renderer:alert:show", undefined, {
                  title: "Error",
                  text: "Invalid ECML please correct the Ecml",
                  type: "error",
                  data: err
                });
            });
    },
    /**
     * This method is used load the content
     * @memberof ecmlRenderer
     */
    load: function(dataObj) {
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
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
        Renderer.theme.baseDir = globalConfigObj.basepath || dataObj.path;
        var manifest = content.manifest ? content.manifest : AssetManager.getManifest(content);
        var pluginsPath = isbrowserpreview ? globalConfigObj.previewPluginspath : globalConfigObj.devicePluginspath;
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
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        _.each(manifestMedia, function(p) {
            if (p.src.substring(0, 4) != 'http') {
                if (!isbrowserpreview) {
                    p.src = pluginPath + p.src;
                } else {
                    p.src = globalConfigObj.host + p.src;
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
        if (this.running) {
            this.running = false;
            AnimationManager.cleanUp();
            AssetManager.destroy();
            TimerManager.destroy();
            AudioManager.cleanUp();
            if(Renderer && Renderer.theme) {
                Renderer.theme.cleanUp();
                Renderer.theme.clearStage();
                Renderer.theme = undefined;
            }
        }
    },
    pause: function() {
        if (Renderer.theme)
            Renderer.theme.pause();
    },
    resume: function() {
        if (Renderer.theme)
            Renderer.theme.resume();
    },
    replay: function(){
        this.qid = [];
        this.stageId = [];
        Renderer.theme.removeHtmlElements();
        Renderer.theme.reRender();
        this.startTelemetry();
    },
    
    getContentAssesmentCount: function() {
        var questionCount = 0;
        var itemData =undefined;
        // TODO : Need to check in the preview getting wrong quiz plugin data.
        _.find(Renderer.theme._data.stage, function(obj) {
            if (obj['org.ekstep.quiz']) {
                if(_.isArray(obj['org.ekstep.quiz'])){
                    if(obj['org.ekstep.quiz'][0].data){
                        itemData = JSON.parse(obj['org.ekstep.quiz'][0].data.__cdata);
                    }
                }else{
                    itemData = JSON.parse(obj['org.ekstep.quiz'].data);
                }
                questionCount = questionCount + (itemData.questionnaire.total_items - 1);
                console.info("questionCount", questionCount);
            }
        });
        return questionCount;
    },
    initContentProgress: function() {
        var instance = this;
        EkstepRendererAPI.addEventListener("sceneEnter", function(event) {
            var currentScene = Renderer.theme._currentScene
            if (currentScene.isItemScene()) {
                if (!_.contains(instance.qid, currentScene._stageController.assessStartEvent.event.edata.eks.qid)) {
                    instance.stageId.push(event.target.id);
                }
            } else {
                instance.stageId.push(event.target.id);
            }
        }, this);

        EkstepRendererAPI.addEventListener("renderer:assesment:eval", function(event) {
            instance.qid.push(event.target.event.edata.eks.qid);
            instance.stageId = _.without(instance.stageId, Renderer.theme._currentStage);;
        });
    },
    contentProgress:function(){
       var currentStageIndex = _.size(_.uniq(this.stageId)) + _.size(_.uniq(this.qid));
       console.info("currentStageIndex",currentStageIndex);
       var totalStages = Renderer.theme._data.stage.length + this.getContentAssesmentCount();

        return this.progres(currentStageIndex, totalStages);
    },


});

//# sourceURL=ECMLRenderer.js

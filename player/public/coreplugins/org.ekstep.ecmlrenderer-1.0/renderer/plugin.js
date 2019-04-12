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
    _constants: {	
        mimeType: ["application/vnd.ekstep.ecml-archive"],	
        events: {	
            launchEvent: "renderer:launch:ecml"	
        }	
    },

    /**
     * registers events
     * @memberof ecmlRenderer
     */
    initLauncher: function() {
        EkstepRendererAPI.addEventListener('renderer:content:load', this.start, this);
        EkstepRendererAPI.addEventListener('renderer:cleanUp', this.cleanUp, this);
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
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
                err.responseText = "Invalid ECML please correct the Ecml";
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
        if(EkstepRendererAPI.isStreamingContent()) org.ekstep.pluginframework.pluginManager.asyncQueueConcurrency = 1;

        (_.isUndefined(pluginManifest) || _.isEmpty(pluginManifest)) && (pluginManifest = { plugin: [] });
        try {
            org.ekstep.contentrenderer.loadPlugins(pluginManifest.plugin, resource, function() {
                qspatch.handleAssetUrl();
                qspatch.telemetryPatch();
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
        if (this.sleepMode) return;	
        this.sleepMode = true;	
        EkstepRendererAPI.removeEventListener('renderer:launcher:clean', this.cleanUp, this);
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
        if (this.sleepMode) return;
        this.qid = [];
        this.stageId = [];
        if (Renderer && Renderer.theme) {
            Renderer.theme.removeHtmlElements();
            this.startTelemetry();
            Renderer.theme.reRender();
        }
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
            if (instance.sleepMode) return;
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

// TODO: Temporary solution: To handle Questionset backward compatibility (online streaming in mobile)
var qspatch = {
    getPluginInstance: function(pluginObj){
        if(pluginObj){
            return pluginObj;
        } else {
            return false;
        }
    },
    handleAssetUrl : function() {        
        
        var pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "AssetUrl");

        pluginInst = this.getPluginInstance(org.ekstep.questionunitmcq && org.ekstep.questionunitmcq.RendererPlugin);
        this.setPluginUrl(pluginInst, "AssetUrl");

        pluginInst = this.getPluginInstance(org.ekstep.keyboard && org.ekstep.contentrenderer.keyboardRenderer);
        this.setPluginUrl(pluginInst, "AssetUrl");
        
        pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "AudioUrl");
        
        pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "iconUrl");
    },
    setPluginUrl: function(pluginObj, urlType){
        var instance = this;
        if(!pluginObj) {
            return;
        }

        switch (urlType) {
            case "AssetUrl":
                pluginObj.prototype.getAssetUrl = function (url) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(url);
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(url)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + url.substring(1, url.length));
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + url);
                        }
                    }
                }
                break;

            case "AudioUrl":
                pluginObj.prototype.getIcon = function (path, pluginId, pluginVer) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(this.getAssetUrl(org.ekstep.pluginframework.pluginManager.resolvePluginResource(pluginId, pluginVer, path)));
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(path)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + pluginId + '-' + pluginVer + '/' +path);
                            //return org.ekstep.pluginframework.pluginManager.resolvePluginResource(pluginId, pluginVer, path);
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + 'content-plugins/' + pluginId + '-' + pluginVer + '/' + path);
                        }
                    }
                }  
            break;
        
            case "iconUrl":
                pluginObj.prototype.getAudioIcon = function (path) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(this.getAssetUrl(org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, path)));
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(path)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + this._manifest.id + '-' + this._manifest.ver + '/' + path);
                            //return org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, path);
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + 'content-plugins/' + this._manifest.id + '-' + this._manifest.ver + '/' + path);
                        }
                    }
                }
            break;

            default:
                break;
        }
        
    },
    validateUrl: function(url){
        if(!url){
            return
        }
        var regex = new RegExp("^(http|https)://", "i");
        if(regex.test(url)){
            var tempUrl = url.split("://")
            if (tempUrl.length > 1){
                var validString = tempUrl[1].split("//").join("/");
                return [tempUrl[0], validString].join("://");
            }             
        }else{
            var tempUrl = url.split(":///")
            if (tempUrl.length > 1){
                var validString = tempUrl[1].split("//").join("/");;
                return [tempUrl[0], validString].join(":///");
            }
        } 
        return url.split("//").join("/");
    },
    telemetryPatch : function() {
        var _super_logAssessEnd = QSTelemetryLogger.logAssessEnd; // Reference to the original function, As for new Assessment bundles telemetry should handled normally
        var instance = this;
        var qsPlugins = {   
            'FTB' : {
                'id':'org.ekstep.questionunit.ftb',
                'versions' : ['1.0'],
                'patchHandler' : function(result, tuple){
                    this._plugin._question.data.answer.forEach((expected, index) => {
                        tuple.params.push({
                            [index + 1] : {'text' : expected}
                        })
                    })

                    result.state.val.forEach((actual, index) => {
                        tuple.resvalues.push({
                            [index + 1] : {'text' : actual}
                        })
                    })
                }
            },
            'REORDER' : {
                'id':'org.ekstep.questionunit.reorder',
                'versions' : ['1.0'],
                'patchHandler' : function(result, tuple){
                    result.state.keys.forEach((key, index) => {
                        delete key.$$hashKey; // Currently reorder 1.0 sending with $$hashKey property
                        tuple.params.push({
                            [index + 1] : instance.generateTelemetryTupleValue(key)
                        })
                    })
                    result.state.val.forEach(function(word, wordIndex){
                        tuple.resvalues.push({
                            [wordIndex + 1] : instance.generateTelemetryTupleValue(word.text)
                        })
                    })
                }
            },
            'SEQUENCE' : {
                'id':'org.ekstep.questionunit.sequence',
                'versions' : ['1.0'],
                'patchHandler' : function(result, tuple){
                    result.state.val.seq_rearranged.forEach((seqIndex, index) => {
                        tuple.params.push({ 
                            [index + 1] : instance.generateTelemetryTupleValue(result.state.seq_rendered[index])
                        });

                        tuple.resvalues.push({
                            [index + 1] : instance.generateTelemetryTupleValue(result.state.seq_rendered.find(seq => {
                                return seq.sequenceOrder == seqIndex;
                            }))
                        })
                    });
                }      
            },
            'MCQ' : {
                'id':'org.ekstep.questionunit.mcq',
                'versions' : ['1.0', '1.1'],
                'patchHandler' : function(result, tuple){
                    result.state.options.forEach((option, index) => {
                        tuple.params.push({ 
                            [index + 1] : instance.generateTelemetryTupleValue(option)
                        });
                    });
                    
                    result.state.options[result.state.val] && tuple.resvalues.push({
                        [result.state.val + 1] : instance.generateTelemetryTupleValue(result.state.options[result.state.val])
                    })
                }
            },
            'MTF' : {
                'id':'org.ekstep.questionunit.mtf',
                'versions' : ['1.0', '1.1'],
                'patchHandler' : function(result, tuple){
                    var lhsParams = [];
                    var rhsParams = [];
                    result.state.rhs_rendered.forEach((rhs, index) => {
                        var lhs = this._plugin._question.data.option.optionsLHS[index];
                        lhsParams.push({
                            [index + 1] : instance.generateTelemetryTupleValue(lhs)
                        })
                        rhsParams.push({
                            [index + 1] : instance.generateTelemetryTupleValue(rhs)
                        })
                    })
                    tuple.params.push({'lhs':lhsParams})
                    tuple.params.push({'rhs':rhsParams})

                    var lhsResvalues = [];
                    var rhsResvalues = [];
                    result.state.val.rhs_rearranged.forEach((rhsIndex, index) => {
                        var lhs = this._plugin._question.data.option.optionsLHS[index];
                        lhsResvalues.push({
                            [index + 1] : instance.generateTelemetryTupleValue(lhs)
                        })

                        rhsResvalues.push({
                            [index+1] : result.state.rhs_rendered.find(rhs => {
                                return rhs.mapIndex == rhsIndex;
                            })
                        })
                    })

                    tuple.resvalues.push({'lhs':lhsResvalues})
                    tuple.resvalues.push({'rhs':rhsResvalues})  
                }
            }   
        }
        // New function over-ride
        QSTelemetryLogger.logAssessEnd = function(result){

            var plugin = {
                'id' : this._plugin._manifest.id,
                'ver': this._plugin._manifest.ver,
            }
            var pluginToPatch; 
            var isPatchRequired = false;
            Object.keys(qsPlugins).forEach((pluginShortHand) => {
                if(plugin.id == qsPlugins[pluginShortHand].id && qsPlugins[pluginShortHand].versions.includes(plugin.ver)){
                    pluginToPatch = pluginShortHand;
                    isPatchRequired = true;
                }
            })

            if(isPatchRequired == false){
                return _super_logAssessEnd.call(QSTelemetryLogger, result);                    
            }

            var tuple = {
                'params' : [],
                'resvalues' : []
            }

            try{
                tuple.params.push({'title' : instance.generateTelemetryTupleValue(this._plugin._question.data.question)});
                qsPlugins[pluginToPatch].patchHandler.call(this, result, tuple);
                var data = instance.generateTelemetryData.call(this, result, tuple);
                TelemetryService.assessEnd(this._assessStart, data);
            } catch (err) {
                console.err(err);
            }
            
        }

    },

    generateTelemetryData : function(result, tuple){
        var quesTitle, quesDesc, quesScore;
        if (this._qData.questionnaire) {
            for (var quesIdentifier in this._qData.questionnaire.items) {
                if (this._qData.questionnaire.items.hasOwnProperty(quesIdentifier)) {
                    quesTitle = this._qData.questionnaire.items[quesIdentifier][0].title;
                    quesDesc = this._qData.questionnaire.items[quesIdentifier][0].description;
                    quesScore = result.pass != 0 ? this._qData.questionnaire.items[quesIdentifier][0].max_score : 0;
                }
            }
        }
        else{
            quesTitle = this._qConfig.metadata.title;
            quesDesc = this._qConfig.metadata.description ? this._qConfig.metadata.description : '';
            quesScore = parseFloat((result.score).toFixed(2));
        }
        var data = {
            pass: result.eval,
            score: quesScore,
            res: tuple.resvalues,
            qindex: this._question.index,
            qtitle: quesTitle,
            params: tuple.params,
            qdesc: quesDesc,
            mc: [],
            mmc: []
        };
        
        return data;
    },
    
    generateTelemetryTupleValue : function(data){
        var extractHTML =  function(element){
            var ele = $.parseHTML(element);
            return $(ele).text();
        };
        //upon stringifying and object if a property value is undefined the property will be deleted and will be stringified
        return JSON.stringify({
            'text' : data.text ? extractHTML(data.text) : undefined,
            'image' : data.image ? data.image : undefined,
            'audio' : data.audio ? data.audio : undefined,
        })
    }
    
}

//# sourceURL=ECMLRenderer.js

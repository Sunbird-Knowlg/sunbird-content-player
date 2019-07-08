/**
 * The theme plugin class renderer themedata. It provides the common functions to all stages.
 * It will invoke all the genie-canvas plugins & custom plugins.
 *
 * @class ThemePlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V.S <vinu.kumar@tarento.com>
 */

var ThemePlugin = Plugin.extend({
    _type: 'theme',
    _render: false,
    update: false,
    baseDir: '',
    loader: undefined,
    _director: false,
    _currentScene: undefined,
    _currentStage: undefined,
    _previousStage: undefined,
    _canvasId: undefined,
    inputs: [],
    htmlElements: [],
    _animationEffect: {
        effect: 'moveOut'
    },
    _themeData: undefined,
    _controllerMap: {},
    _isContainer: false,
    _templateMap: {},
    _contentParams: {},
    _isSceneChanging: false,
    _saveState: true,
    _basePath: undefined,
    initPlugin: function(data) {
        this.addLoaderElement();
        this._controllerMap = {};
        this._canvasId = data.canvasId;
        this._self = new createjs.Stage(data.canvasId);
        this._director = new creatine.Director(this._self);
        this._dimensions = {
            x: 0,
            y: 0,
            w: this._self.canvas.width,
            h: this._self.canvas.height
        }
        createjs.Touch.enable(this._self);
        this._self.enableMouseOver(10);
    this._self.mouseMoveOutside = true;
        this._contentParams = {};
        if (!_.isUndefined(data.saveState)) {
            this._saveState = data.saveState;
        }
        //var ProgressBar = require('/js-libs/progressbar/progressbar.js');
    },
    mousePoint: function() {
        return {
            x: this._self.mouseX,
            y: this._self.mouseY
        };
    },
    updateCanvas: function(w, h) {
        this._self.canvas.width = w;
        this._self.canvas.height = h;
        this._dimensions = {
            x: 0,
            y: 0,
            w: this._self.canvas.width,
            h: this._self.canvas.height
        }
    },
    start: function(basePath) {
        try {
            var instance = this;
            instance._basePath = basePath;
            RecorderManager.init();
            // handle content if startstage io not defined or unavailable
            if (_.isArray(this._data.stage)) {
                var startStage = _.find(this._data.stage, function(stage) {
                    return stage.id == instance._data.startStage
                });
            } else {
                if (this._data.stage.id == instance._data.startStage) {
                    var startStage = this._data.stage.id
                }
            }
            if (_.isUndefined(startStage)) {
                var firstStage = _.find(this._data.stage, function(stage) {
                    if (stage.param && _.isUndefined(firstStage)) return stage
                })
                if (_.isUndefined(firstStage)) {
                    checkStage('showAlert');
                } else {
                    if (_.isUndefined(this._data.startStage)) {
                        console.warn("No start stage is defined, loading first stage");
                    } else {
                        console.warn("Startstage is not available, loading first stage")
                    }
                    this._data.startStage = firstStage.id
                }
            }
            AssetManager.init(this._data, basePath);
            AssetManager.initStage(this._data.startStage, null, null, function() {
                instance.render();
            });
        } catch (e) {
            showToaster('error', 'Content fails to start');
            EkstepRendererAPI.logErrorEvent(e,{'severity':'fatal','type':'content','action':'play'});
            console.warn("Theme start is failed due to", e);
        }
    },
    render: function() {
        var instance = this;
        ControllerManager.reset();
        OverlayManager.reset();
        EkstepRendererAPI.dispatchEvent("renderer:content:reset");
        if (this._data.controller) {
            if (_.isArray(this._data.controller)) {
                this._data.controller.forEach(function(p) {
                    instance.addController(p);
                });
            } else {
                instance.addController(this._data.controller);
            }
        }
        if (this._data.template) {
            if (_.isArray(this._data.template)) {
                this._data.template.forEach(function(t) {
                    instance._templateMap[t.id] = t;
                });
            } else {
                instance._templateMap[this._data.template.id] = this._data.template;
            }
        }
        if (!_.isArray(this._data.stage)) this._data.stage = [this._data.stage];
        if (this._data.stage) {
            this._data.stage.forEach(function(s) {
                instance.initStageControllers(s);
            });
            this.invokeStage(this._data.startStage);
        }
        this.update();
        // Content is started renderering, Dispatching event to show overlay and other
        console.log("ECML RENDERER - Content rendering started");
        EkstepRendererAPI.dispatchEvent("renderer:content:start");
        TelemetryService.navigate(EkstepRendererAPI.getCurrentStageId(), EkstepRendererAPI.getCurrentStageId(), {
            "duration": (Date.now()/1000) - window.PLAYER_STAGE_START_TIME
        })

    },

    /**
     * It will map controller object, This could be useful when plugins can get access to
     * map the controller.
     * @param p {object} controller is object. It should have id, name, type and __cdata.
     * type defines controller type e.g(item, data), name defines controller name, id defines controller identifier
     * @memberof ThemePlugin
     */
    addController: function(p) {
        var controller = ControllerManager.get(p, this.baseDir);
        if (controller) {
            this._controllerMap[p.name] = controller;
        }
    },
    initStageControllers: function(stage) {
        if (stage.controller) {
            if (_.isArray(stage.controller)) {
                stage.controller.forEach(function(p) {
                    ControllerManager.get(p, this.baseDir);
                });
            } else {
                ControllerManager.get(stage.controller, this.baseDir);
            }
        }
    },
    reRender: function() {
        //Resetting controller index to show all assesment on replay
        var controller;
        for (k in this._controllerMap) {
        	controller = this._controllerMap[k];
            controller.reset();
        }
        this._contentParams = {};
        this._self.clear();
        this._self.removeAllChildren();
        this.render();
    },
    update: function() {
        this._self.update();
    },
    tick: function() {
        this._self.tick();
    },
    restart: function() {
        var gameId = TelemetryService.getGameId();
        var version = TelemetryService.getGameVer();
        var instance = this;
        var telemetryEndData = {};
        telemetryEndData.stageid = getCurrentStageId();
        telemetryEndData.progress = logContentProgress();
        TelemetryService.end(telemetryEndData);
        AssetManager.initStage(this._data.startStage, null, null, function() {
            if (gameId && version) {
                TelemetryService.start(gameId, version);
            }
            instance.render();
        });
    },
    getAsset: function(aid) {
        return AssetManager.getAsset(this._currentStage, aid);
    },

    /**
     * Returns the asset/media object of Image, Audio, video etc from ecml.. which is defined in the manifest of the given assetId
     * @param assetId {string} assetId of the desired asset/media defined in manifest
     * @memberof ThemePlugin
     **/
    getMedia: function(aid) {
        return _.find(this._data.manifest.media, function(item) {
            return item.id == aid;
        });
    },
    addChild: function(child, childPlugin) {
        var instance = this;
        child.on('sceneenter', function() {
            instance.enableInputs();
            instance._isSceneChanging = false;
            instance.preloadStages();
            childPlugin.uncache();
            // remove above scene Enter method call and dispatch an scene Enter event.
            OverlayManager.init();
            Renderer.update = true;
        });
        var nextIdx = this._currIndex++;
        if (this._currentScene) {
            this._currentScene.dispatchEvent('exit');
            this._currentScene = childPlugin;
            this._director.replace(child, this.getTransitionEffect(this._animationEffect));
        } else {
            this._currentScene = childPlugin;
            this._director.replace(child);
        }
        document.fonts.ready.then(function () {
            Renderer.update = true;
        });
        childPlugin.setIndex(nextIdx);
    },
    replaceStage: function(stageId, effect) {
        AudioManager.stopAll();
        RecorderManager.stopRecording();
        this.disableInputs();
        this.inputs = [];
        this.removeHtmlElements();
        this.htmlElements = [];
        this._animationEffect = effect;
        TimerManager.destroy();
        if (!_.isUndefined(this._currentScene)) {
            EventBus.removeEventListener(this._currentScene._id + '_assetsLoaded', this._currentScene.invokeRenderElements, this);
        }
        (stageId) ? this.invokeStage(stageId): OverlayManager.moveToEndPage();
    },
    invokeStage: function(stageId) {
        var stage = _.clone(_.findWhere(this._data.stage, {
            id: stageId
        }));
        if (stage && stage.extends) {
            baseStage = _.findWhere(this._data.stage, {
                id: stage.extends
            });
            stage = this.mergeStages(stage, baseStage);
        }
        this._previousStage = this._currentStage;
        this._currentStage = stageId;

        PluginManager.invoke('stage', stage, this, null, this);

        // Trigger onstagechange event, which is bind by parent window
        // if (isbrowserpreview && window && window.parent) {
        //     /*var parentBody = window.parent.document.getElementsByTagName('body');*/
        //     var retObj = {
        //         "stageId": stageId
        //     };
        //     // window.parent.jQuery('body').trigger('onstagechange', retObj);
        //     //var iFrameObj = document.getElementsByTagName("iframe")[0].contentWindow;
        //     window.parent.postMessage(retObj, "*");

        //     var custEvent = new Event('onstagechange');
        //     //window.parent.document.dispatchEvent(custEvent, retObj);

        //     window.dispatchEvent(custEvent, retObj);
        // }
    },
    preloadStages: function() {
        var stagesToLoad = this.getStagesToPreLoad(this._currentScene._data);
        var instance = this;
        // removed "enter" event dispatch function from addchild "sceneenter" event & adding as a callback here
        // (waiting for asset to load completely then "enter event is trigurred")
        AssetManager.initStage(stagesToLoad.stage, stagesToLoad.next, stagesToLoad.prev, function() {
            instance._currentScene.dispatchEvent('enter');
        });
    },

    /**
     * Merge two stages into single stage.
     * @param stage1 {object} Stage1 data to be merged with another stage.
     * @param stage2 {object} Stage2 data to be merged with another stage.
     * @memberof ThemePlugin
     **/
    mergeStages: function(stage1, stage2) {
        for (k in stage2) {
            if (k === 'id') continue;
            var attr = stage2[k];
            if (stage1[k]) {
                if (!_.isArray(stage1[k])) {
                    stage1[k] = [stage1[k]];
                }
                if (_.isArray(attr)) {
                    stage1[k].push.apply(stage1[k], attr);
                } else {
                    stage1[k].push(attr);
                }
            } else {
                stage1[k] = attr;
            }
        }
        return stage1;
    },
    isStageChanging: function() {
        return this._isSceneChanging;
    },
    transitionTo: function(action) {
        // not next and previoud are clicked at the same time,
        // handle only one actions(next/previous)
        if (this._isSceneChanging) {
            return;
        }
        var stage = this._currentScene;
        // In transistion save Currentstate to themeObj
        this.setParam(stage.getStagestateKey(), stage._currentState);
        RecorderManager.stopRecording();
        AudioManager.stopAll();
        TimerManager.stopAll(this._currentStage);
        if (!action.transitionType) action.transitionType = action.param;
        if (action.transitionType === 'skip') {
            this.jumpToStage(action);
        } else {
            this._isSceneChanging = true;
            if(action.transitionType === 'previous') {
                if (stage._stageController && stage._stageController.hasPrevious()) {
                    stage._stageController.decrIndex(2);
                    this.replaceStage(stage._data.id, action);
                } else {
                    if (stage._stageController) {
                        stage._stageController.setIndex(-1);
                        if (action.reset == true) {
                            stage._stageController.reset();
                        }
                    }
                    this.replaceStage(action.value, action);
                }
            } else if (action.transitionType === 'next' && stage._stageController && stage._stageController.hasNext()) {
                this.replaceStage(stage._data.id, action);
            } else {
                this.jumpToStage(action);
            }
        }
        // set the Plugin data to theme level from the stagePlugin.
    },
    
    /*
     * Checks reset status of the controller
     * Replaces stage with given stage id
    */
    jumpToStage: function(action) {
        if (stage._stageController && action.reset) {
            stage._stageController.reset();
        }
        this.replaceStage(action.value, action);
    },

    /**
     * Removes current stage HTML elements. This could be useful when plugins work across stages
     * Using this, a plugin can get access to remove the current stage HTML element such video html element etc.,
     * @memberof ThemePlugin
     */
    removeHtmlElements: function() {
        var gameAreaEle = jQuery('#' + Renderer.divIds.gameArea);
        var chilElemtns = gameAreaEle.children();
        jQuery(chilElemtns).each(function() {
            if ((this.id !== "overlay") && (this.id !== "gameCanvas")) {
                jQuery(this).remove();
            }
        });
    },
    disableInputs: function() {
        //This is to remove all div's added inside 'GameArea' div which are positioned at absolute position
        this.inputs.forEach(function(inputId) {
            var element = document.getElementById(inputId);
            if (!_.isNull(element)) {
                element.style.display = 'none';
            }
        })
    },
    enableInputs: function() {
        this.inputs.forEach(function(inputId) {
            var element = document.getElementById(inputId);
            if (!_.isNull(element)) {
                element.style.display = 'block';
            }
        })
    },
    getTransitionEffect: function(animation) {
        var d = this.getDirection(animation.direction),
            e = this.getEase(animation.ease),
            t = animation.duration;
        animation.effect = animation.effect || 'scroll';
        var effect;
        switch (animation.effect.toUpperCase()) {
            case "SCALEIN":
                effect = new creatine.transitions.ScaleIn(e, t);
                break;
            case "SCALEOUT":
                effect = new creatine.transitions.ScaleOut(e, t);
                break;
            case "SCALEINOUT":
                effect = new creatine.transitions.ScaleInOut(e, t);
                break;
            case "MOVEIN":
                effect = new creatine.transitions.MoveIn(d, e, t);
                break;
            case "SCROLL":
                effect = new creatine.transitions.Scroll(d, e, t);
                break;
            case "FADEIN":
                effect = new creatine.transitions.FadeIn(e, t);
                break;
            case "FADEOUT":
                effect = new creatine.transitions.FadeOut(e, t);
                break;
            case "FADEINOUT":
                effect = new creatine.transitions.FadeInOut(e, t);
                break;
            default:
                effect = new creatine.transitions.MoveOut(d, e, t);
        }
        return effect;
    },
    getDirection: function(d) {
        if (d === undefined) {
            return d;
        }
        return eval('creatine.' + d.toUpperCase())
    },
    getEase: function(e) {
        if (e === undefined) {
            return e;
        }
        return eval('createjs.Ease.' + e);
    },
    getStagesToPreLoad: function(stageData) {
        var params = stageData.param;
        if (!params) params = [];
        if (!_.isArray(params)) params = [params];
        var next = _.findWhere(params, {
                name: 'next'
            }),
            prev = _.findWhere(params, {
                name: 'previous'
            });
        var nextStageId = undefined,
            prevStageId = undefined;
        if (next) nextStageId = next.value;
        if (prev) prevStageId = prev.value;
        return {
            stage: stageData.id,
            next: nextStageId,
            prev: prevStageId
        };
    },
    cleanUp: function() {
        createjs.Touch.disable(this._self);
    },
    pause: function() {
        if (this._currentStage) {
            AssetManager.stopStageAudio(this._currentStage);
        }
        // TelemetryService.interrupt("BACKGROUND", this._currentStage);
    },
    resume: function() {
        // TelemetryService.interrupt("RESUME", this._currentStage);
    },

    /**
     * set the param to scope level.
     * @param scope {string} name of the scope (e.g. stage, theme, app)
     * @paramName {string} name to param to set.
     * @paramName {object} value of the param.
     * @memberof ThemePlugin
     */
    setParam: function(param, value, incr, max) {
        var instance = this;
        var fval = instance._contentParams[param];
        if (incr) {
            if ("undefined" == typeof fval) fval = 0;
            fval = (fval + incr);
        } else {
            fval = value
        }
        if (0 > fval) fval = 0;
        if ("undefined" != typeof max && fval >= max) fval = 0;
        instance._contentParams[param] = fval;
    },

    /**
     * return the param data
     * @paramName {string} name to param to set.
     * @memberof ThemePlugin
     */
    getParam: function(param) {
        var instance = this;
        var params;
        if (instance._saveState) {
            // if param has a "-" keyword then eval fails
            return instance._contentParams[param]
        } else {
            var params = instance._contentParams;
            var expr = 'params.' + param;
            return eval(expr);
        }

    },
    addLoaderElement: function() {
        var gameArea = document.getElementById(Renderer.divIds.gameArea);
        var loaderArea = document.createElement('div'); 
        loaderArea.id = 'loaderArea';
        var element = '<div class="loader-popup"><div class="preloader-wrapper-area"></div><div class="preloader-wrapper-area-text">Please Wait.. We are getting things ready for you</div></div>';
        // var element = '<div class="preloader-wrapper"><div class="spinner-layer"><div class="circle-clipper left"><div class="circle"></div></div>' +
        //     '<div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>'
            loaderArea.innerHTML = element;    
        gameArea.parentElement.appendChild(loaderArea);   
    },

    /**
     * Returns stageData for particular stage identifier.
     * undefined if the stage data is not present for the particular stage identfier.
     * this could be usefull when plugin wants to fetch some paticular stage data.
     * @param stageId {string} name of the identifier.
     * @memberof ThemePlugin
     */
    getStageDataById: function(stageId) {
        var stageData = undefined;
        this._data.stage.forEach(function(element, index) {
            if (element.id === stageId) {
                stageData = element;
            }
        });
        return stageData;
    },

    /**
     * Remove all create js element from canvas
     * @memberof ThemePlugin
     */
     clearStage: function() {
        this._self.clear();
     }
});
PluginManager.registerPlugin('theme', ThemePlugin);

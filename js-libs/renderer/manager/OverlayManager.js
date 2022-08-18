OverlayManager = {
    _constants: {
        overlayNext: "overlayNext",
        overlayPrevious: "overlayPrevious",
        overlaySubmit: "overlaySubmit",
        overlayMenu: "overlayMenu",
        overlayReload: "overlayReload",
        overlayGoodJob: "overlayGoodJob",
        overlayTryAgain: "overlayTryAgain"
    },
    _eventsArray: [],
    _reloadInProgress: false,
    _contentConfig: {},
    _stageConfig: {},
    init: function() {
        this.clean();
        this._reloadInProgress = false;
        this._eventsArray = [this._constants.overlayNext,
            this._constants.overlayPrevious,
            this._constants.overlaySubmit,
            this._constants.overlayMenu,
            this._constants.overlayReload,
            this._constants.overlayGoodJob,
            this._constants.overlayTryAgain
        ];

        this.setContentConfig();
        EventBus.addEventListener("actionNavigateSkip", this.skipAndNavigateNext, this);
        EventBus.addEventListener("actionNavigateNext", this.navigateNext, this);
        EventBus.addEventListener("actionNavigatePrevious", this.navigatePrevious, this);
        EventBus.addEventListener("actionDefaultSubmit", this.defaultSubmit, this);
        EventBus.addEventListener("actionReload", this.actionReload, this);
        if (_.isUndefined(EventBus.listeners.actionReplay) || (_.isArray(EventBus.listeners.actionReplay) && EventBus.listeners.actionReplay.length == 0))
            EventBus.addEventListener("actionReplay", this.actionReplay, this);
    },
    setStageData: function() {
        if (!_.isUndefined(Renderer.theme)) {
            EventBus.dispatch("sceneEnter", Renderer.theme._currentScene);
        }
    },
    setContentConfig: function() {
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var eventName = this._eventsArray[i];
            var val;
            if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene)) {
                val = Renderer.theme.getParam(eventName);
            }
            if (!_.isUndefined(val)) {
                this._contentConfig[eventName] = val;
            }
        }
        // Get stage config data and override contetn config
        this.setStageConfig();
    },
    setStageConfig: function() {
        //Clone content config to stage and then override with stage config
        this._stageConfig = _.clone(this._contentConfig);
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var eventName = this._eventsArray[i];
            var val;
            if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene)) {
                val = Renderer.theme._currentScene.getParam(eventName);
            }
            if (_.isUndefined(val)) {
                if (!_.isUndefined(this._contentConfig[eventName])) val = this._contentConfig[eventName];
            }
            if (!_.isUndefined(val)) this._stageConfig[eventName] = val;
        }

        this.setStageData();
        this.handleNext();
        this.handlePrevious();
        this.handleSubmit();
    },
    handleNext: function() {
        var eventName = this._constants.overlayNext;
        var val = this._stageConfig[eventName];
        EventBus.dispatch(eventName, val);
        this.handleEcmlElements(eventName, val);
    },
    handlePrevious: function() {
        if (_.isUndefined(Renderer.theme._currentScene)) return;
        var eventName = this._constants.overlayPrevious;
        var val = this._stageConfig[eventName];
        var navigateToStage = this.getNavigateTo('previous');
        // Have to remove this if condition when ecml nav is supported by plugins;
        if (val == "on") {
            if (_.isUndefined(navigateToStage)) {
                val = "disable";
                if (Renderer.theme._currentScene.isItemScene() && Renderer.theme._currentScene._stageController.hasPrevious()) {
                    val = "enable"
                }
            } else {
                val = "enable"
            }
        }
        EventBus.dispatch(eventName, val);
        this.handleEcmlElements(eventName, val);
    },
    handleSubmit: function() {
        var eventName = this._constants.overlaySubmit;
        var val = this._stageConfig[eventName];
        if(!_.isUndefined(Renderer.theme) && _.isUndefined(Renderer.theme.getParam(eventName)) && _.isUndefined(Renderer.theme._currentScene.getParam(eventName))) {
            var globalConfig = EkstepRendererAPI.getGlobalConfig();
            val = globalConfig.overlay.showSubmit ? "on" : "off";
        }
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene) && Renderer.theme._currentScene.isItemScene()) {
            if (val == "on") {
                var enableEval = Renderer.theme._currentScene.isReadyToEvaluate();
                val = (enableEval === true) ? "enable" : "disable";
            }
            EventBus.dispatch(eventName, val);
            this.handleEcmlElements(eventName, val);
        } else {
            //This is for normal stage
            EventBus.dispatch(eventName, 'off');
        }
    },
    showFeeback: function(showOverlayGoodJob) {
        var returnVal = true;
        if (showOverlayGoodJob) {
            returnVal = this._stageConfig.overlayGoodJob == 'off' ? false : true;
            this.showGoodJobFb(returnVal);
        } else {
            returnVal = this._stageConfig.overlayTryAgain == 'off' ? false : true;
            this.showTryAgainFb(returnVal);
        }

        return returnVal;
    },
    showGoodJobFb: function(value) {
        if (value == true) {
            AudioManager.play({
                stageId: Renderer.theme._currentStage,
                asset: "goodjob_sound"
            });
            EventBus.dispatch(this._constants.overlayGoodJob, 'on');
        } else {
            EventBus.dispatch(this._constants.overlayGoodJob, 'off');
        }
    },
    showTryAgainFb: function(value) {
        if (value == true) {
            AudioManager.play({
                stageId: Renderer.theme._currentStage,
                asset: "tryagain_sound"
            });
            EventBus.dispatch(this._constants.overlayTryAgain, 'on')
        } else {
            EventBus.dispatch(this._constants.overlayTryAgain, 'off');
        }
    },
    navigateNext: function() {
     try{
        if ((_.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene))) return;
        this.logNavigationTelInteract("next");
        var isItemScene = Renderer.theme._currentScene.isItemScene();
        if (isItemScene) {
            this.defaultSubmit();
            return;
        }       
        
        this.skipAndNavigateNext({"target": "next"});
      }catch(e){
        showToaster('error','Current scene having some issue');
        EkstepRendererAPI.logErrorEvent(e, {'severity':'fatal','type':'content','action':'transitionTo'});
        console.warn("Fails to navigate to next due to",e);
      }
    },
    skipAndNavigateNext: function(param) {
      try{
        var actionType = (param) ? param.target : "skip";
        this.clean();
        var navigateTo = this.getNavigateTo("next");
        if ("undefined" == typeof navigateTo) {
            if (_.isUndefined(Renderer.theme._currentScene)) return;
            var isItemScene = Renderer.theme._currentScene.isItemScene();
            if (isItemScene && !_.isUndefined(Renderer.theme._currentScene._stageController) && Renderer.theme._currentScene._stageController.hasNext()) {
                this.defaultNavigation(actionType, navigateTo);
            } else {
                this.moveToEndPage();
            }
        } else {
            this.defaultNavigation(actionType, navigateTo);
        }
      }catch(e){
        showToaster('error','Current scene having some issue');
        EkstepRendererAPI.logErrorEvent(e, {'severity':'fatal','type':'content','action':'transitionTo'});
        console.warn("Fails to skip and navigate due to",e);
      }
    },
    moveToEndPage: function() {
        console.info("redirecting to endpage.");
        Renderer.theme._currentStage = undefined;
        EkstepRendererAPI.dispatchEvent('renderer:content:end');
        EkstepRendererAPI.dispatchEvent('renderer:telemetry:end');
        var stage = Renderer.theme._currentScene;
        Renderer.theme.setParam(stage.getStagestateKey(), stage._currentState);
        EkstepRendererAPI.removeHtmlElements();
        AudioManager.stopAll();
    },
    clean: function() {
        EventBus.removeEventListener("actionNavigateSkip", this.skipAndNavigateNext, this);
        EventBus.removeEventListener("actionNavigateNext", this.navigateNext, this);
        EventBus.removeEventListener("actionNavigatePrevious", this.navigatePrevious, this);
        EventBus.removeEventListener("actionDefaultSubmit", this.defaultSubmit, this);
    },
    reset: function() {
        // Remove all configuarations & Events
        this.clean();
        this._contentConfig = {};
        this._stageConfig = {};
    },
    navigatePrevious: function() {
      try{
        if ((_.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene))) return;
        var navigateToStage = this.getNavigateTo('previous');
        this.logNavigationTelInteract("previous");
        if (_.isUndefined(navigateToStage)) {
            if (!(Renderer.theme._currentScene.isItemScene() && Renderer.theme._currentScene._stageController.hasPrevious())) {
                var rendererData = EkstepRendererAPI.getContentData(), currentStage = getCurrentStageId();
                if (rendererData.startStage === currentStage) contentExitCall();
                return;
            }
        }       
        var navigateTo = this.getNavigateTo("previous");
        if (_.isUndefined(Renderer.theme._currentScene)) return;
        this.defaultNavigation("previous", navigateTo);
      }catch(e){
        EkstepRendererAPI.logErrorEvent(e, {'severity':'fatal','type':'content','action':'transitionTo'});
        showToaster('error','Stage having some issue');
        console.warn("Fails to navigate to previous due to",e);
      }
    },
    logNavigationTelInteract: function(navType){
        if(!Renderer.theme._currentScene) return;

        var data = {
            stageId: Renderer.theme._currentScene.id
        };
        var navToStageId;
        if(!_.isUndefined(Renderer.theme._currentScene.params) && Renderer.theme._currentScene.params[navType]){
            navToStageId = Renderer.theme._currentScene.params[navType];
        }

        if(navToStageId){
            var stageLoader = AssetManager.strategy.loaders[navToStageId]
            var perLoaded = stageLoader ? Math.round((stageLoader.progress * 100)) : "100";   
            data.extra = {
                stageProgress: {
                    "id": navToStageId,
                    "progress": perLoaded > 100 ? '100%' : perLoaded + '%'
                }
            }            
        } else {
            data.extra = {
                stageProgress: {
                    "id": navType == 'next' ? 'ContentApp-EndScreen' : 'blank',
                    "progress": '100%'
                }
            }
        }
        TelemetryService.interact("TOUCH", navType, "TOUCH", data);
        window.PLAYER_STAGE_START_TIME = Date.now()/1000;
    },
    showOrHideEcmlElement: function(id, showEle) {
        var plugin = PluginManager.getPluginObject(id);
        if (plugin) {
            showEle == "off" ? plugin.show() : plugin.hide();
        }
    },
    handleEcmlElements: function(eventName, val) {
        //Switch case to handle ECML elements(Next, Previous, Submit, etc..)
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene)) {
            var stage_data = Renderer.theme.getStagesToPreLoad(Renderer.theme._currentScene._data);
            var nextStageId = stage_data.next;
            var prevStageId = stage_data.prev;
        }
        switch (eventName) {
            case "overlayNext":
                this.showOrHideEcmlElement('next', val);
                this.showOrHideEcmlElement('nextContainer', val);
                break;
            case "overlayPrevious":
                this.showOrHideEcmlElement('previous', val);
                this.showOrHideEcmlElement('previousContainer', val);
                break;
            case "overlaySubmit":
                this.showOrHideEcmlElement('validate', val);
                break;
            case "overlayMenu":
                break;
            case "overlayReload":
                break;
            case "overlayGoodJob":
                // this.showOrHideEcmlElement('goodjobBg', val);
                break;
            case "overlayTryAGain":
                // this.showOrHideEcmlElement('retryBg', val);
                break;
            default:
                console.log("Default case got called..");
                break;
        }
    },
    getNavigateTo: function(navType) {
        var stageParams = [];
        var stageId = undefined;
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
            stageParams = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var navParam = _.findWhere(stageParams, {
                name: navType
            });
            if (navParam) stageId = navParam.value;
        }
        return stageId;
    },
    defaultSubmit: function() {
        //If any one option is selected, then only allow user to submit
        var action = {
            "type": "command",
            "command": "eval",
            "asset": Renderer.theme._currentStage,
            "pluginId": Renderer.theme._currentStage
        };
        action.success = "correct_answer";
        action.failure = "wrong_answer";
        CommandManager.handle(action);
    },
    defaultNavigation: function(navType, navigateTo) {
        var action = {
            "asset": Renderer.theme._id,
            "command": "transitionTo",
            "duration": "100",
            "ease": "linear",
            "effect": "fadeIn",
            "type": "command",
            "pluginId": Renderer.theme._id,
            "value": navigateTo
        };
        navType = (navType === "skip") ? "next" : navType;
        action.transitionType = navType;
        window.PLAYER_STAGE_START_TIME = Date.now()/1000;
        CommandManager.handle(action);
    },

    // Stage reload
    actionReload: function() {
        if (this._reloadInProgress) {
            // continuous reload clicks was handling the stage
            // this is to avoid stage crash
            return;
        }
        var currentStage = Renderer.theme._currentStage,
            plugin;
        this._reloadInProgress = true;
        setTimeout(function() {
            plugin = PluginManager.getPluginObject(currentStage);
            if (plugin) plugin.reload({
                type: "command",
                command: "reload",
                duration: "100",
                ease: "linear",
                effect: "fadeIn",
                asset: currentStage
            });
        }, 500);
        TelemetryService.interact("TOUCH", "gc_reload", "TOUCH", {
            stageId: currentStage
        });
    },

    // Content replay
    actionReplay: function(data) {
        // var telemetryEndData = {};
        // telemetryEndData.stageid = getCurrentStageId();
        // telemetryEndData.progress = logContentProgress();
        // TelemetryService.end(telemetryEndData);
        var version = TelemetryService.getGameVer();
        if (GlobalContext.currentContentId && version) {
            startTelemetry(GlobalContext.currentContentId, version);
        }
        EkstepRendererAPI.removeHtmlElements();
        Renderer.theme.reRender();
    }
}

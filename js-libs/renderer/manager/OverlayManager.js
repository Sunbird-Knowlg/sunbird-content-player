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
    _contentConfig: {},
    _stageConfig: {},
    submitOnNextClick: true,
    init: function() {
        this._eventsArray = [this._constants.overlayNext, 
                    this._constants.overlayPrevious, 
                    this._constants.overlaySubmit, 
                    this._constants.overlayMenu, 
                    this._constants.overlayReload, 
                    this._constants.overlayGoodJob, 
                    this._constants.overlayTryAgain
                    ]
        this.setContentConfig();
        EventBus.addEventListener("navigate", this.navigateFunc, this);
        EventBus.addEventListener("evalAndSubmit", this.evalAndSubmitFunc, this);
    },
    setContentConfig: function(){
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var eventName = this._eventsArray[i];
            var val = Renderer.theme.getParam(eventName);
            if (!_.isUndefined(val)) {
               this._contentConfig[eventName] = val; 
            }
        }

        // Get stage config data and override contetn config
        this.setStageConfig();
    },
    setStageConfig: function(){
        //Clone content config to stage and then override with stage config
        this._stageConfig = _.clone(this._contentConfig);
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var eventName = this._eventsArray[i];
            var val = Renderer.theme._currentScene.getParam(eventName);
            if (_.isUndefined(val)) {
                if((eventName == this._constants.overlayGoodJob) ||
                    (eventName == this._constants.overlayTryAgain)) {
                        val = "off";
                    } else {
                        var contentConfigVal = this._contentConfig[eventName];
                        val = _.isUndefined(contentConfigVal) ? "on" : contentConfigVal;
                    }                
            }
            EventBus.dispatch(eventName, val);
            this.handleEcmlElements(eventName, val);
        }
    },
    navigateFunc: function (data) {
      navType = data.target;
      this.navigate(navType);
    },
    evalAndSubmitFunc: function () {
      this.evalAndSubmit();
    },
		showOrHideElement: function(id, showEle) {
			var plugin = PluginManager.getPluginObject(id);
			if (plugin) {
					showEle == "off"? plugin.show():  plugin.hide();
			}
		},
    handleEcmlElements: function(eventName, val) {
        //Switch case to handle ECML elements(Next, Previous, Submit, etc..)
        var stage_data = Renderer.theme.getStagesToPreLoad(Renderer.theme._currentScene._data);
				var nextStageId = stage_data.next;
				var prevStageId = stage_data.prev;
            // instance.loadStage(nextStageId, function() {
							switch ( eventName ) {
								case "overlayNext":
								this.showOrHideElement('next', val);
								this.showOrHideElement('nextContainer', val);
								break;
								case "overlayPrevious":
								this.showOrHideElement('previous', val);
								this.showOrHideElement('previousContainer', val);
								break;
								case "overlaySubmit":
								this.showOrHideElement('validate', val);
								break;
								case "overlayMenu":
								break;
								case "overlayReload":
								break;
								case "overlayGoodJob":
								this.showOrHideElement('goodjobBg', val);
								break;
								case "overlayTryAgain":
								this.showOrHideElement('retryBg', val);
								break;
								default:
								console.log("Default case got called..");
								break;
							}
    },


    getNavigateTo: function (navType) {
        var stageParams = [];
        var stageId = undefined;
        if (!_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
            stageParams = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var navParam = _.findWhere(stageParams, {
                name: navType
            });
            if (navParam) stageId = navParam.value;
        }
        return stageId;
    },
    navigate: function (navType) {
        TelemetryService.interact("TOUCH", navType, null, {stageId : Renderer.theme._currentStage});
        var navigateTo = this.getNavigateTo(navType);

        if(_.isUndefined( Renderer.theme._currentScene)) {
            return;
        }

        if(this.submitOnNextClick && Overlay.isItemScene() && ("next" == navType)){
            this.evalAndSubmit();
            return;
        }

        this.submitOnNextClick = true;
        var changeScene = function() {
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
            action.transitionType = navType;
            // Renderer.theme.transitionTo(action);
            CommandManager.handle(action);
        };
        if ("undefined" == typeof navigateTo && "next" == navType) {
            if (Overlay.isItemScene() && Renderer.theme._currentScene._stageController.hasNext()) {
                changeScene();
            } else {
                if(config.showEndPage) {
                    console.info("redirecting to endpage.");
                     // while redirecting to end page
                     // set the last stage data to _contentParams[themeObj]
                    var stage = Renderer.theme._currentScene;
                    Renderer.theme.setParam(stage.getStagestateKey(),stage._currentState);

                    window.location.hash = "/content/end/" + GlobalContext.currentContentId;
                    AudioManager.stopAll();
                } else {
                    console.warn("Cannot move to end page of the content. please check the configurations..");
                }
            }
        } else {
            changeScene();
        }
    },
    evalAndSubmit: function () {
        //If any one option is selected, then only allow user to submit
        var action = {
            "type": "command",
            "command": "eval",
            "asset": Renderer.theme._currentStage,
            "pluginId": Renderer.theme._currentStage
        };
        //action.htmlEval = "true";
        action.success = "correct_answer";
        action.failure = "wrong_answer";
        CommandManager.handle(action);
    }

    // addEventListener: function(evtName, callback, scope) {
    //       EventBus.addEventListener(evtName, callback, scope);
    //   },
    //   dispatch: function(evtName, target, data) {
    //       EventBus.dispatch(evtName, target, data);
    //   },
    //   removeEventListener: function(evtName, callback, scope) {
    //       EventBus.removeEventListener(evtName, callback, scope)
    //   },
    //   hasEventListener: function(evtName, callback, scope) {
    //       EventBus.hasEventListener(type, callback, scope)
    //   },
    //   getEvents: function() {
    //       //return EventBus.getEvents();
    //   }

}

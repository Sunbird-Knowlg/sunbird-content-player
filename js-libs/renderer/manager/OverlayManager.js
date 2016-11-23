OverlayManager = {
    overlayEvents: ["overlayNext", "overlayPrevious", "overlaySubmit", "overlayMenu", "overlayReload"],
    submitOnNextClick: true,
    init: function() {
        var evtLenth = this.overlayEvents.length;
        for (i = 0; i < evtLenth; i++) {
            var eventName = this.overlayEvents[i];
            var val = Renderer.theme._currentScene.getParam(eventName);
            if (_.isUndefined(val)) {
                val = "on";
            }
            EventBus.dispatch(eventName, val);
            this.handleEcmlElements(eventName, val);
        }

        EventBus.addEventListener("navigate", this.navigateFunc, this);
        EventBus.addEventListener("evalAndSubmit", this.evalAndSubmitFunc, this);

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
								case "overlayTryAGain":
								this.showOrHideElement('retryBg', val);
								break;
								default:
								console.log("Default case got called..");
								break;
							}
    },


    getNavigateTo: function (navType) {
        var navigation = [];
        var navigateTo = undefined;
        if (!_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
            navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var direction = _.findWhere(navigation, {
                name: navType
            });
            if (direction) navigateTo = direction.value;
        }
        return navigateTo;
    },
    navigate: function (navType) {
        TelemetryService.interact("TOUCH", navType, null, {stageId : Renderer.theme._currentStage});
        var navigateTo = this.getNavigateTo(navType);

        if(_.isUndefined( Renderer.theme._currentScene)){
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
        action.htmlEval = "true";
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

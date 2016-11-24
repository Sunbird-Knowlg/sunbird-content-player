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
    init: function() {
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
    },
    setContentConfig: function() {
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
                var contentConfigVal = this._contentConfig[eventName];
                val = _.isUndefined(contentConfigVal) ? "on" : contentConfigVal;
            }
            this._stageConfig[eventName] = val;

            // if((eventName != this._constants.overlayGoodJob) &&
            //     (eventName != this._constants.overlayTryAgain)) {
            //       EventBus.dispatch(eventName, val);
            //       this.handleEcmlElements(eventName, val);
            // }
        }

        this.showNext();
        this.showPrevious();
        this.showSubmit();
    },
    showNext: function(){
      var eventName = this._constants.overlayNext;
      var val = this._stageConfig[eventName];
      EventBus.dispatch(eventName, val);
      this.handleEcmlElements(eventName, val);
    },
    showPrevious:function(){
      var eventName = this._constants.overlayPrevious;
      var val = this._stageConfig[eventName];
      EventBus.dispatch(eventName, val);
      this.handleEcmlElements(eventName, val);
    },
    showSubmit: function(){
      var eventName = this._constants.overlaySubmit;
      var val = this._stageConfig[eventName];
      if(Renderer.theme._currentScene.isItemScene()){
        EventBus.dispatch(eventName, val);
        this.handleEcmlElements(eventName, val);
      }else{
        //This is for normal stage
        EventBus.dispatch(eventName, 'off');
      }
    },
    showFeeback: function(showOverlayGoodJob){
      var returnVal = true;
      if(showOverlayGoodJob){
        returnVal = this._stageConfig.overlayGoodJob == 'on' ? true : false;
        this.showGoodJobFb(returnVal);
      } else {
        returnVal = this._stageConfig.overlayTryAgain == 'on' ? true : false;
        this.showTryAgainFb(returnVal);
      }

      return returnVal;
    },
    showGoodJobFb: function(value){
      if(value == true ){
        AudioManager.play({asset: "goodjob_sound"});
        EventBus.dispatch(this._constants.overlayGoodJob, 'on');
      } else {
        EventBus.dispatch(this._constants.overlayGoodJob, 'off');
      }
    },
    showTryAgainFb: function(value){
      if(value == true){
        AudioManager.play({asset: "tryagain_sound"});
        EventBus.dispatch(this._constants.overlayTryAgain, 'on')
      } else {
        EventBus.dispatch(this._constants.overlayTryAgain, 'off');
      }
    },
    navigateNext: function () {
      var navigateTo = this.getNavigateTo("next");
      if(_.isUndefined( Renderer.theme._currentScene)) return;

      var isItemScene = Renderer.theme._currentScene.isItemScene();
      if(isItemScene) {
          TelemetryService.interact("TOUCH", "next", null, {stageId : Renderer.theme._currentStage});
          this.defaultSubmit();
          return;
      }
      this.skipAndNavigateNext();
    },
    skipAndNavigateNext: function(){
      this.clean();
      TelemetryService.interact("TOUCH", "next", null, {stageId : Renderer.theme._currentStage});
      var navigateTo = this.getNavigateTo("next");
      if ("undefined" == typeof navigateTo) {
          var isItemScene = Renderer.theme._currentScene.isItemScene();
          if (isItemScene && Renderer.theme._currentScene._stageController.hasNext()) {
              this.defaultNavigation("next", navigateTo);
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
          this.defaultNavigation("next", navigateTo);
      }
    },
    clean: function(){
      EventBus.removeEventListener("actionNavigateSkip", this.skipAndNavigateNext, this);
      EventBus.removeEventListener("actionNavigateNext", this.navigateNext, this);
      EventBus.removeEventListener("actionNavigatePrevious", this.navigatePrevious, this);
      EventBus.removeEventListener("actionDefaultSubmit", this.defaultSubmit, this);
    },
    navigatePrevious: function () {
      TelemetryService.interact("TOUCH", "previous", null, {stageId : Renderer.theme._currentStage});
      var navigateTo = this.getNavigateTo("previous");
      if(_.isUndefined( Renderer.theme._currentScene)) return;
      this.defaultNavigation("previous", navigateTo);
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
  					// this.showOrHideElement('goodjobBg', val);
  					break;
  					case "overlayTryAGain":
  					// this.showOrHideElement('retryBg', val);
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
    defaultSubmit: function () {
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
    },
    defaultNavigation: function (navType, navigateTo) {
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

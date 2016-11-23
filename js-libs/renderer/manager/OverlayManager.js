OverlayManager = {
    overlayEvents: ["overlayNext", "overlayPrevious", "overlaySubmit", "overlayMenu", "overlayReload"],
    init: function() {

        // for (i = 0; i < this._events.length; i++) {
        // 	var value = Renderer.theme._currentScene.getParam(this._events[i]);
        // 		EventBus.dispatch(this._events[i], value);
        // 		if (value === "off") defaultValue = true;
        // }
        // if (defaultValue === true) {
        // 	EventBus.dispatch("show_elements", defaultValue);
        // }

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

    },
		showOrHideElement: function(id, showEle){
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

    function getNavigateTo(navType) {
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
    }

    
}

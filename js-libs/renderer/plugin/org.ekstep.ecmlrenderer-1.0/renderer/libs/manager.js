AnimationManager = {
    animationsCache: {},
    pluginMap: {},
    pluginObjMap: {},
    handle: function(action) {
        var instance;
        if (action.asset) {
            instance = PluginManager.getPluginObject(action.asset), !0 === action.parent && instance._parent && (instance = instance._parent);
            for (k in action) if (AnimationManager.isPlugin(k)) {
                var data = action[k], pluginObj = void 0;
                data.id && (pluginObj = AnimationManager.getPluginObject(data.id)), void 0 === pluginObj ? pluginObj = AnimationManager.invokePlugin(k, action[k], instance) : console.info("Playing from cache..."), 
                pluginObj.animate(instance, action.cb);
            }
        }
    },
    widthHandler: function(event, plugin) {
        var sb = plugin.getBounds();
        plugin.scaleY = plugin.height / sb.height, plugin.scaleX = plugin.width / sb.width;
    },
    isPlugin: function(id) {
        return !!AnimationManager.pluginMap[id];
    },
    registerPlugin: function(id, plugin) {
        AnimationManager.pluginMap[id] = plugin, createjs.EventDispatcher.initialize(plugin.prototype);
    },
    invokePlugin: function(id, data, plugin) {
        var p, pluginMap = AnimationManager.pluginMap;
        return pluginMap[id] ? _.isArray(data) ? data.forEach(function(d) {
            new pluginMap[id](d, plugin);
        }) : p = new pluginMap[id](data, plugin) : AnimationManager.addError("No plugin found for - " + id), 
        p;
    },
    registerPluginObject: function(pluginObj) {
        AnimationManager.pluginObjMap[pluginObj._id] = pluginObj;
    },
    getPluginObject: function(id) {
        return AnimationManager.pluginObjMap[id];
    },
    cleanUp: function() {
        AnimationManager.pluginObjMap = {};
    }
}, AssetManager = {
    strategy: void 0,
    stageAudios: {},
    init: function(themeData, basePath) {
        AssetManager.strategy = new LoadByStageStrategy(themeData, basePath);
    },
    getAsset: function(stageId, assetId) {
        return AssetManager.strategy.getAsset(stageId, assetId);
    },
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        nextStageId && AssetManager.stopStageAudio(nextStageId), prevStageId && AssetManager.stopStageAudio(prevStageId), 
        AssetManager.strategy.initStage(stageId, nextStageId, prevStageId, cb);
    },
    destroy: function() {
        _.isUndefined(AssetManager.strategy) || (AssetManager.strategy.destroy(), AssetManager.strategy = void 0), 
        AssetManager.stageAudios = {};
    },
    stopStageAudio: function(stageId) {
        AssetManager.stageAudios[stageId] && AssetManager.stageAudios[stageId].length > 0 && AssetManager.stageAudios[stageId].forEach(function(audioAsset) {
            AudioManager.stop({
                stageId: stageId,
                asset: audioAsset,
                disableTelemetry: !0
            });
        });
    },
    addStageAudio: function(stageId, audioId) {
        AssetManager.stageAudios[stageId] && AssetManager.stageAudios[stageId].push(audioId);
    },
    loadAsset: function(stageId, assetId, path) {
        AssetManager.strategy ? AssetManager.strategy.loadAsset(stageId, assetId, path) : console.info("asset not loaded because AssetManager not initialised or failed to initialize.");
    },
    getManifest: function(content) {
        var manifest = {};
        return manifest.media = [], _.each(content.stage, function(stage) {
            _.isUndefined(stage.manifest) || _.isUndefined(stage.manifest.media) || (_.isArray(stage.manifest.media) || (stage.manifest.media = [ stage.manifest.media ]), 
            _.each(stage.manifest.media, function(media) {
                manifest.media.push(media);
            }));
        }), manifest;
    }
}, AudioManager = {
    instances: {},
    MAX_INSTANCES: 10,
    muted: !1,
    uniqueId: function(action) {
        return action.stageId + ":" + action.asset;
    },
    play: function(action, instance) {
        return void 0 !== action && void 0 !== action.asset && null != action.asset ? (instance = instance || AudioManager.instances[AudioManager.uniqueId(action)] || {}, 
        instance.object ? (instance.object.volume = 1, instance.object.paused ? instance.object.paused = !1 : -1 !== [ createjs.Sound.PLAY_FINISHED, createjs.Sound.PLAY_INTERRUPTED, createjs.Sound.PLAY_FAILED ].indexOf(instance.object.playState) && instance.object.play(), 
        instance.object.muted = this.muted) : (AudioManager.reclaim(), instance.object = createjs.Sound.play(action.asset, {
            interrupt: createjs.Sound.INTERRUPT_ANY
        }), instance.object.muted = this.muted, instance._data = {
            id: AudioManager.uniqueId(action)
        }, AudioManager.instances[AudioManager.uniqueId(action)] = instance, AssetManager.addStageAudio(Renderer.theme._currentStage, action.asset)), 
        createjs.Sound.PLAY_FAILED != instance.object.playState ? (EventManager.processAppTelemetry(action, "LISTEN", instance, {
            subtype: "PLAY"
        }), instance.object.on("complete", function() {
            void 0 !== action.cb && action.cb({
                status: "success"
            });
        }, action)) : (delete AudioManager.instances[AudioManager.uniqueId(action)], console.info("Audio with 'id :" + action.asset + "' is not found..")), 
        instance) : (console.warn("Asset is not given to play.", action), {});
    },
    togglePlay: function(action) {
        if (void 0 !== action && void 0 !== action.asset && null != action.asset) {
            var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
            instance && instance.object ? instance.object.playState === createjs.Sound.PLAY_FINISHED || instance.object.paused ? AudioManager.play(action, instance) : instance.object.paused || AudioManager.pause(action, instance) : AudioManager.play(action, instance);
        } else console.warn("Asset is not given to toggle play.", action);
    },
    pause: function(action, instance) {
        void 0 !== action && void 0 !== action.asset && null != action.asset ? (instance = instance || AudioManager.instances[AudioManager.uniqueId(action)]) && instance.object && instance.object.playState === createjs.Sound.PLAY_SUCCEEDED && (instance.object.paused = !0, 
        EventManager.processAppTelemetry(action, "LISTEN", instance, {
            subtype: "PAUSE"
        })) : console.warn("Asset is not given to toggle pause.", action);
    },
    stop: function(action) {
        var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
        instance && instance.object && instance.object.playState !== createjs.Sound.PLAY_FINISHED && (instance.object.volume = 0, 
        instance.object.stop(), EventManager.processAppTelemetry(action, "LISTEN", instance, {
            subtype: "STOP"
        }));
    },
    stopAll: function(action) {
        for (var data in AudioManager.instances) AudioManager.instances[data].object.volume = 0;
        createjs.Sound.stop(), action && EventManager.processAppTelemetry(action, "LISTEN", "", {
            subtype: "STOP_ALL"
        });
    },
    reclaim: function() {
        var keys = _.keys(AudioManager.instances);
        if (keys.length > AudioManager.MAX_INSTANCES) for (index in keys) {
            var key = keys[index], instance = AudioManager.instances[key];
            if (instance && instance.object.playState != createjs.Sound.PLAY_INITED && instance.object.playState != createjs.Sound.PLAY_SUCCEEDED) {
                AudioManager.destroyObject(instance, key);
                break;
            }
        }
    },
    destroy: function(stageId, assetId) {
        var soundId = AudioManager.uniqueId({
            stageId: stageId,
            asset: assetId
        }), instance = AudioManager.instances[soundId] || {};
        AudioManager.destroyObject(instance, soundId);
    },
    destroyObject: function(instance, soundId) {
        if (instance.object) {
            try {
                instance.object.destroy();
            } catch (err) {
                console.log("Error", err);
            }
            instance.object = void 0, instance.state = void 0, delete AudioManager.instances[soundId];
        }
    },
    cleanUp: function() {
        AudioManager.instances = {};
    },
    mute: function() {
        this.muted = !0, _.isEmpty(AudioManager.instances) || _.map(_.pluck(_.values(AudioManager.instances), "object"), function(obj) {
            return obj.muted = !0, obj;
        });
    },
    unmute: function() {
        this.muted = !1, _.isEmpty(AudioManager.instances) || _.map(_.pluck(_.values(AudioManager.instances), "object"), function(obj) {
            return obj.muted = !1, obj;
        });
    }
}, CommandManager = {
    commandMap: {},
    registerCommand: function(id, command) {
        CommandManager.commandMap[id] = command;
    },
    handle: function(action) {
        try {
            if (action.stageInstanceId = _.clone(Renderer.theme._currentScene._stageInstanceId), 
            action.delay) TimerManager.start(action); else {
                var cId = "";
                if (this._canHandle(action)) {
                    this._setAnimationAsCommand(action), this._setActionAsset(action), _.isString(action.command) && (cId = action.command.toUpperCase());
                    var command = CommandManager.commandMap[cId];
                    command ? new command(action) : console.warn("No command registered with name: ", cId);
                } else console.info("action ev-if failed. So, it is not called.");
            }
        } catch (e) {
            EkstepRendererAPI.logErrorEvent(e, {
                type: "asset",
                action: action.command,
                asset: action.asset,
                objectId: action.id
            }), _.isUndefined(action) ? showToaster("error", "Command failed") : showToaster("error", action.command + ": Command failed"), 
            console.warn(action + "Failed due to", e);
        }
    },
    _setAnimationAsCommand: function(action) {
        "animation" === action.type && (action.type = "command", action.command = "ANIMATE");
    },
    _setDataAttributes: function(action) {
        var dataAttributes = {};
        _.keys(action).forEach(function(key) {
            var lowerKey = key.toLowerCase();
            "data-" == lowerKey.substring(0, 5) && (dataAttributes[lowerKey.replace("data-", "")] = action[key]);
        }), action.dataAttributes = dataAttributes, action.stageId = Renderer.theme._currentStage;
    },
    _setActionAsset: function(action) {
        var plugin = PluginManager.getPluginObject(action.pluginId), stage = plugin._stage;
        stage && null != stage || (stage = plugin), stage && "stage" === stage._type && (action.param && (action.value = stage.getParam(action.param) || ""), 
        action.asset || action.asset_param || action.asset_model ? action.asset_param ? action.asset = stage.getParam(action.asset_param) || "" : action.asset_model && (action.asset = stage.getModelValue(action.asset_model) || "") : action.asset = plugin._id);
    },
    _canHandle: function(action) {
        var handle = !0, plugin = PluginManager.getPluginObject(action.pluginId);
        if (action["ev-if"]) {
            var expr = action["ev-if"].trim();
            "${" != expr.substring(0, 2) && (expr = "${" + expr), "}" != expr.substring(expr.length - 1, expr.length) && (expr += "}"), 
            handle = plugin.evaluateExpr(expr);
        }
        return handle;
    },
    displayAllHtmlElements: function(visibility) {
        jQuery("#" + Renderer.divIds.gameArea).children().each(function() {
            jQuery(this).is("canvas") || (visibility ? jQuery(this).show() : jQuery(this).hide());
        });
    }
}, EventManager = {
    registerEvents: function(plugin, data) {
        try {
            var events = void 0;
            data.events ? _.isArray(data.events) ? (events = [], data.events.forEach(function(e) {
                events.push.apply(events, e.event);
            })) : events = data.events.event : events = data.event, _.isArray(events) ? events.forEach(function(e) {
                EventManager.registerEvent(e, plugin);
            }) : events && EventManager.registerEvent(events, plugin);
        } catch (e) {
            showToaster("error", "Event fails to register"), console.warn("Event fails to register due to", e);
        }
    },
    registerEvent: function(evt, plugin) {
        var register = !0;
        if (evt["ev-if"]) {
            var expr = evt["ev-if"].trim(), modelExpr = expr = plugin.replaceExpressions(expr);
            "${" != expr.substring(0, 2) && (expr = "${" + expr), "}" != expr.substring(expr.length - 1, expr.length) && (expr += "}"), 
            register = plugin.evaluateExpr(expr), void 0 === register && plugin._stage && (register = plugin._stage.getModelValue(modelExpr));
        }
        if (register) if (plugin.events.push(evt.type), _.contains(createjs.DisplayObject._MOUSE_EVENTS, evt.type)) {
            var element = plugin._self;
            element && (plugin instanceof HTMLPlugin ? (element = plugin._self.htmlElement, 
            element.style.cursor = "pointer") : element.cursor = "pointer", element.addEventListener(evt.type, function(event) {
                EventManager.processMouseTelemetry(evt, event, plugin), EventManager.handleActions(evt, plugin);
            }));
        } else plugin.on(evt.type, function() {
            EventManager.handleActions(evt, plugin);
        });
    },
    dispatchEvent: function(id, event) {
        var plugin = PluginManager.getPluginObject(id);
        _.contains(createjs.DisplayObject._MOUSE_EVENTS, event) ? plugin._self.dispatchEvent(event) : plugin.dispatchEvent(event);
    },
    handleActions: function(evt, plugin) {
        try {
            var disableTelemetry = !1;
            EventManager._setPluginId(evt.action, plugin._id);
            var unmuteActions = _.clone(evt.action);
            if (evt.action = EventManager._chainActions(evt.action, unmuteActions), "click" !== evt.type && (disableTelemetry = !0), 
            _.isArray(evt.action)) {
                var data = JSON.parse(JSON.stringify(evt.action));
                delete evt.action, evt.action = data, evt.action.forEach(function(a) {
                    a.disableTelemetry = disableTelemetry;
                    var action = _.clone(a);
                    action.pluginId = plugin._id, CommandManager.handle(action);
                });
            } else if (evt.action) {
                evt.action.disableTelemetry = disableTelemetry;
                var action = _.clone(evt.action);
                action.pluginId = plugin._id, CommandManager.handle(action);
            }
        } catch (e) {
            _.isUndefined(evt) ? showToaster("error", "Event failed") : showToaster("error", evt.type + ": Event failed"), 
            EkstepRendererAPI.logErrorEvent(e, {
                type: "asset",
                objectId: evt.action.id,
                asset: evt.action.asset,
                action: evt.action ? evt.action.command : ""
            }), console.warn("Event fails to handle due to", e);
        }
    },
    _setPluginId: function(actions, pluginId) {
        _.isArray(actions) ? actions.forEach(function(action) {
            action.pluginId = pluginId;
        }) : actions && (actions.pluginId = pluginId);
    },
    _chainActions: function(actions, unmuteActions) {
        if (_.isArray(actions)) {
            var filter = _.filter(actions, function(action) {
                return action.with || action.after;
            });
            if (filter.length > 0) {
                var action = filter[0], parentId = action.after || action.with, p = _.findWhere(unmuteActions, {
                    id: parentId
                });
                return p ? (action.after && (p.children || (p.children = []), p.children.push(action)), 
                action.with && (p.siblings || (p.siblings = []), p.siblings.push(action)), actions = _.without(actions, action)) : console.warn("Didn't find action with id:", parentId), 
                delete action.after, delete action.with, EventManager._chainActions(actions, unmuteActions);
            }
            return actions;
        }
        return actions;
    },
    processMouseTelemetry: function(action, event, plugin) {
        var data = {
            type: event.type,
            x: event.stageX,
            y: event.stageY
        }, type = TelemetryService.getMouseEventMapping()[action.type];
        EventManager.processAppTelemetry(action, type, plugin, data);
    },
    processAppTelemetry: function(action, type, plugin, data) {
        if (plugin || (plugin = {
            _data: {
                id: "",
                asset: ""
            }
        }), action || (action = {
            disableTelemetry: !0
        }), !0 !== action.disableTelemetry && type) {
            var id = plugin._data.id || plugin._data.asset;
            if (id || (id = action.asset), !id) {
                var actionObj = action.action;
                _.isArray(actionObj) && actionObj.length >= 1 && (actionObj = actionObj[0]), actionObj && (id = actionObj.asset);
            }
            if (id || (id = plugin._type || "none"), id) {
                var stageId = Renderer.theme ? Renderer.theme._currentStage : "";
                data && (data.stageId = stageId), TelemetryService.interact(type, id, type, data || {
                    stageId: stageId
                });
            }
        }
    }
}, OverlayManager = {
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
    _reloadInProgress: !1,
    _contentConfig: {},
    _stageConfig: {},
    init: function() {
        this.clean(), this._reloadInProgress = !1, this._eventsArray = [ this._constants.overlayNext, this._constants.overlayPrevious, this._constants.overlaySubmit, this._constants.overlayMenu, this._constants.overlayReload, this._constants.overlayGoodJob, this._constants.overlayTryAgain ], 
        this.setContentConfig(), EventBus.addEventListener("actionNavigateSkip", this.skipAndNavigateNext, this), 
        EventBus.addEventListener("actionNavigateNext", this.navigateNext, this), EventBus.addEventListener("actionNavigatePrevious", this.navigatePrevious, this), 
        EventBus.addEventListener("actionDefaultSubmit", this.defaultSubmit, this), EventBus.addEventListener("actionReload", this.actionReload, this), 
        (_.isUndefined(EventBus.listeners.actionReplay) || _.isArray(EventBus.listeners.actionReplay) && 0 == EventBus.listeners.actionReplay.length) && EventBus.addEventListener("actionReplay", this.actionReplay, this);
    },
    setStageData: function() {
        _.isUndefined(Renderer.theme) || EventBus.dispatch("sceneEnter", Renderer.theme._currentScene);
    },
    setContentConfig: function() {
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var val, eventName = this._eventsArray[i];
            _.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene) || (val = Renderer.theme.getParam(eventName)), 
            _.isUndefined(val) || (this._contentConfig[eventName] = val);
        }
        this.setStageConfig();
    },
    setStageConfig: function() {
        this._stageConfig = _.clone(this._contentConfig);
        var evtLenth = this._eventsArray.length;
        for (i = 0; i < evtLenth; i++) {
            var val, eventName = this._eventsArray[i];
            if (_.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene) || (val = Renderer.theme._currentScene.getParam(eventName)), 
            _.isUndefined(val)) {
                var contentConfigVal = this._contentConfig[eventName];
                val = _.isUndefined(contentConfigVal) ? "on" : contentConfigVal;
            }
            this._stageConfig[eventName] = val;
        }
        this.setStageData(), this.handleNext(), this.handlePrevious(), this.handleSubmit();
    },
    handleNext: function() {
        var eventName = this._constants.overlayNext, val = this._stageConfig[eventName];
        EventBus.dispatch(eventName, val), this.handleEcmlElements(eventName, val);
    },
    handlePrevious: function() {
        if (!_.isUndefined(Renderer.theme._currentScene)) {
            var eventName = this._constants.overlayPrevious, val = this._stageConfig[eventName], navigateToStage = this.getNavigateTo("previous");
            "on" == val && (_.isUndefined(navigateToStage) ? (val = "disable", Renderer.theme._currentScene.isItemScene() && Renderer.theme._currentScene._stageController.hasPrevious() && (val = "enable")) : val = "enable"), 
            EventBus.dispatch(eventName, val), this.handleEcmlElements(eventName, val);
        }
    },
    handleSubmit: function() {
        var eventName = this._constants.overlaySubmit, val = this._stageConfig[eventName];
        if (!_.isUndefined(Renderer.theme) && _.isUndefined(Renderer.theme.getParam(eventName)) && _.isUndefined(Renderer.theme._currentScene.getParam(eventName)) && (val = AppConfig.OVERLAY_SUBMIT), 
        _.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene) || !Renderer.theme._currentScene.isItemScene()) EventBus.dispatch(eventName, "off"); else {
            if ("on" == val) {
                val = !0 === Renderer.theme._currentScene.isReadyToEvaluate() ? "enable" : "disable";
            }
            EventBus.dispatch(eventName, val), this.handleEcmlElements(eventName, val);
        }
    },
    showFeeback: function(showOverlayGoodJob) {
        var returnVal = !0;
        return showOverlayGoodJob ? (returnVal = "on" == this._stageConfig.overlayGoodJob, 
        this.showGoodJobFb(returnVal)) : (returnVal = "on" == this._stageConfig.overlayTryAgain, 
        this.showTryAgainFb(returnVal)), returnVal;
    },
    showGoodJobFb: function(value) {
        1 == value ? (AudioManager.play({
            stageId: Renderer.theme._currentStage,
            asset: "goodjob_sound"
        }), EventBus.dispatch(this._constants.overlayGoodJob, "on")) : EventBus.dispatch(this._constants.overlayGoodJob, "off");
    },
    showTryAgainFb: function(value) {
        1 == value ? (AudioManager.play({
            stageId: Renderer.theme._currentStage,
            asset: "tryagain_sound"
        }), EventBus.dispatch(this._constants.overlayTryAgain, "on")) : EventBus.dispatch(this._constants.overlayTryAgain, "off");
    },
    navigateNext: function() {
        try {
            if (_.isUndefined(Renderer.theme._currentScene)) return;
            if (Renderer.theme._currentScene.isItemScene()) return void this.defaultSubmit();
            this.skipAndNavigateNext();
        } catch (e) {
            showToaster("error", "Current scene having some issue"), EkstepRendererAPI.logErrorEvent(e, {
                severity: "fatal",
                type: "content",
                action: "transitionTo"
            }), console.warn("Fails to navigate to next due to", e);
        }
    },
    skipAndNavigateNext: function() {
        try {
            this.clean(), TelemetryService.interact("TOUCH", "next", null, {
                stageId: Renderer.theme._currentStage
            });
            var navigateTo = this.getNavigateTo("next");
            if (void 0 === navigateTo) {
                if (_.isUndefined(Renderer.theme._currentScene)) return;
                Renderer.theme._currentScene.isItemScene() && !_.isUndefined(Renderer.theme._currentScene._stageController) && Renderer.theme._currentScene._stageController.hasNext() ? this.defaultNavigation("next", navigateTo) : this.moveToEndPage();
            } else this.defaultNavigation("next", navigateTo);
        } catch (e) {
            showToaster("error", "Current scene having some issue"), EkstepRendererAPI.logErrorEvent(e, {
                severity: "fatal",
                type: "content",
                action: "transitionTo"
            }), console.warn("Fails to skip and navigate due to", e);
        }
    },
    moveToEndPage: function() {
        if (config.showEndPage) {
            console.info("redirecting to endpage.");
            var stage = Renderer.theme._currentScene;
            Renderer.theme.setParam(stage.getStagestateKey(), stage._currentState), window.location.hash = "/content/end/" + GlobalContext.currentContentId, 
            AudioManager.stopAll();
        } else console.warn("Cannot move to end page of the content. please check the configurations..");
    },
    clean: function() {
        EventBus.removeEventListener("actionNavigateSkip", this.skipAndNavigateNext, this), 
        EventBus.removeEventListener("actionNavigateNext", this.navigateNext, this), EventBus.removeEventListener("actionNavigatePrevious", this.navigatePrevious, this), 
        EventBus.removeEventListener("actionDefaultSubmit", this.defaultSubmit, this);
    },
    reset: function() {
        this.clean(), this._contentConfig = {}, this._stageConfig = {};
    },
    navigatePrevious: function() {
        try {
            if (_.isUndefined(Renderer.theme._currentScene)) return;
            var navigateToStage = this.getNavigateTo("previous");
            if (_.isUndefined(navigateToStage) && (!Renderer.theme._currentScene.isItemScene() || !Renderer.theme._currentScene._stageController.hasPrevious())) return;
            var navigateTo = this.getNavigateTo("previous");
            if (_.isUndefined(Renderer.theme._currentScene)) return;
            this.defaultNavigation("previous", navigateTo);
        } catch (e) {
            EkstepRendererAPI.logErrorEvent(e, {
                severity: "fatal",
                type: "content",
                action: "transitionTo"
            }), showToaster("error", "Stage having some issue"), console.warn("Fails to navigate to previous due to", e);
        }
    },
    showOrHideEcmlElement: function(id, showEle) {
        var plugin = PluginManager.getPluginObject(id);
        plugin && ("off" == showEle ? plugin.show() : plugin.hide());
    },
    handleEcmlElements: function(eventName, val) {
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene)) {
            var stage_data = Renderer.theme.getStagesToPreLoad(Renderer.theme._currentScene._data);
            stage_data.next, stage_data.prev;
        }
        switch (eventName) {
          case "overlayNext":
            this.showOrHideEcmlElement("next", val), this.showOrHideEcmlElement("nextContainer", val);
            break;

          case "overlayPrevious":
            this.showOrHideEcmlElement("previous", val), this.showOrHideEcmlElement("previousContainer", val);
            break;

          case "overlaySubmit":
            this.showOrHideEcmlElement("validate", val);
            break;

          case "overlayMenu":
          case "overlayReload":
          case "overlayGoodJob":
          case "overlayTryAGain":
            break;

          default:
            console.log("Default case got called..");
        }
    },
    getNavigateTo: function(navType) {
        var stageParams = [], stageId = void 0;
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
            stageParams = _.isArray(Renderer.theme._currentScene._data.param) ? Renderer.theme._currentScene._data.param : [ Renderer.theme._currentScene._data.param ];
            var navParam = _.findWhere(stageParams, {
                name: navType
            });
            navParam && (stageId = navParam.value);
        }
        return stageId;
    },
    defaultSubmit: function() {
        var action = {
            type: "command",
            command: "eval",
            asset: Renderer.theme._currentStage,
            pluginId: Renderer.theme._currentStage
        };
        action.success = "correct_answer", action.failure = "wrong_answer", CommandManager.handle(action);
    },
    defaultNavigation: function(navType, navigateTo) {
        var action = {
            asset: Renderer.theme._id,
            command: "transitionTo",
            duration: "100",
            ease: "linear",
            effect: "fadeIn",
            type: "command",
            pluginId: Renderer.theme._id,
            value: navigateTo
        };
        action.transitionType = navType, CommandManager.handle(action);
    },
    actionReload: function() {
        if (!this._reloadInProgress) {
            var plugin, currentStage = Renderer.theme._currentStage;
            this._reloadInProgress = !0, setTimeout(function() {
                (plugin = PluginManager.getPluginObject(currentStage)) && plugin.reload({
                    type: "command",
                    command: "reload",
                    duration: "100",
                    ease: "linear",
                    effect: "fadeIn",
                    asset: currentStage
                });
            }, 500), TelemetryService.interact("TOUCH", "gc_reload", "TOUCH", {
                stageId: currentStage
            });
        }
    },
    actionReplay: function(data) {
        var version = TelemetryService.getGameVer();
        TelemetryService.end(), GlobalContext.currentContentId && version && startTelemetry(GlobalContext.currentContentId, version), 
        (data.target && data.target.menuReplay || _.isUndefined(data.target)) && (EkstepRendererAPI.removeHtmlElements(), 
        Renderer.theme.reRender());
    }
}, LoadByStageStrategy = Class.extend({
    MAX_CONNECTIONS: 50,
    assetMap: {},
    spriteSheetMap: {},
    commonAssets: [],
    templateAssets: [],
    loaders: {},
    commonLoader: void 0,
    templateLoader: void 0,
    stageManifests: {},
    init: function(themeData, basePath) {
        var instance = this;
        createjs.Sound.registerPlugins([ createjs.CordovaAudioPlugin, createjs.WebAudioPlugin, createjs.HTMLAudioPlugin ]), 
        createjs.Sound.alternateExtensions = [ "mp3" ], this.destroy(), this.loadAppAssets(), 
        _.isUndefined(themeData.manifest) || _.isUndefined(themeData.manifest.media) ? console.log("==== manifest media not defined ====") : (_.isArray(themeData.manifest.media) || (themeData.manifest.media = [ themeData.manifest.media ]), 
        themeData.manifest.media.forEach(function(media) {
            if (media && media.src) if ("http" != media.src.substring(0, 4) && (isbrowserpreview ? media.src = AppConfig.host + media.src : media.src = basePath + media.src), 
            createjs.CordovaAudioPlugin.isSupported() && "sound" !== media.type && "audiosprite" !== media.type && (media.src = "file:///" + media.src), 
            "json" == media.type) instance.commonAssets.push(_.clone(media)); else if ("spritesheet" == media.type) {
                var imgId = media.id + "_image";
                instance.commonAssets.push({
                    id: imgId,
                    src: media.src,
                    type: "image"
                }), media.images = [];
                var animations = {};
                if (media.animations) for (k in media.animations) animations[k] = JSON.parse(media.animations[k]);
                media.animations = animations, instance.spriteSheetMap[media.id] = media;
            } else "audiosprite" == media.type && (_.isArray(media.data.audioSprite) || (media.data.audioSprite = [ media.data.audioSprite ])), 
            "true" !== media.preload && !0 !== media.preload || instance.commonAssets.push(_.clone(media)), 
            instance.assetMap[media.id] = media;
        }));
        var stages = themeData.stage;
        _.isArray(stages) || (stages = [ stages ]), stages.forEach(function(stage) {
            instance.stageManifests[stage.id] = [], AssetManager.stageAudios[stage.id] = [], 
            instance.populateAssets(stage, stage.id, stage.preload, themeData.startStage);
        }), instance.loadCommonAssets();
        var templates = themeData.template;
        _.isArray(templates) || (templates = [ templates ]), templates.forEach(function(template) {
            instance.populateTemplateAssets(template);
        }), instance.loadTemplateAssets();
    },
    loadAppAssets: function() {
        var localPath = "undefined" == typeof cordova ? "" : "file:///android_asset/www/";
        this.commonAssets.push({
            id: "goodjob_sound",
            src: localPath + "assets/sounds/goodjob.mp3"
        }), this.commonAssets.push({
            id: "tryagain_sound",
            src: localPath + "assets/sounds/letstryagain.mp3"
        });
    },
    populateAssets: function(data, stageId, preload, startStageId) {
        var instance = this;
        for (k in data) {
            var plugins = data[k];
            _.isArray(plugins) || (plugins = [ plugins ]), PluginManager.isPlugin(k) && "g" == k || "manifest" == k ? plugins.forEach(function(plugin) {
                instance.populateAssets(plugin, stageId, preload, startStageId);
            }) : plugins.forEach(function(plugin) {
                if (!_.isNull(plugin)) {
                    var assetId = plugin.asset || plugin.audio || plugin.assetId;
                    if (assetId) {
                        var asset = instance.assetMap[assetId];
                        asset && (!0 === preload && stageId !== startStageId && instance.commonAssets.push(_.clone(asset)), 
                        instance.stageManifests[stageId].push(_.clone(asset)));
                    }
                }
            });
        }
    },
    populateTemplateAssets: function(data) {
        var instance = this;
        for (k in data) {
            var plugins = data[k];
            _.isArray(plugins) || (plugins = [ plugins ]), PluginManager.isPlugin(k) && "g" == k ? plugins.forEach(function(plugin) {
                instance.populateTemplateAssets(plugin);
            }) : plugins.forEach(function(plugin) {
                if (plugin && plugin.asset) {
                    var asset = instance.assetMap[plugin.asset];
                    asset && instance.templateAssets.push(_.clone(asset));
                }
            });
        }
    },
    getAsset: function(stageId, assetId) {
        var asset = void 0;
        if (this.loaders[stageId] && (asset = this.loaders[stageId].getResult(assetId)), 
        asset || (asset = this.commonLoader.getResult(assetId)), asset || (asset = this.templateLoader.getResult(assetId)), 
        asset || (asset = this.spriteSheetMap[assetId]), !asset) {
            if (this.assetMap[assetId]) return console.error("Asset not found. Returning - " + this.assetMap[assetId].src), 
            this.assetMap[assetId].src;
            console.error('"' + assetId + '" Asset not found. Please check index.ecml.'), EkstepRendererAPI.logErrorEvent({
                message: "Asset not found. Please check index.ecml"
            }, {
                type: "content",
                severity: "error",
                action: "play",
                asset: assetId,
                objectId: assetId
            });
        }
        return asset;
    },
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        var instance = this;
        this.loadStage(stageId, cb);
        var deleteStages = _.difference(_.keys(instance.loaders), [ stageId, nextStageId, prevStageId ]);
        deleteStages.length > 0 && deleteStages.forEach(function(stageId) {
            instance.destroyStage(stageId);
        }), nextStageId && instance.loadStage(nextStageId), prevStageId && instance.loadStage(prevStageId), 
        instance.loaders = _.pick(instance.loaders, stageId, nextStageId, prevStageId);
    },
    loadStage: function(stageId, callback) {
        var instance = this;
        if (!instance.loaders[stageId]) {
            var mediaList = JSON.parse(JSON.stringify(instance.stageManifests[stageId]));
            if (mediaList = _.uniq(mediaList, function(media) {
                return media.assetId || media.id;
            }), _.isArray(mediaList) && mediaList.length > 0) {
                var loader = this._createLoader();
                loader.stageLoaded = !1, loader.on("complete", function() {
                    loader.stageLoaded = !0;
                }, null, !0), loader.on("error", function(evt) {
                    console.error("StageLoader Asset preload error", evt);
                }), loader.setMaxConnections(instance.MAX_CONNECTIONS), loader.installPlugin(createjs.Sound), 
                loader.loadManifest(mediaList, !0), instance.loaders[stageId] = loader;
            }
        }
        this.handleStageCallback(stageId, callback);
    },
    handleStageCallback: function(stageId, cb) {
        var instance = this;
        if (cb) if (_.isUndefined(this.loaders[stageId]) || this.loaders[stageId].stageLoaded) {
            var data = Renderer.theme && Renderer.theme._currentStage ? Renderer.theme._currentStage : stageId;
            stageId == data && (EventBus.dispatch(data + "_assetsLoaded"), cb());
        } else this.loaders[stageId].on("complete", function() {
            instance.loaders[stageId].stageLoaded = !0;
            var data = Renderer.theme && Renderer.theme._currentStage ? Renderer.theme._currentStage : stageId;
            stageId == data && (EventBus.dispatch(data + "_assetsLoaded"), cb());
        }, null, !0);
    },
    loadCommonAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS), loader.installPlugin(createjs.Sound), 
        loader.loadManifest(this.commonAssets, !0), loader.on("error", function(evt) {
            console.error("CommonLoader - asset preload error", evt);
        }), this.commonLoader = loader;
    },
    loadTemplateAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS), loader.installPlugin(createjs.Sound), 
        loader.loadManifest(this.templateAssets, !0), loader.on("error", function(evt) {
            console.error("TemplateLoader - asset preload error", evt);
        }), this.templateLoader = loader;
    },
    loadAsset: function(stageId, assetId, path, cb) {
        if (_.isUndefined(assetId) || _.isUndefined(path)) return void console.warn("Asset can't be loaded: AssetId - " + assetId + ",  Path - " + path);
        var loader = this.loaders[stageId];
        if (loader) loader.installPlugin(createjs.Sound), loader.on("complete", function() {
            loader.stageLoaded = !0, cb && cb();
        }, this), loader.loadFile({
            id: assetId,
            src: path
        }), loader.stageLoaded = !1; else {
            loader = this._createLoader();
            var instance = this;
            loader.on("complete", function(event) {
                _.isUndefined(instance.loaders) && (instance.loaders = {}), instance.loaders[stageId] = event.target, 
                instance.loaders[stageId].stageLoaded = !0, cb && cb();
            }, this), loader.on("error", function(evt) {
                console.error("AssetLoader - asset preload error", evt);
            }), loader.loadFile({
                id: assetId,
                src: path
            }), loader.stageLoaded = !1;
        }
    },
    destroy: function() {
        var instance = this;
        for (k in instance.loaders) instance.destroyStage(k);
        instance.assetMap = {}, instance.loaders = {}, instance.stageManifests = {};
        try {
            createjs.Sound.removeAllSounds();
        } catch (err) {}
    },
    destroyStage: function(stageId) {
        this.loaders[stageId] && (this.loaders[stageId].destroy(), AssetManager.stageAudios[stageId].forEach(function(audioAsset) {
            AudioManager.destroy(stageId, audioAsset);
        }));
    },
    _createLoader: function() {
        return "undefined" == typeof cordova ? new createjs.LoadQueue(!0, null, !0) : new createjs.LoadQueue(!1);
    },
    isStageAssetsLoaded: function(stageId) {
        var manifest = JSON.parse(JSON.stringify(this.stageManifests[stageId]));
        return !(_.isUndefined(this.loaders[stageId]) || !this.loaders[stageId].stageLoaded) || !(!_.isArray(manifest) || 0 != manifest.length);
    }
}), RecorderManager = {
    mediaInstance: void 0,
    recording: !1,
    appDataDirectory: void 0,
    mediaFiles: [],
    _autostop: {
        default_success: "rec_stopped",
        default_failure: "rec_stop_failed",
        method: void 0,
        action: void 0
    },
    _root: void 0,
    init: function() {
        document.addEventListener("deviceready", function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                RecorderManager._root = fileSystem.root;
            }, function(e) {
                console.log("[ERROR] Problem setting up root filesystem for running! Error to follow."), 
                console.log(JSON.stringify(e));
            }), RecorderManager.appDataDirectory = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
        });
    },
    startRecording: function(action) {
        AudioManager.stopAll();
        var plugin = PluginManager.getPluginObject(action.asset), stagePlugin = plugin._stage || plugin, stageId = stagePlugin._id, path = RecorderManager._getFilePath(stageId);
        RecorderManager.recording || (speech.startRecording(path, function(response) {
            "success" == response.status && action.success ? stagePlugin.dispatchEvent(action.success) : "error" == response.status && action.failure && stagePlugin.dispatchEvent(action.failure);
        }), RecorderManager._setAutostopAction(action), RecorderManager._autostop.method = setTimeout(function() {
            RecorderManager.stopRecording(RecorderManager._autostop.action);
        }, action.timeout ? action.timeout : 1e4)), RecorderManager.recording = !0;
    },
    stopRecording: function(action) {
        1 == RecorderManager.recording && speech.stopRecording(function(response) {
            if (RecorderManager.recording = !1, "success" == response.status && RecorderManager._cleanRecording(), 
            void 0 !== action && action.asset) {
                var plugin = PluginManager.getPluginObject(action.asset), stagePlugin = plugin._stage || plugin, stageId = stagePlugin._id;
                if ("success" == response.status) {
                    var currentRecId = "current_rec";
                    AssetManager.loadAsset(stageId, currentRecId, response.filePath), AudioManager.destroy(stageId, currentRecId), 
                    action.success && stagePlugin.dispatchEvent(action.success);
                } else "error" == response.status && action.failure && stagePlugin.dispatchEvent(action.failure);
            }
        });
    },
    processRecording: function(action) {
        var plugin = PluginManager.getPluginObject(action.asset), stagePlugin = plugin._stage || plugin, lineindex = stagePlugin.evaluateExpr(action.dataAttributes.lineindex);
        speech.processRecording(lineindex, null, function(response) {
            "success" == response.status && response.result ? (console.info("Processed recording result:", JSON.stringify(response)), 
            1 == response.result.totalScore ? action.success && stagePlugin.dispatchEvent(action.success) : action.failure && stagePlugin.dispatchEvent(action.failure)) : (console.info("Error while processing audio:", JSON.stringify(response)), 
            action.failure && stagePlugin.dispatchEvent(action.failure));
        });
    },
    _getFilePath: function(stageId) {
        var currentDate = new Date(), path = "";
        return RecorderManager.appDataDirectory && (path += RecorderManager.appDataDirectory), 
        GlobalContext && GlobalContext.user && GlobalContext.user.uid && (path = path + GlobalContext.user.uid + "_"), 
        TelemetryService && TelemetryService._gameData && TelemetryService._gameData.id && (path = path + TelemetryService._gameData.id + "_"), 
        path = path + stageId + "_" + currentDate.getTime() + ".wav", RecorderManager.mediaFiles.push(path), 
        path;
    },
    _getTimeoutEventName: function(status, action) {
        var eventName = "";
        return void 0 !== action["timeout-" + status] ? eventName = action["timeout-" + status] : Renderer.theme._currentScene.appEvents.indexOf(RecorderManager._autostop["default_" + status]) > -1 ? eventName = RecorderManager._autostop["default_" + status] : console.error("Invalid stopRecord events for timeout:", Renderer.theme._currentScene.appEvents), 
        eventName;
    },
    _setAutostopAction: function(startAction) {
        var stopAction = _.clone(startAction);
        stopAction.success = RecorderManager._getTimeoutEventName("success", stopAction), 
        stopAction.failure = RecorderManager._getTimeoutEventName("failure", stopAction), 
        RecorderManager._autostop.action = stopAction;
    },
    _cleanRecording: function() {
        clearTimeout(RecorderManager._autostop.method), RecorderManager._autostop.method = void 0, 
        RecorderManager._autostop.action = void 0;
    }
}, TimerManager = {
    instances: {},
    start: function(action) {
        var delay = action.delay || 0, stageId = Renderer.theme._currentStage, instance = setTimeout(function() {
            stageId == Renderer.theme._currentStage && CommandManager.handle(_.omit(action, "delay"));
        }, delay);
        console.info("action: " + (action.command || action.type) + " delayed by " + action.delay + "ms."), 
        TimerManager.instances[stageId] ? TimerManager.instances[stageId].push({
            timeout: instance,
            action: action
        }) : TimerManager.instances[stageId] = [ {
            timeout: instance,
            action: action
        } ];
    },
    stop: function() {},
    pause: function() {},
    resume: function() {},
    stopAll: function(stageId) {
        var timoutInsts = TimerManager.instances[stageId];
        timoutInsts && _.isArray(timoutInsts) && (timoutInsts.forEach(function(inst) {
            clearTimeout(inst.timeout);
        }), delete TimerManager.instances[stageId]);
    },
    destroy: function() {
        var instances = TimerManager.instances;
        for (stageId in instances) TimerManager.stopAll(stageId);
        TimerManager.instances = {};
    }
};
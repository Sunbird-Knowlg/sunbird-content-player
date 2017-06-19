var Command = Class.extend({
    _name: void 0,
    _methodName: void 0,
    _action: void 0,
    _isPluginAction: !0,
    _isAsync: !1,
    init: function(action) {
        this._action = action, CommandManager._setDataAttributes(action), this._action.cb = this._callBack.bind(this), 
        this.invoke(this._action), this._invokeRelatedActions("siblings"), this._isAsync || this._action.cb({
            status: "success"
        });
    },
    getPluginObject: function() {
        var plugin = PluginManager.getPluginObject(this._action.asset);
        return !0 === this._action.parent && plugin && plugin._parent && (plugin = plugin._parent), 
        plugin || (plugin = this._action.pluginObj), plugin;
    },
    invoke: function(action) {
        this.getPluginObject()[this._methodName](action);
    },
    _invokeRelatedActions: function(relation) {
        (_.isUndefined(this._action.stageInstanceId) || this._action.stageInstanceId == Renderer.theme._currentScene._stageInstanceId) && this._action[relation] && this._action[relation].length > 0 && _.each(this._action[relation], function(action) {
            CommandManager.handle(action);
        });
    },
    _callBack: function(response) {
        _(Renderer.theme).isUndefined() || void 0 !== response && "success" == response.status && (console.info(this._name + " completed."), 
        this._invokeRelatedActions("children"));
    }
}), AnimateCommand = Command.extend({
    _name: "ANIMATE",
    _isAsync: !0,
    invoke: function(action) {
        AnimationManager.handle(action);
    }
});

CommandManager.registerCommand("ANIMATE", AnimateCommand);

var BlurCommand = Command.extend({
    _name: "BLUR",
    _methodName: "blur"
});

CommandManager.registerCommand("BLUR", BlurCommand);

var CustomCommand = Command.extend({
    _name: "CUSTOM",
    _isPluginAction: !1,
    invoke: function(action) {
        var plugin = this.getPluginObject();
        plugin && action.invoke && plugin[action.invoke](action);
    }
});

CommandManager.registerCommand("CUSTOM", CustomCommand);

var DefaultNextCommand = Command.extend({
    _name: "DEFAULTNEXT",
    _methodName: "defaultNext",
    invoke: function(action) {
        console.log("Theme : action", action), EventBus.dispatch("actionNavigateNext", action);
    }
});

CommandManager.registerCommand("DEFAULTNEXT", DefaultNextCommand);

var EraseCommand = Command.extend({
    _name: "ERASE",
    _methodName: "clear",
    initCommand: function(action) {}
});

CommandManager.registerCommand("ERASE", EraseCommand);

var EvalCommand = Command.extend({
    _name: "EVAL",
    _methodName: "evaluate",
    invoke: function(action) {
        this.getPluginObject().evaluate(action);
    }
});

CommandManager.registerCommand("EVAL", EvalCommand);

var EventCommand = Command.extend({
    _name: "EVENT",
    _isPluginAction: !1,
    initCommand: function(action) {},
    invoke: function(action) {
        EventManager.dispatchEvent(action.asset, action.value);
    }
});

CommandManager.registerCommand("EVENT", EventCommand);

var ExternalCommand = Command.extend({
    _name: "EXTERNAL",
    _isPluginAction: !1,
    invoke: function(action) {
        action.href ? window.open(action.href, "_system") : startApp(action.app);
    }
});

CommandManager.registerCommand("EXTERNAL", ExternalCommand);

var HideCommand = Command.extend({
    _name: "HIDE",
    _methodName: "hide",
    initCommand: function(action) {}
});

CommandManager.registerCommand("HIDE", HideCommand);

var HideHTMLElementsCommand = Command.extend({
    _name: "HIDEHTMLELEMENTS",
    _isPluginAction: !1,
    invoke: function(action) {
        CommandManager.displayAllHtmlElements(!1);
    }
});

CommandManager.registerCommand("HIDEHTMLELEMENTS", HideHTMLElementsCommand);

var PauseCommand = Command.extend({
    _name: "PAUSE",
    _methodName: "pause",
    invoke: function(action) {
        var plugin = this.getPluginObject();
        void 0 === plugin && (plugin = AudioManager), plugin[this._methodName](action);
    }
});

CommandManager.registerCommand("PAUSE", PauseCommand);

var PlayCommand = Command.extend({
    _name: "PLAY",
    _methodName: "play",
    _isAsync: !0,
    invoke: function(action) {
        var plugin = this.getPluginObject();
        void 0 === plugin && (plugin = AudioManager), plugin[this._methodName](action);
    }
});

CommandManager.registerCommand("PLAY", PlayCommand);

var ProcessRecordCommand = Command.extend({
    _name: "PROCESSRECORD",
    _isPluginAction: !1,
    invoke: function(action) {
        RecorderManager.processRecording(action);
    }
});

CommandManager.registerCommand("PROCESSRECORD", ProcessRecordCommand);

var RefreshCommand = Command.extend({
    _name: "REFRESH",
    _methodName: "refresh",
    initCommand: function(action) {}
});

CommandManager.registerCommand("REFRESH", RefreshCommand);

var ReloadCommand = Command.extend({
    _name: "RELOAD",
    _methodName: "reload",
    initCommand: function(action) {}
});

CommandManager.registerCommand("RELOAD", ReloadCommand);

var ResetCommand = Command.extend({
    _name: "RESET",
    _isPluginAction: !1,
    invoke: function(action) {
        var c = ControllerManager.instanceMap[action.cType + "." + action.controller];
        void 0 !== c ? c.reset() : console.warn("No controller find with id:", action.controller);
    }
});

CommandManager.registerCommand("RESET", ResetCommand);

var RestartCommand = Command.extend({
    _name: "RESTART",
    _methodName: "restart",
    initCommand: function(action) {}
});

CommandManager.registerCommand("RESTART", RestartCommand);

var SetCommand = Command.extend({
    _name: "SET",
    invoke: function(action) {
        var plugin = this.getPluginObject();
        plugin && "set" == plugin._type ? plugin.setParamValue(action) : plugin && plugin.setPluginParamValue(action);
    }
});

CommandManager.registerCommand("SET", SetCommand);

var ShowCommand = Command.extend({
    _name: "SHOW",
    _methodName: "show",
    initCommand: function(action) {}
});

CommandManager.registerCommand("SHOW", ShowCommand);

var ShowHTMLElementsCommand = Command.extend({
    _name: "SHOWHTMLELEMENTS",
    _isPluginAction: !1,
    invoke: function(action) {
        CommandManager.displayAllHtmlElements(!0);
    }
});

CommandManager.registerCommand("SHOWHTMLELEMENTS", ShowHTMLElementsCommand);

var StartGenieCommand = Command.extend({
    _name: "STARTGENIE",
    _isPluginAction: !1,
    invoke: function(action) {
        TelemetryService._gameData.id != packageName && TelemetryService._gameData.id != packageNameDelhi ? (TelemetryService.end(TelemetryService._gameData.id), 
        setTimeout(function() {
            exitApp();
        }, 500)) : exitApp();
    }
});

CommandManager.registerCommand("STARTGENIE", StartGenieCommand);

var StartRecordCommand = Command.extend({
    _name: "STARTRECORD",
    _isPluginAction: !1,
    invoke: function(action) {
        RecorderManager.startRecording(action);
    }
});

CommandManager.registerCommand("STARTRECORD", StartRecordCommand);

var StopCommand = Command.extend({
    _name: "STOP",
    _stopMethod: "stop",
    _stopAllMethod: "stopAll",
    invoke: function(action) {
        var plugin = this.getPluginObject();
        void 0 === plugin && (plugin = AudioManager), !0 === action.sound ? AudioManager[this._stopAllMethod](action) : plugin[this._stopMethod](action);
    }
});

CommandManager.registerCommand("STOP", StopCommand);

var StopRecordCommand = Command.extend({
    _name: "STOPRECORD",
    _isPluginAction: !1,
    invoke: function(action) {
        RecorderManager.stopRecording(action);
    }
});

CommandManager.registerCommand("STOPRECORD", StopRecordCommand);

var TogglePlayCommand = Command.extend({
    _name: "TOGGLEPLAY",
    _methodName: "togglePlay",
    _isAsync: !0,
    invoke: function(action) {
        var plugin = this.getPluginObject();
        void 0 === plugin && (plugin = AudioManager), plugin[this._methodName](action);
    }
});

CommandManager.registerCommand("TOGGLEPLAY", TogglePlayCommand);

var ToggleShadowCommand = Command.extend({
    _name: "TOGGLESHADOW",
    _methodName: "toggleShadow",
    initCommand: function(action) {}
});

CommandManager.registerCommand("TOGGLESHADOW", ToggleShadowCommand);

var ToggleShowCommand = Command.extend({
    _name: "TOGGLESHOW",
    _methodName: "toggleShow",
    initCommand: function(action) {}
});

CommandManager.registerCommand("TOGGLESHOW", ToggleShowCommand);

var TransitionToCommand = Command.extend({
    _name: "TRANSITIONTO",
    _methodName: "transitionTo",
    initCommand: function(action) {}
});

CommandManager.registerCommand("TRANSITIONTO", TransitionToCommand);

var UnblurCommand = Command.extend({
    _name: "UNBLUR",
    _methodName: "unblur",
    initCommand: function(action) {}
});

CommandManager.registerCommand("UNBLUR", UnblurCommand);

var WindowEventCommand = Command.extend({
    _name: "WINDOWEVENT",
    _isPluginAction: !1,
    invoke: function(action) {
        var mimeType = GlobalContext.previousContentMimeType ? GlobalContext.previousContentMimeType : GlobalContext.currentContentMimeType;
        GlobalContext.previousContentMimeType || COLLECTION_MIMETYPE == mimeType ? window.location.hash = "#/content/list/" + GlobalContext.previousContentId : CONTENT_MIMETYPES.indexOf(mimeType) > -1 ? window.location.hash = "#/show/content/" + GlobalContext.currentContentId : console.warn("Invalid mimeType to handle WINDOWEVENT:", mimeType);
    }
});

CommandManager.registerCommand("WINDOWEVENT", WindowEventCommand);
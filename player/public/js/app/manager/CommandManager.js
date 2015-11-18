CommandManager = {
    audioActions: ['PLAY', 'PAUSE', 'STOP', 'TOGGLEPLAY', 'EXTERNAL', 'WINDOWEVENT', 'STARTGENIE'],
    handle: function(action) {
        var cmd = '';
        if (_.isString(action.command))
            cmd = (action.command).toUpperCase();
        var plugin = PluginManager.getPluginObject(action.asset);
        if (!_.contains(CommandManager.audioActions, cmd)) {
            if (!plugin) {
                PluginManager.addError('Plugin not found for action - ' + JSON.stringify(action));
                return;
            }
        }
        switch (cmd) {
            case 'PLAY':
                if (plugin && plugin._type == 'sprite') {
                    plugin.play(action.animation);
                } else {
                    AudioManager.play(action);
                }
                break;
            case 'PAUSE':
                if (plugin && plugin._type == 'sprite') {
                    plugin.pause();
                } else {
                    AudioManager.pause(action);
                }
                break;
            case 'STOP':
                if (plugin && plugin._type == 'sprite') {
                    plugin.stop();
                } else {
                    if (action.sound === true) {
                        AudioManager.stopAll(action);
                    } else {
                        AudioManager.stop(action);
                    }
                }
                break;
            case 'TOGGLEPLAY':
                if (plugin && plugin._type == 'sprite') {
                    plugin.togglePlay(action.animation);
                } else {
                    AudioManager.togglePlay(action);
                }
                break;
            case 'SHOW':
                if (plugin) plugin.show(action);
                break;
            case 'HIDE':
                if (plugin) plugin.hide(action);
                break;
            case 'TOGGLESHOW':
                if (plugin) plugin.toggleShow(action);
                break;
            case 'TRANSITIONTO':
                if (plugin) plugin.transitionTo(action);
                break;
            case 'EVENT':
                EventManager.dispatchEvent(action.asset, action.value);
                break;
            case 'TOGGLESHADOW':
                if (plugin) plugin.toggleShadow();
                break;
            case 'WINDOWEVENT':
                if(GlobalContext.config.appInfo && GlobalContext.config.appInfo.code 
                    && GlobalContext.config.appInfo.code != GlobalContext.game.id) {
                    window.location.hash = "#/show/content";
                } else {
                    window.location.hash = action.href;
                }
                break;
            case 'EXTERNAL': 
                if(action.href) 
                    window.open(action.href, "_system"); 
                else 
                    startApp(action.app);                                
                break;
            case 'EVAL':
                if (plugin) plugin.evaluate(action);
                break;
            case 'RELOAD':
                if (plugin) plugin.reload(action);
                break;
            case 'RESTART':
                if (plugin) plugin.restart(action);
                break;
            case 'SET':
                if (plugin) plugin.setParam(action.param, action['param-value'], action.scope);
                break;
            case 'STARTGENIE':
                if(TelemetryService._gameData.id != packageName && TelemetryService._gameData.id != packageNameDelhi) {
                    console.log('Current game is:', TelemetryService._gameData.id, 'so, ending it first.');
                    TelemetryService.end(TelemetryService._gameData.id);
                    setTimeout(function() {
                        exitApp();
                    }, 500);
                } else {
                    exitApp();
                }
                
                break;
            case 'STARTRECORD':
                if (plugin) RecorderManager.startRecording(action);
                break;
            case 'STOPRECORD':
                if (plugin) RecorderManager.stopRecording(action);
                break;
            default:
                console.log("Command '" + cmd +"' not found.");
        }
    }
}
CommandManager = {
    audioActions: ['play', 'pause', 'stop', 'togglePlay', 'external', 'windowEvent'],
    handle: function(action) {
        var plugin = PluginManager.getPluginObject(action.asset);
        if (!_.contains(CommandManager.audioActions, action.command)) {
            if (!plugin) {
                PluginManager.addError('Plugin not found for action - ' + JSON.stringify(action));
                return;
            }
        }
        //var choice = (action.command).toLowerCase();
        switch (action.command) {
            case 'play':
                if (plugin && plugin._type == 'sprite') {
                    plugin.play(action.animation);
                } else {
                    AudioManager.play(action);
                }
                break;
            case 'pause':
                if (plugin && plugin._type == 'sprite') {
                    plugin.pause();
                } else {
                    AudioManager.pause(action);
                }
                break;
            case 'stop':
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
            case 'togglePlay':
                if (plugin && plugin._type == 'sprite') {
                    plugin.togglePlay(action.animation);
                } else {
                    AudioManager.togglePlay(action);
                }
                break;
            case 'show':
                if (plugin) plugin.show(action);
                break;
            case 'hide':
                if (plugin) plugin.hide(action);
                break;
            case 'toggleShow':
                if (plugin) plugin.toggleShow(action);
                break;
            case 'transitionTo':
                if (plugin) plugin.transitionTo(action);
                break;
            case 'event':
                EventManager.dispatchEvent(action.asset, action.value);
                break;
            case 'toggleShadow':
                if (plugin) plugin.toggleShadow();
                break;
            case 'windowEvent':
                if(GlobalContext.config.appInfo && GlobalContext.config.appInfo.code 
                    && GlobalContext.config.appInfo.code != GlobalContext.game.id) {
                    window.location.hash = "#/show/content";
                } else {
                    window.location.hash = action.href;
                }
                break;
            case 'external': 
                if(action.href) 
                    window.open(action.href, "_system"); 
                else 
                    startApp(action.app);                                
                break;
            case 'eval':
                if (plugin) plugin.evaluate(action);
                break;
            case 'reload':
                if (plugin) plugin.reload(action);
                break;
            case 'restart':
                if (plugin) plugin.restart(action);
                break;
            case 'set':
                if (plugin) plugin.setParam(action.param, action.value, action.scope);
                break;
            case 'startGenie':
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
            default:
                console.log("Command not found.");
        }
    }
}
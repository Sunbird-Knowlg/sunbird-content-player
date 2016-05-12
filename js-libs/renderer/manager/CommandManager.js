CommandManager = {
    // TODO: Change the name 'audioActions'. It is no more valid.
    audioActions: ['PLAY', 'PAUSE', 'STOP', 'TOGGLEPLAY', 'EXTERNAL', 'WINDOWEVENT', 'STARTGENIE', 'SHOWHTMLELEMENTS', 'HIDEHTMLELEMENTS'],
    handle: function(action) {
        var cmd = '';
        if (_.isString(action.command))
            cmd = (action.command).toUpperCase();

        var assetId = action.asset;
        if (action['asset-model']) {
            var stagePlugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
            assetId = stagePlugin.getModelValue(action['asset-model']);
            action.asset = assetId;
        } else if (action['asset-param']) {
            var stagePlugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
            assetId = stagePlugin.getParam(action['asset-param']);
            action.asset = assetId;
        }
        if (!assetId && action.pluginObj) {
            action.asset = assetId = action.pluginObj.getPluginParam(action['asset-param']);
        }

        var plugin = PluginManager.getPluginObject(assetId);
        if (action.parent === true && plugin._parent){
            plugin = plugin._parent;
        }
        if (!plugin) {
            plugin = action.pluginObj;
        }
        if (!_.contains(CommandManager.audioActions, cmd)) {
            if (!plugin) {
                PluginManager.addError('Plugin not found for action - ' + JSON.stringify(action));
                return;
            }
        }
        CommandManager._setDataAttributes(action);

        switch (cmd) {
            case 'ERASE':
                plugin.clear();
                break;
            case 'PLAY':
                if (plugin) {
                    plugin.play(action);
                } else {
                    AudioManager.play(action);
                }
                break;
            case 'PAUSE':
                if (plugin) {
                    plugin.pause(action);
                } else {
                    AudioManager.pause(action);
                }
                break;
            case 'STOP':
                if (action.sound === true) {
                    //this is to stop all audios playing
                    createjs.Sound.stop();
                }   
                if (plugin) {                    
                    plugin.stop(action);
                } else {
                    AudioManager.stop(action);                    
                }
                break;
            case 'TOGGLEPLAY':
                if (plugin) {
                    plugin.togglePlay(action);
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
                // TODO: remove the dependency on GlobalContext for this command.
                var mimeType = GlobalContext.config.appInfo.mimeType;
                if (COLLECTION_MIMETYPE == mimeType) {
                    window.location.hash = "#/content/list/"+ GlobalContext.game.id;
                } else if (CONTENT_MIMETYPES.indexOf(mimeType) > -1) {
                    window.location.hash = "#/show/content";
                } else {
                    console.warn("Invalid mimeType to handle WINDOWEVENT:", mimeType);
                }
                break;
            case 'EXTERNAL': 
                if(action.href) 
                    window.open(action.href, "_system"); 
                else 
                    startApp(action.app);                                
                break;
            case 'EVAL':
                if (plugin){
                    if(action.htmlEval){
                        //This is to suppress evalution action generating by ECML content
                        plugin.evaluate(action);
                    }                   
                } 
                break;
            case 'RELOAD':
                if (plugin) plugin.reload(action);
                break;
            case 'RESTART':
                if (plugin) plugin.restart(action);
                break;
            case 'REFRESH':
                if (plugin) plugin.refresh(action);
                break;
            case 'SET':
                if (plugin && plugin._type == 'set') {
                    plugin.setParamValue(action);
                } else if (plugin) {
                    plugin.setPluginParamValue(action);
                }
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
                console.log("STOPRECORD command called.")
                if (plugin) RecorderManager.stopRecording(action);
                break;
            case 'PROCESSRECORD':
                if (plugin) RecorderManager.processRecording(action);
                break;
            case 'BLUR':
                if (plugin) plugin.blur();
                break;
            case 'UNBLUR':
                if (plugin) plugin.unblur();
                break; 
            case 'CUSTOM':
                if (plugin && action.invoke) plugin[action.invoke](action);
                break;
            case 'SHOWHTMLELEMENTS':
                CommandManager.displayAllHtmlElements(true);
                break;
            case 'HIDEHTMLELEMENTS':
                CommandManager.displayAllHtmlElements(false);
                break;
            default:
                console.log("Command '" + cmd +"' not found.");
        }
    },
    _setDataAttributes: function(action) {
        var dataAttributes = {};
        var keys = _.keys(action);
        keys.forEach(function(key) {
            var lowerKey = key.toLowerCase();
            if (lowerKey.substring(0,5) == "data-") {
                dataAttributes[lowerKey.replace("data-","")] = action[key];
            }
        });
        action.dataAttributes = dataAttributes;
        action.stageId = Renderer.theme._currentStage;
    },
    displayAllHtmlElements: function(visibility){
       var elements = jQuery('#'+Renderer.divIds.gameArea).children();
       elements.each(function(){
           //If child element is not canvas item, then hide it
           if(!(jQuery(this).is("canvas"))){
                if (visibility) {
                    jQuery(this).show();     
                } else {
                    jQuery(this).hide();
                }
               
           }
       });
   }
}

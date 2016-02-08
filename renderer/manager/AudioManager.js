AudioManager = {
    instances: {},
    // creating unique id for each audio instance using stageId.
    uniqueId: function(action) {
        return action.stageId + ':' + action.asset;
    },
    play: function(action, instance) {
        instance = instance || AudioManager.instances[AudioManager.uniqueId(action)] || {};
        if(instance.object) {
            if(instance.object.paused) {
                instance.object.paused = false;
            } else if([createjs.Sound.PLAY_FINISHED, createjs.Sound.PLAY_INTERRUPTED, createjs.Sound.PLAY_FAILED].indexOf(instance.object.playState) !== -1) {
                instance.object.play();
            }
        } else {
            instance.object = createjs.Sound.play(action.asset, {interrupt:createjs.Sound.INTERRUPT_ANY});
            instance._data = {id: AudioManager.uniqueId(action)};
            AudioManager.instances[AudioManager.uniqueId(action)] = instance;
            AssetManager.addStageAudio(Renderer.theme._currentStage, action.asset);
        }        
        EventManager.processAppTelemetry(action, 'LISTEN', instance, {subtype : "PLAY"});
    },
    togglePlay: function(action) {
        var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
        if(instance.object) {
            if(instance.object.playState === createjs.Sound.PLAY_FINISHED || instance.object.paused) {
                AudioManager.play(action, instance);    
            } else if (!instance.object.paused) {
                AudioManager.pause(action, instance);
            }
        } else {
            AudioManager.play(action, instance);
        }
    },
    pause: function(action, instance) {
        instance = instance || AudioManager.instances[AudioManager.uniqueId(action)];
        if(instance.object && instance.object.playState === createjs.Sound.PLAY_SUCCEEDED) {
            instance.object.paused = true;
            EventManager.processAppTelemetry(action, 'PAUSE_LISTENING', instance, {subtype : "PAUSE"});
        }
    },
    stop: function(action) {
        var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
        if(instance.object && instance.object.playState !== createjs.Sound.PLAY_FINISHED) {
            instance.object.stop();
            EventManager.processAppTelemetry(action, 'STOP_LISTENING', instance, {subtype : "STOP"});
        }
    },
    stopAll: function(action) {
        createjs.Sound.stop();
        EventManager.processAppTelemetry(action, 'STOP_ALL_SOUNDS',instance, {subtype : "STOP_ALL"});
    },
    destroy: function(stageId, assetId) {
        var soundId = AudioManager.uniqueId({stageId: stageId, asset: assetId});
        var instance = AudioManager.instances[soundId] || {};
        if(instance.object) {
            try {
                instance.object.destroy();
            } catch(err) {
                console.log('Error', err);
            }
            instance.object = undefined;
            instance.state = undefined;
            delete AudioManager.instances[soundId];
        }
    }
}
AudioManager = {
    instances: {},
    MAX_INSTANCES: 10,
    muted: false,
    // creating unique id for each audio instance using stageId.
    uniqueId: function(action) {
        return action.stageId + ':' + action.asset;
    },
    play: function(action, instance) {

        if (("undefined" != typeof action) && ("undefined" != typeof action.asset) && (null != action.asset)) {
            instance = instance || AudioManager.instances[AudioManager.uniqueId(action)] || {};
            if (instance.object) {
                instance.object.volume = 1;
                if (instance.object.paused) {
                    instance.object.paused = false;
                } else if ([createjs.Sound.PLAY_FINISHED, createjs.Sound.PLAY_INTERRUPTED, createjs.Sound.PLAY_FAILED].indexOf(instance.object.playState) !== -1) {
                    instance.object.play();
                }
                instance.object.muted = this.muted;
            } else {
                // Reclaim a space if necessary
                AudioManager.reclaim();
                // Instantiate the current audio to play
                instance.object = createjs.Sound.play(action.asset, {
                    interrupt: createjs.Sound.INTERRUPT_ANY
                });
                instance.object.muted = this.muted;
                instance._data = {
                    id: AudioManager.uniqueId(action)
                };
                AudioManager.instances[AudioManager.uniqueId(action)] = instance;
                AssetManager.addStageAudio(Renderer.theme._currentStage, action.asset);
            }
            if (createjs.Sound.PLAY_FAILED != instance.object.playState) {
                EventManager.processAppTelemetry(action, 'LISTEN', instance, {
                    subtype: "PLAY"
                });
                instance.object.on("complete", function() {
                    if ("undefined" != typeof action.cb)
                        action.cb({
                            "status": "success"
                        });
                }, action);
            } else {
                delete AudioManager.instances[AudioManager.uniqueId(action)];
                console.info("Audio with 'id :" + action.asset + "' is not found..")

            }
            return instance;
        } else {
            console.warn("Asset is not given to play.", action);
            return {};
        }
    },
    togglePlay: function(action) {
        if (("undefined" != typeof action) && ("undefined" != typeof action.asset) && (null != action.asset)) {
            var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
            if (instance && instance.object) {
                if (instance.object.playState === createjs.Sound.PLAY_FINISHED || instance.object.paused) {
                    AudioManager.play(action, instance);
                } else if (!instance.object.paused) {
                    AudioManager.pause(action, instance);
                }
            } else {
                AudioManager.play(action, instance);
            }
        } else {
            console.warn("Asset is not given to toggle play.", action);
        }
    },
    pause: function(action, instance) {
        if (("undefined" != typeof action) && ("undefined" != typeof action.asset) && (null != action.asset)) {
            instance = instance || AudioManager.instances[AudioManager.uniqueId(action)];
            if (instance && instance.object && instance.object.playState === createjs.Sound.PLAY_SUCCEEDED) {
                instance.object.paused = true;
                EventManager.processAppTelemetry(action, 'LISTEN', instance, {
                    subtype: "PAUSE"
                });
            }
        } else {
            console.warn("Asset is not given to toggle pause.", action);
        }
    },
    stop: function(action) {
        var instance = AudioManager.instances[AudioManager.uniqueId(action)] || {};
        if (instance && instance.object && instance.object.playState !== createjs.Sound.PLAY_FINISHED) {
            instance.object.volume = 0; // This is to handle overlapping of audio's in marshmallow
            instance.object.stop();
            EventManager.processAppTelemetry(action, 'LISTEN', instance, {
                subtype: "STOP"
            });
        }
    },
    stopAll: function(action) {
        for (var data in AudioManager.instances) {
            // This is to handle overlapping of audio's in marshmallow
            AudioManager.instances[data].object.volume = 0
        }
        createjs.Sound.stop();
        if (action) {
            EventManager.processAppTelemetry(action, 'LISTEN', '', {
                subtype: "STOP_ALL"
            });
        }
    },
    reclaim: function() {
        // On devices, audio stops playing after resource limit is reached
        // To handle this case, we are clearing any old audio instance
        // We are clearing the first instance in the audio
        // Ideally we should check if that audio is not playing currently before destroying it
        // TODO - Check and fix later

        var keys = _.keys(AudioManager.instances);
        if (keys.length > AudioManager.MAX_INSTANCES) {
            for (index in keys) {
                var key = keys[index];
                var instance = AudioManager.instances[key];
                // Reclaim only if the audio is not playing
                if (instance && instance.object.playState != createjs.Sound.PLAY_INITED && instance.object.playState != createjs.Sound.PLAY_SUCCEEDED) {
                    AudioManager.destroyObject(instance, key);
                    break;
                }
            }
        }
        // If all audios were playing, then nothing will get reclaimed.
        // But this is an issue anyway because you can't have 10+ audios playing concurrently.
    },
    destroy: function(stageId, assetId) {
        var soundId = AudioManager.uniqueId({
            stageId: stageId,
            asset: assetId
        });
        var instance = AudioManager.instances[soundId] || {};
        AudioManager.destroyObject(instance, soundId);
    },
    destroyObject: function(instance, soundId) {
        if (instance.object) {
            try {
                instance.object.destroy();
            } catch (err) {
                console.log('Error', err);
            }
            instance.object = undefined;
            instance.state = undefined;
            delete AudioManager.instances[soundId];
        }
    },
    cleanUp: function() {
        AudioManager.instances = {};
    },
    mute: function() {
        this.muted = true;
        if (!_.isEmpty(AudioManager.instances)) {
            _.map(_.pluck(_.values(AudioManager.instances), "object"), function(obj) {
                obj.muted = true;
                return obj
            })
        }
    },
    unmute: function() {
        this.muted = false;
        if (!_.isEmpty(AudioManager.instances)) {
            _.map(_.pluck(_.values(AudioManager.instances), "object"), function(obj) {
                obj.muted = false;
                return obj
            })
        }
    }
}

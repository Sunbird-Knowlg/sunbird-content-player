var AudioPlugin = Plugin.extend({
    _type: 'audio',
    _isContainer: false,
    _id: undefined,
    _state: 'stop',
    _render: false,
    initPlugin: function(data) {
        this._id = data.asset;
    },
    play: function(action) {
        AudioManager.play(action);
    },
    togglePlay: function(action) {
       AudioManager.togglePlay(action);
    },
    pause: function(action) {
       AudioManager.pause(action);

    },
    stop: function(action) {
        if (action.sound === true) {
            AudioManager.stopAll(action);
        } else {
            AudioManager.stop(action);
        }
    },
    stopAll: function(action) {
        AudioManager.stopAll(action);
    }

});
PluginManager.registerPlugin('audio', AudioPlugin);
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
        // this.stageId = this._stage._id;
        // EventManager.processAppTelemetry(action, 'LISTEN', this, {subtype : "PLAY"});
        // if(this._state == 'paused') {
        //     this._self.paused = false;
        //     this._state = 'play';
        // } else if(this._self) {
        //     this._state = 'play';
        //     this._self.play();
        // } else {
        //     this._state = 'play';
        //     var instance = this;
        //     this._self = createjs.Sound.play(this._id);
        //     this._self.on("complete", function() {
        //         instance._state = 'stop';
        //     });
        // }
    },
    togglePlay: function(action) {
       AudioManager.togglePlay(action);

        // if(this._state == 'play') {
        //     this.pause(action);
        // } else {
        //     this.play(action);
        // }
    },
    pause: function(action) {
        
        AudioManager.pause(action);
        // if(this._state == 'play') {
        //     this._self.paused = true;
        //     this._state = 'paused';
        //     this.stageId = this._stage._id;
        //     // EventManager.processAppTelemetry(action, 'PAUSE_LISTENING', this);
        //     EventManager.processAppTelemetry(action, 'LISTEN', this, {subtype : "PAUSE"});
        // }
    },
    stop: function(action) {
        
        if (action.sound === true) {
            AudioManager.stopAll(action);
        } else {
            AudioManager.stop(action);
        }
        // if(this._state == 'play') {
        //     this._self.stop();
        //     this.stageId = this._stage._id;
        //     // EventManager.processAppTelemetry(action, 'STOP_LISTENING', this);
        //     EventManager.processAppTelemetry(action, 'LISTEN', this, {subtype : "STOP"});
        // }
    }

});
PluginManager.registerPlugin('audio', AudioPlugin);
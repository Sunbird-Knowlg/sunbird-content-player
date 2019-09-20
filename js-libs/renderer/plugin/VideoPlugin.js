// Reference:
// http://jsfiddle.net/CaoimhinMac/6BUgL/
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp


/**
 * Plugin to create video element on canvas object using html video element.
 * @class VideoPlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */
var VideoPlugin = Plugin.extend({
    /**
     * This explains the type of the plugin
     * @member {String} _type
     * @memberof VideoPlugin
     */
    _type: 'video',

    /**
     * This expains video should render or not.
     * @member {boolean} _render
     * @memberof VideoPlugin
     */
    _render: true,

    /**
     * This expains data object to the video element .
     * @member {object} _data
     * @memberof VideoPlugin
     */
    _data: undefined,

    /**
     * This explains instance of video plugin .
     * @member {object} _instance
     * @memberof VideoPlugin
     */
    _instance: undefined,

    /**
     * This expains default start of the video plugin,
     * After loading video frames to play the video element on canvas.
     * @member {integer} _defaultStart.
     * @memberof VideoPlugin
     */
    _defaultStart: 50,
    /**
     *   Invoked by framework when plugin instance created/renderered on stage.
     *   Use this plugin to create video element on canvas.
     *   @param data {object} data is input object for the video plugin.
     *   @memberof VideoPlugin
     *   @override
     */

    _replayIcon: 'assets/icons/video_replay.png',
    isStreaming: false,

    initPlugin: function(data) {
        this._data = data;
        this._data.muted = AudioManager.muted ? true : this._data.muted;
        if (this._data) {
            if (_.isUndefined(this._data.autoplay)) this._data.autoplay = true;
            if (_.isUndefined(this._data.controls)) this._data.controls = false;
        }

        _instance = this;
        _instance.loadVideo(data);
    },
    loadVideo: function(data) {
        if (!data.asset) return false;
        var lItem = this.createVideoElement();
        var videoEle = this.getVideo();
        if(!this.isStreaming) videoEle.load();
        this.registerEvents();
        this._self = new createjs.Bitmap(lItem);
        if (data.autoplay == true) {
            this.play();
        }
    },

    /**
     *   Use this method to register any event on video element.
     *   @memberof VideoPlugin
     */
    registerEvents: function() {
        var videoEle = this.getVideo();
        jQuery(videoEle).bind('play', this.handleTelemetryLog);
        jQuery(videoEle).bind('pause', this.handleTelemetryLog);
        jQuery(videoEle).bind("error", this.logConsole);
        jQuery(videoEle).bind("abort", this.logConsole);
        jQuery(videoEle).bind("loadeddata", this.onLoadData);
        jQuery(videoEle).bind('ended', this.showReplay);
        EkstepRendererAPI.addEventListener('renderer:overlay:mute', this.muteAll, this);
        EkstepRendererAPI.addEventListener('renderer:overlay:unmute', this.unmuteAll, this);
    },

    /**
     *   Use this method to Generate Telemetry  based on the events (e.g PLAY, PAUSE, STOP).
     *   @memberof VideoPlugin
     */
    handleTelemetryLog: function(event) {
        var action = {},
            videoEle = event.target;
        action.asset = videoEle.id;
        action.stageId = Renderer.theme._currentStage;
        if (event.type === 'pause') {
            event.type = videoEle.currentTime > 0 ? 'pause' : 'stop';
            if (!videoEle.ended) {
                _instance.sendTelemeteryData(action, event.type)
            }
        }
        if (event.type === 'play') {
            if (!videoEle.autoplay) {
                _instance.sendTelemeteryData(action, event.type);
            }
            videoEle.autoplay = undefined;
        }
    },
    onLoadData: function() {
        if (_instance.autoplay == true) {
            _instance.play();
        }
    },
    logConsole: function(e) {
        console.warn("This video has", e);
    },
    sendTelemeteryData: function(action, subType) {
        if (action)
            EventManager.processAppTelemetry(action, 'OTHER', this._instance, {
                subtype: subType.toUpperCase()
            });
    },

    /**
     *   Use this method to play the video element on stage.
     *   By passing action object from from the play command.
     *   @param action {object} action is input object for the video to play.
     *   @memberof VideoPlugin
     */
    play: function(action) {
        var videoEle = this.getVideo(action);
        videoEle.paused && videoEle.readyState > 2 ? this.start(videoEle) : console.warn('Video is not ready to play', videoEle.readyState);
    },

    /**
     *   Use this method to pause the video element on stage.
     *   By passing action object from from the pause command.
     *   @param action {object} action is input object for the video to pause.
     *   @memberof VideoPlugin
     */
    pause: function(action) {
        var videoEle = this.getVideo(action);
        !_.isUndefined(videoEle) ? videoEle.pause() : console.info("video pause failed");
    },

    /**
     *   Use this method to stop the video element on stage.
     *   By passing action object from from the pause command.
     *   @param action {object} action is input object for the video to stop.
     *   @memberof VideoPlugin
     */
    stop: function(action) {
        var videoEle = this.getVideo(action);
        videoEle.pause();
        videoEle.currentTime = 0;
    },

    /**
     *   Use this method to replay the video element on stage.
     *   @memberof VideoPlugin
     */
    replay: function() {
        var videoEle = this.getVideo();
        videoEle.currentTime = 0;
        this.play();
    },
    start: function(videoEle) {
        var delay = _.isUndefined(this._data.delay) ? this._defaultStart : this._data.delay;
        this._data.delay = this._defaultStart;
        setTimeout(function() {
            videoEle.play();
        }, delay);
    },
    getVideo: function(action) {
        if (!_.isUndefined(action)) {
            return document.getElementById(action.asset);
        } else {
            return document.getElementById(this._data.asset);
        }
    },

    /**
     *   Use this method to set default style to any video element.
     *   @memberof VideoPlugin
     */
    setVideoStyle: function(jqVideoEle) {
        var dims = this.relativeDims();
        jQuery(jqVideoEle).attr("id", this._data.asset)
            .prop({
                autoplay: this._data.autoplay,
                muted: this._data.muted,
                controls: this._data.controls,
                width: dims.w,
                height: dims.h
            })
            .css({
                position: 'absolute',
                left: dims.x + "px",
                top: dims.y + "px",
                "display": 'block'
            });
    },

    /**
     *   Use this method to add video element canvas gameArea.
     *   @memberof VideoPlugin
     */
    addVideoElement: function(jqVideoEle) {
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));
        var videoEle = this.getVideo();
        var div = document.getElementById('gameArea');
        div.insertBefore(videoEle, div.childNodes[0]);
    },

    /**
     *   Use this method to create a video element.
     *  It will load the video asset and will create the video element if the loading of asset is failed.
     *   @memberof VideoPlugin
     */
    createVideoElement: function() {
        // User has to long press to play/pause or mute/unmute the video in mobile view. 
        // TO fix this problem we are removing the tap events of the videoJs library.
        // link:- https://github.com/videojs/video.js/issues/6222
        videojs.getComponent('Component').prototype.emitTapEvents = function () {};
        var videoAsset;
        videoAsset = this._theme.getAsset(this._data.asset);

        // Check for streamingUrl of the asset
        var asset;
        if (!_.isUndefined(window.content.assetsMap)) {
            asset = _.findWhere(window.content.assetsMap, {
                identifier: this._data.asset
            });
            if (asset && asset.streamingUrl) {
                videoAsset = asset.streamingUrl
                this.isStreaming = true
            }
        }
        if(this.isStreaming){
            var dims = this.relativeDims();
            var src = videoAsset;
            videoAsset = document.createElement("video");
            videoAsset.style.width = dims.w + "px",
            videoAsset.style.height = dims.h + "px",
            videoAsset.style.position = 'absolute',
            videoAsset.style.left = dims.x + "px",
            videoAsset.style.top = dims.y + "px",
            videoAsset.controls = this._data.controls,
            videoAsset.autoplay = this._data.autoplay,
            videoAsset.muted = this._data.muted;
            videoAsset.className = 'video-js vjs-default-skin';
            videoAsset.id = this._data.asset
            jQuery(videoAsset).insertBefore("#gameArea");
            var source = document.createElement("source");
            source.src = src
            source.type = "application/x-mpegURL"
            videoAsset.appendChild(source);
            if (videojs.getPlayers()[this._data.asset]) {
                delete videojs.getPlayers()[this._data.asset];
            }
            var videoPlayer = videojs(this._data.asset, {
                "controls": this._data.controls,
                "autoplay": this._data.autoplay,
                "preload": "auto",
                inactivityTimeout: 0
            });
            videojs(videoAsset.id).ready(function() {
                var videoItem = document.getElementById(videoAsset.id);
                videoItem.style.width = '100%';
                videoItem.style.height = '100%';
                videoItem.style.top = 0;
                videoItem.style.left = 0;
            });
            this.addVideoElement(videoPlayer);
            return videoPlayer
        }

        if (videoAsset instanceof HTMLElement == false) {
            var src = videoAsset;
            videoAsset = document.createElement("video");
            videoAsset.src = src;
            videoAsset.addEventListener('timeupdate', function(){
                //set controls settings to controls,this make controls show everytime this event is triggered
                videoAsset.setAttribute("controls","controls");
            }, false);
        }
        var jqVideoEle = jQuery(videoAsset).insertBefore("#gameArea");
        !_.isUndefined(this._data.type) ? jQuery(jqVideoEle).attr("type", this._data.type) : console.warn("Video type is not defined");
        this.setVideoStyle(jqVideoEle);
        this.addVideoElement(jqVideoEle);
        var videoEle = this.getVideo();
        return new createjs.Bitmap(videoEle);
    },
    showReplay: function(event) {
        try {
            var dims = _instance.getRelativeDims(org.ekstep.pluginframework.pluginManager.pluginInstances[event.target.id]._data);
            var img = document.createElement('img');
            var replay_id = 'replay_' + event.target.id;
            jQuery(img).attr({src: _instance._replayIcon, id: replay_id });
            _instance.disableBackground(event.target.id, true);
            if (_.isNull(document.getElementById(replay_id))) { jQuery(img).insertAfter("#" + _instance.id); }
            !window.screenTop && !window.screenY ? _instance.onFullScreen(event) : _instance.onNormalScreen(event);
            jQuery('#' + replay_id).bind('click', _instance.hideReplay);
        } catch (e) {
            console.warn("video fails to show the poster", e);
        }
    },
    setReplayIconStyle: function(elementId, CustomStyleObj) {
        jQuery('#'+elementId).css(CustomStyleObj);
    },
    hideReplay: function(event) {
        var vidoeId = event.target.id.replace("replay_", "");
        _instance.disableBackground(vidoeId, false);
        document.getElementById(vidoeId).play();
        jQuery("#" + event.target.id).css('display', 'none');
    },
    disableBackground: function(id, flag) {
        if (flag) {
            jQuery('#' + id).css({'opacity': '0.4', "pointer-events": "none"});
        } else {
            jQuery('#' + id).css({'opacity': '1', "pointer-events": " "});
        }
    },
    onFullScreen: function(event) {
        var replay_id = 'replay_' + event.target.id;
        var element = document.getElementById(event.target.id);
        var positionInfo = element.getBoundingClientRect();
        _instance.setReplayIconStyle(replay_id, {width: "100px", height: "100px", "z-index": "55555555555", position: "absolute", "top": positionInfo.height / 2, "left": positionInfo.width / 2, "display": "block"})
    },
    onNormalScreen: function(event) {
        var replay_id = 'replay_' + event.target.id;
        var dims = _instance.getRelativeDims(org.ekstep.pluginframework.pluginManager.pluginInstances[event.target.id]._data);
        var top = dims.y + (dims.h / 2 - 40) + "px";
        var left = dims.x + (dims.w / 2 - 30) + "px";
        _instance.setReplayIconStyle(replay_id, {width: "50px", height: "50px", "z-index": "1", position: "absolute", "top": top, "left": left, "display": "block"});
    },
    muteAll: function() {
        var videoElements = document.querySelectorAll('video');
        if (videoElements.length>0) {
               _.each(videoElements, function(videoElem) {
                      videoElem.muted = true;
               })
        }
    },
    unmuteAll: function() {
        var videoElements = document.querySelectorAll('video');
        if (videoElements.length>0) {
               _.each(videoElements, function(videoElem) {
                      videoElem.muted = false;
               })
        }
    }
});
PluginManager.registerPlugin('video', VideoPlugin);

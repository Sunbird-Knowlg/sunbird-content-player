org.ekstep.contentrenderer.baseLauncher.extend({
    _time: undefined,
    messages: {
        noInternetConnection: "Internet not available. Please connect and try again.",
        unsupportedVideo: "Video URL not accessible"
    },
    currentTime: 1,
    videoPlayer: undefined,
    stageId: undefined,
    heartBeatData: {},
    enableHeartBeatEvent: false,
    _constants: {
        mimeType: ["video/x-youtube"],
        events: {
            launchEvent: "renderer:launch:youtube"
        }
    },
    initLauncher: function () {
        EkstepRendererAPI.addEventListener("renderer:launch:youtube", this.start, this);
        EkstepRendererAPI.addEventListener("renderer:overlay:mute", this.onOverlayAudioMute, this);
        EkstepRendererAPI.addEventListener("renderer:overlay:unmute", this.onOverlayAudioUnmute, this);
    },
    start: function () {
        this._super();
        var data = _.clone(content);
        var instance = this;
        this.heartBeatData.stageId = 'youtubestage';
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var youtubeId= this.getYouTubeID(data.artifactUrl);
        if(globalConfigObj.context.origin){
            Url.searchParams.set('origin', globalConfigObj.context.origin);
        }
        this.configOverlay();
        var iframe = document.createElement('iframe');
        iframe.type = 'text/html';
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.src = 'https://sunbirddevtelemetry.blob.core.windows.net/public/player/youtube.html?origin=https://sunbirddevtelemetry.blob.core.windows.net&id='+youtubeId;
        iframe.id = "org.ekstep.youtuberenderer";
        console.log(iframe.src);
        document.getElementById("gameArea").insertBefore(iframe, document.getElementById("gameArea").childNodes[0])
        jQuery("#gameArea").css({
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            marginTop: 0,
            marginLeft: 0
        })
        jQuery("#loading").hide()
        window.addEventListener('message', function(event){
            if(event.type === 'message' && typeof event.data !== 'object'){
                var eventData = JSON.parse(event.data)
                switch (eventData.eid) {
                    case 'paly':
                        instance.play(eventData.time);
                        break;
                    case 'pause':
                        instance.pause(eventData.time);
                        break;
                    case 'seeked':
                        instance.seeked(eventData.time);
                        break;
                    case 'end':
                        instance.ended(eventData.time);
                        break;
                }
            }
        });
        
    },
    logTelemetry: function (type, eksData, eid, options) {
        EkstepRendererAPI.getTelemetryService().interact(type || 'TOUCH', "", "", eksData, eid, options);
    },
    replay: function () {
        if (this.sleepMode) return;
        EkstepRendererAPI.dispatchEvent('renderer:overlay:unmute');
        this.start();
    },
    configOverlay: function () {
        setTimeout(function () {
            EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
            EkstepRendererAPI.dispatchEvent("renderer:next:hide");
            EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
            EkstepRendererAPI.dispatchEvent("renderer:previous:hide");
        }, 100);
    },
    play: function (time) {
        if (time == 0) {
            EkstepRendererAPI.getTelemetryService().navigate('youtubestage', 'youtubestage', {
                "duration": (Date.now() / 1000) - window.PLAYER_STAGE_START_TIME
            });
        }
        var instance = this;
        instance.heartBeatEvent(true);
        instance.progressTimer(true);
        instance.logTelemetry('TOUCH', {
            stageId: 'youtubestage',
            subtype: "PLAY",
            values: [{
                time: time
            }]
        })
    },
    pause: function (time) {
        var instance = this;
        instance.heartBeatEvent(false);
        instance.progressTimer(false);
        instance.logTelemetry('TOUCH', {
            stageId: 'youtubestage',
            subtype: "PAUSE",
            values: [{
                time: time
            }]
        })
    },
    ended: function () {
        var instance = this;
        instance.progressTimer(false);
        instance.logTelemetry('END', {
            stageId: 'youtubestage',
            subtype: "STOP"
        });
        $(".vjs-has-started, .vjs-poster").css("display", "none");
        EkstepRendererAPI.dispatchEvent('renderer:content:end');
    },
    seeked: function (time) {
        var instance = this;

        instance.logTelemetry('TOUCH', {
            stageId: 'youtubestage',
            subtype: "DRAG",
            values: [{
                time: time
            }]
        })
    },
    progressTimer: function (flag) {
        var instance = this;
        if (flag) {
            instance.progressTime = setInterval(function (e) {
                instance.currentTime = instance.currentTime + 1;
            }, 1000);
        }
        if (!flag) {
            clearInterval(instance.progressTime);
        }
    },
    getYouTubeID: function(url){
        var ID = '';
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
        }
        else {
        ID = url;
        }
        return ID;
    }
});

//# sourceURL=YoutubeRenderer.js
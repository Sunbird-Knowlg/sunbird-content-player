/**
 * @description Launcher to render the Video or youtube URL's
 * @extends {class} org.ekstep.contentrenderer.baseLauncher
 */

org.ekstep.contentrenderer.baseLauncher.extend({
    _time: undefined,
    supportedStreamingMimeType:"application/x-mpegURL",
    isStreaming: EkstepRendererAPI.getGlobalConfig().streaming || false,
    currentTime: 1,
    videoPlayer: undefined,
    stageId: undefined,
    heartBeatData:{},
    enableHeartBeatEvent:false,
    _constants: {
        mimeType: ["video/mp4", "video/x-youtube", "video/webm"],	
        events: {	
            launchEvent: "renderer:launch:video"	
        }	
    },	
    initLauncher: function() {	
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
        EkstepRendererAPI.addEventListener("renderer:overlay:mute", this.onOverlayAudioMute, this);
        EkstepRendererAPI.addEventListener("renderer:overlay:unmute", this.onOverlayAudioUnmute, this);
    },
    start: function() {
        this._super();
        var data = _.clone(content);
        this.heartBeatData.stageId = content.mimeType === 'video/x-youtube' ? 'youtubestage' : 'videostage';
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        if (window.cordova || !isbrowserpreview) {
            var prefix_url = globalConfigObj.basepath || '';
            path = prefix_url + "/" + data.artifactUrl;
        } else {
            path = data.artifactUrl;
        }
        this.createVideo(path, data);
        this.configOverlay();
    },
    createVideo: function(path, data) {
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        EkstepRendererAPI.dispatchEvent("renderer:content:start");

        video = document.createElement('video-js');
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.position = 'absolute';
        video.id = "videoElement";
        video.className = 'vjs-default-skin';
        document.body.appendChild(video);

        //Todo need to remove after testing
        //data.artifactUrl = "https://sunbirdspikemedia-inct.streaming.media.azure.net/afcc5a99-d0c4-4ef5-9dfe-dc403a1269fb/learn-colors-with-numbers-in-kid.ism/manifest(format=m3u8-aapl-v3)";
        //data.mimeType = 'application/x-mpegURL';

        if(data.mimeType === "video/x-youtube"){
            this._loadYoutube(data.artifactUrl);
        }else if(this.isStreaming && data.mimeType != "video/x-youtube"){
            data.mimeType = this.supportedStreamingMimeType;
            this._loadVideo(data.artifactUrl, data);
        }else{
            this._loadVideo(path, data);
        }
        
        video.onvolumechange = function() {
            (video.muted) ? EkstepRendererAPI.dispatchEvent('renderer:overlay:mute') : EkstepRendererAPI.dispatchEvent('renderer:overlay:unmute');
        };
        $("video").bind("contextmenu",function() {
            return false;
        });
    },    
    _loadVideo: function(path, data) {
        var instance = this;
        if (instance.isStreaming && !navigator.onLine) {
            EkstepRendererAPI.logErrorEvent('No internet', {
                'type': 'content',
                'action': 'play',
                'severity': 'error'
            });
            instance.throwError({message:'Please connect to internet'});
        }
        var source = document.createElement("source");
        source.src = path;
        source.type = data.mimeType;
        video.appendChild(source);

        if (instance.isStreaming){
            var videoPlayer = videojs('videoElement', {
                "controls": true, "autoplay": true, "preload": "auto"
            });
        }else{
            var videoPlayer = videojs('videoElement', {
            "controls": true, "autoplay": true, "preload": "auto",
            plugins: {
                vjsdownload:{
                beforeElement: 'playbackRateMenuButton',
                textControl: 'Download video',
                name: 'downloadButton'
                }
            }
            } , function() {
                this.on('downloadvideo', function(){
                    EkstepRendererAPI.getTelemetryService().interact("TOUCH", "Download", "TOUCH", {
                        stageId: 'videostage',
                        subtype: ''
                    });
                });
            });
        }
        
        instance.addvideoListeners(videoPlayer);
        instance.videoPlayer = videoPlayer;
    },
    _loadYoutube: function(path) {
        var instance = this;
        if (!navigator.onLine) {
            EkstepRendererAPI.logErrorEvent('No internet', {
                'type': 'content',
                'action': 'play',
                'severity': 'error'
            });
            instance.throwError({message:'Please connect to internet'});
        }
        var vid = videojs("videoElement", {
                "techOrder": ["youtube"],
                "src": path,
                "controls": true, "autoplay": true, "preload": "auto"
            },
            function() {
                $(".vjs-has-started, .vjs-poster").css("display", "none")
            });
        videojs("videoElement").ready(function() {
            var youtubeInstance = this;
            youtubeInstance.src({
                type: 'video/youtube',
                src: path
            });
            instance.addYOUTUBEListeners(youtubeInstance);
            instance.setYoutubeStyles(youtubeInstance);
            instance.videoPlayer = youtubeInstance;
            /*youtubeInstance.on('volumechange', function(){
                (youtubeInstance.muted()) ? EkstepRendererAPI.dispatchEvent('renderer:overlay:mute') : EkstepRendererAPI.dispatchEvent('renderer:overlay:unmute');
            });*/            
        });
    },
    setYoutubeStyles: function(youtube) {
        var instance = this;
        videojs("videoElement").ready(function() {
            var video = document.getElementById("videoElement");
            video.style.width = '100%';
            video.style.height = '100%';
        });
    },
    play: function(stageid, time) {
        var instance = this;
        instance.heartBeatEvent(true);
        instance.progressTimer(true);
        instance.logTelemetry('TOUCH', {
            stageId: stageid,
            subtype: "PLAY",
            values: [{
                time: time
            }]
        })
    },
    pause: function(stageid, time) {
        var instance = this;
        instance.heartBeatEvent(false);
        instance.progressTimer(false);
        instance.logTelemetry('TOUCH', {
            stageId: stageid,
            subtype: "PAUSE",
            values: [{
                time: time
            }]
        })
    },
    ended: function(stageid) {
        var instance = this;
        instance.progressTimer(false);
        instance.logTelemetry('END', {
            stageId: stageid,
            subtype: "STOP"
        });
        EkstepRendererAPI.dispatchEvent('renderer:content:end');
    },
    seeked: function(stageid, time) {
        var instance = this;

        instance.logTelemetry('TOUCH', {
            stageId: stageid,
            subtype: "DRAG",
            values: [{
                time: time
            }]
        })
    },
    addvideoListeners: function(videoPlayer) {
        var instance = this;

        videoPlayer.on("play", function(e) {
            instance.play("videostage", Math.floor(instance.videoPlayer.currentTime())*1000);
        });

        videoPlayer.on("pause", function(e) {
            instance.pause("videostage", Math.floor(instance.videoPlayer.currentTime())*1000);
        });

        videoPlayer.on("ended", function(e) {
            instance.ended("videostage");
        });

        videoPlayer.on("seeked", function(e) {
            instance.seeked("videostage", Math.floor(instance.videoPlayer.currentTime())*1000);
        });

    },
    addYOUTUBEListeners: function(videoPlayer) {
        var instance = this;

        videoPlayer.on('play', function(e) {
            instance.play("youtubestage", Math.floor(videoPlayer.currentTime())*1000);
        });

        videoPlayer.on('pause', function(e) {
            instance.pause("youtubestage", Math.floor(videoPlayer.currentTime())*1000);
        });

        videoPlayer.on('ended', function() {
            instance.ended("youtubestage");
        });
        videoPlayer.on('seeked', function(e) {
            instance.seeked("youtubestage", Math.floor(videoPlayer.currentTime())*1000);
        });
    },
    logTelemetry: function(type, eksData) {
        EkstepRendererAPI.getTelemetryService().interact(type || 'TOUCH', "", "", eksData);
    },
    replay:function(){
        if (this.sleepMode) return;
       EkstepRendererAPI.dispatchEvent('renderer:overlay:unmute');
       this.start();
    },
    configOverlay: function() {
        setTimeout(function() {
            EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
            EkstepRendererAPI.dispatchEvent("renderer:next:hide");
            EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
            EkstepRendererAPI.dispatchEvent("renderer:previous:hide");
        }, 100);
    },
    progressTimer: function(flag) {
        var instance = this;
        if (flag) {
            instance.progressTime = setInterval(function(e) {
                instance.currentTime = instance.currentTime + 1;
            }, 1000);
        }
        if (!flag) {
            clearInterval(instance.progressTime);
        }
    },
    contentProgress: function() {
        var totalDuration = 0;
        if (content.mimeType === 'video/x-youtube') {
            totalDuration = this.videoPlayer.duration();
        } else {
            totalDuration = this.videoPlayer.duration;
        }
        totalDuration = (this.currentTime < totalDuration) ? Math.floor(totalDuration) : Math.ceil(totalDuration);
        return this.progres(this.currentTime, totalDuration);
    },
    onOverlayAudioMute: function() {
        if (!this.videoPlayer) return false
        if (this.videoPlayer.currentType_ === 'video/youtube') {
            if (!this.videoPlayer.muted()) {
                this.videoPlayer.muted(true);
            }
        } else {
            this.videoPlayer.muted = true;
        }
    },
    onOverlayAudioUnmute: function() {
    	if (!this.videoPlayer) return false
        if(this.videoPlayer.currentType_ === 'video/youtube') {
            if (this.videoPlayer.muted()) {
                this.videoPlayer.muted(false);
            }
        } else {
            this.videoPlayer.muted = false;
        }
    },
    cleanUp: function() {
        if (this.sleepMode) return;	
        this.sleepMode = true;
        if (document.getElementById(this.manifest.id)) {
            videojs(this.manifest.id).dispose();
        }
        this.progressTimer(false);
        this.currentTime = 0;
        EkstepRendererAPI.dispatchEvent("renderer:next:show");
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:show');
        EkstepRendererAPI.dispatchEvent("renderer:previous:show");
        EkstepRendererAPI.removeEventListener('renderer:launcher:clean', this.cleanUp, this);
    }
});

//# sourceURL=videoRenderer.js
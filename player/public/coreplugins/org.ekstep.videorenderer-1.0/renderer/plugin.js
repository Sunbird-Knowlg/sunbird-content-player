/**
 * @description Launcher to render the Video or youtube URL's
 * @extends {class} org.ekstep.contentrenderer.baseLauncher
 */

org.ekstep.contentrenderer.baseLauncher.extend({
    _time: undefined,
    currentTime: 1,
    videoPlayer: undefined,
    initialize: function(manifestData) {
        EkstepRendererAPI.addEventListener("renderer:content:replay", this.replayContent, this);
        EkstepRendererAPI.addEventListener("renderer:content:end", this.onContentEnd, this);
        this.start(manifestData);
    },
    start: function(manifestData) {
        var data = _.clone(content);
        this.reset();
        this.launch();
        this.manifestData = manifestData;
        if (window.cordova || !isbrowserpreview) {
            var prefix_url = data.baseDir || '';
            path = prefix_url + "/" + data.artifactUrl;
        } else {
            path = data.artifactUrl;
        }
        this.createVideo(path, data);
        this.configOverlay();
    },
    reset: function() {
        if (document.getElementById("renderer_videos")) {
            videojs('renderer_videos').dispose();
            jQuery('#renderer_videos').remove();
        }
        this.progressTimer(false);
        this.currentTime = 0;
    },
    createVideo: function(path, data) {
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        video = document.createElement('video');
        video.style.width = '100%';
        video.style.height = '100%';
        video.id = "renderer_videos";
        video.controls = true;
        video.autoplay = true;
        video.preload = "auto";
        video.className = 'video-js vjs-default-skin';
        this.adddiv(video);
        EkstepRendererAPI.dispatchEvent("renderer:content:start");
        data.mimeType === 'video/x-youtube' ? this._loadYoutube(data.artifactUrl) : this._loadVideo(path);
    },
    _loadVideo: function(path) {
        var source = document.createElement("source");
        source.src = path;
        video.appendChild(source);
        this.addvideoListeners(video);
        this.videoPlayer = video;
    },
    _loadYoutube: function(path) {
        var instance = this;
        if (!navigator.onLine) {
            EkstepRendererAPI.logErrorEvent('No internet', {
                'type': 'content',
                'action': 'play',
                'severity': 'error'
            });
            showToaster('error', "Please connect to internet");
        }
        var vid = videojs("renderer_videos", {
                "techOrder": ["youtube"],
                "src": path
            },
            function() {
                $(".vjs-has-started, .vjs-poster").css("display", "none")
            });
        videojs('renderer_videos').ready(function() {
            var youtubeInstance = this;
            youtubeInstance.src({
                type: 'video/youtube',
                src: path
            });
            instance.addYOUTUBEListeners(youtubeInstance);
            instance.setYoutubeStyles(youtubeInstance);
            instance.videoPlayer = youtubeInstance;

        });
    },
    setYoutubeStyles: function(youtube) {
        youtube.bigPlayButton.hide().el_.style.display = 'none';
        videojs('renderer_videos').ready(function() {
            var video = document.getElementById("renderer_videos");
            video.style.width = '100%';
            video.style.height = '100%';
        });
    },
    play: function(stageid, time) {
        var instance = this;

        instance.logheartBeatEvent(true);
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

        instance.logheartBeatEvent(false);
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

        instance.logheartBeatEvent(false);
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

        videoPlayer.onplay = function(e) {
            instance.play("videostage", Math.floor(e.timeStamp));
        };

        videoPlayer.onpause = function(e) {
            instance.pause("videostage", Math.floor(e.timeStamp));
        };

        videoPlayer.onended = function(e) {
            instance.ended("videostage");
        };

        videoPlayer.onseeked = function(e) {
            instance.seeked("videostage", Math.floor(e.timeStamp));
        };

    },
    addYOUTUBEListeners: function(videoPlayer) {
        var instance = this;

        videoPlayer.on('play', function(e) {
            instance.play("youtubestage", Math.floor(videoPlayer.currentTime()));
        });

        videoPlayer.on('pause', function(e) {
            instance.pause("youtubestage", Math.floor(videoPlayer.currentTime()));
        });

        videoPlayer.on('ended', function() {
            instance.ended("youtubestage");
        });
        videoPlayer.on('seeked', function(e) {
            instance.seeked("youtubestage", Math.floor(videoPlayer.currentTime()));
        });
    },
    logTelemetry: function(type, eksData) {
        EkstepRendererAPI.getTelemetryService().interact(type || 'TOUCH', "", "", eksData);
    },
    logheartBeatEvent: function(flag) {
        var instance = this;
        var stageId = content.mimeType === 'video/x-youtube' ? 'youtubestage' : 'videostage';
        if (flag) {
            instance._time = setInterval(function() {
                EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", {
                    stageId: stageId
                });
            }, EkstepRendererAPI.getGlobalConfig().heartBeatTime);
        }
        if (!flag) {
            clearInterval(instance._time);
        }
    },
    replayContent: function() {
        this.relaunch();
        this.start();
    },
    adddiv: function(div) {
        jQuery('#htmldiv').insertBefore("#gameArea");
        var gameArea = document.getElementById('gameArea');
        gameArea.insertBefore(div, gameArea.childNodes[0]);
        this.setStyle();
    },
    setStyle: function() {
        jQuery('#gameArea').css({
            left: '0px',
            top: '0px',
            width: "100%",
            height: "100%"
        });
        jQuery('#htmlIframe').css({
            position: 'absolute',
            display: 'block',
            background: 'rgba(49, 13, 45, 0.14)',
            width: '100%',
            height: '100%'
        });
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
    onContentEnd: function() {
        this.logheartBeatEvent(false);
        this.endTelemetry();
        EkstepRendererAPI.dispatchEvent("renderer:endpage:show");
    }


});

//# sourceURL=videoRenderer.js

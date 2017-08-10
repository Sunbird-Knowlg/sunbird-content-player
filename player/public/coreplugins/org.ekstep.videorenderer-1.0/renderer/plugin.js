/**
 * @description Launcher to render the Video or youtube URL's
 * @extends {class} org.ekstep.contentrenderer.baseLauncher
 */

org.ekstep.contentrenderer.baseLauncher.extend({
    _time: undefined,
    initialize: function(manifestData) {
        EkstepRendererAPI.addEventListener("renderer:content:replay", this.replayContent, this);
        this.start(manifestData);
    },
    start: function(manifestData) {
        var data = _.clone(content);
        this.reset();
        this.launch();
        this.manifestData = manifestData;
        var prefix_url = data.baseDir;
        var path = prefix_url + "/" + data.downloadUrl;
        this.createVideo(path, data);
        this.configOverlay();
    },
    reset: function() {
        if (document.getElementById("renderer_videos")) {
            videojs('renderer_videos').dispose();
            jQuery('#renderer_videos').remove();
        }
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
        data.mimeType === 'video/x-youtube' ? this._loadYoutube(data.downloadUrl) : this._loadVideo(path);
    },
    _loadVideo: function(path) {
        var source = document.createElement("source");
        source.src = path;
        video.appendChild(source);
        var player = videojs('renderer_videos');
        player.play();
        this.addvideoListeners(video);
    },
    _loadYoutube: function(path) {
        var instance = this;
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
    addvideoListeners: function(videoHolder) {
        var instance = this;
        videoHolder.onplay = function(e) {
            instance.logheartBeatEvent(true);
            instance.logTelemetry('TOUCH',{
                stageId: "videostage",
                subtype: "PLAY",
                values: [e.timeStamp]
            })
        };
        videoHolder.onpause = function(e) {
            instance.logheartBeatEvent(false);
            instance.logTelemetry('TOUCH',{
                stageId: "videostage",
                subtype: "PAUSE",
                values: [e.timeStamp]
            })
        };
        videoHolder.onended = function(e) {
            instance.logheartBeatEvent(false);
            instance.logTelemetry('END',{
                stageId: "videostage",
                subtype: "STOP"
            });
            EkstepRendererAPI.dispatchEvent('renderer:content:end');
        };
        videoHolder.onseeked = function(e) {
            instance.logTelemetry('TOUCH',{
                stageId: "videostage",
                subtype: "DRAG",
                values: [e.timeStamp]
            });
        };
    },
    addYOUTUBEListeners: function(videoHolder) {
        var instance = this;

        videoHolder.on('play', function(e) {
            instance.logheartBeatEvent(true);
            instance.logTelemetry('TOUCH',{
                stageId: "youtubestage",
                subtype: "PLAY",
                values: [videoHolder.currentTime()]
            })
        });
        videoHolder.on('pause', function(e) {
            instance.logheartBeatEvent(false);
            instance.logTelemetry('TOUCH',{
                stageId: "youtubestage",
                subtype: "PAUSE",
                values: [videoHolder.currentTime()]
            })
        });

        videoHolder.on('seeked', function(e) {
            instance.logTelemetry('TOUCH', {
                stageId: "youtubestage",
                subtype: "DRAG",
                values: [videoHolder.currentTime()]
            })
        });
        videoHolder.on('ended', function() {
            instance.logheartBeatEvent(false);
            instance.logTelemetry('END',{
                stageId: "youtubestage",
                subtype: "STOP"
            });
            EkstepRendererAPI.dispatchEvent('renderer:content:end');
        });
    },
    logTelemetry: function(type, eksData) {
        EkstepRendererAPI.getTelemetryService().interact(type || 'TOUCH',"", "", eksData);
    },
    logheartBeatEvent: function(flag) {
        var instance = this;
        var stageId = content.mimeType === 'video/x-youtube' ? 'youtube-stage' : 'video-stage';
        if (flag) {
            instance._time = setInterval(function() {
                EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", {
                    stageId:stageId
                });
            },EkstepRendererAPI.getGlobalConfig().heartBeatTime);
        }
        if (!flag) {
            clearInterval(instance._time);
        }
    },
    replayContent: function() {
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
            EkstepRendererAPI.dispatchEvent("renderer:contentclose:show");
        }, 100);
    },
});

//# sourceURL=videoRenderer.js

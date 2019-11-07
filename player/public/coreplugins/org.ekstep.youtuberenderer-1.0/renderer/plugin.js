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
        EkstepRendererAPI.addEventListener("onYouTubeIframeAPIReady", this.onYouTubeIframeAPIReady, this);
    },
    start: function () {
        this._super();
        var data = _.clone(content);
        this.heartBeatData.stageId = 'youtubestage';
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        data.artifactUrl = this.getYouTubeID(data.artifactUrl)
        var Url = new URL(data.artifactUrl);
        Url.searchParams.set('enablejsapi', '1');
        Url.searchParams.set('origin', 'https://diksha.gov.in');
        // if(globalConfigObj.context.origin){
        //     Url.searchParams.set('origin', globalConfigObj.context.origin);
        // }
        
        var iframe = document.createElement('iframe');
        iframe.type = 'text/html';
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.src = decodeURIComponent(Url.href);
        //iframe.src = "https://www.youtube.com/watch?v=aOdbERz7-bs&enablejsapi=1&origin=https://diksha.gov.in";
        //iframe.src = "https://www.youtube.com/embed/5dsGWM5XGdg?autoplay=1&enablejsapi=1&origin=https://diksha.gov.in";
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
        //this.addToGameArea(iframe);

        // var tag = document.createElement('script');
        // tag.id = 'iframe-demo';
        // tag.src = 'https://www.youtube.com/iframe_api';
        // // var firstScriptTag = document.head || document.getElementsByTagName('head')[0];
        // // firstScriptTag.appendChild(style);

        // jQuery("#" + this.manifest.id).insertBefore(tag);
        jQuery("#loading").hide()

        function onPlayerReady(event){
            document.getElementById('org.ekstep.youtuberenderer').style.borderColor = '#FF6D00';
        };
        function onPlayerStateChange(event){
            var color;
            if (event.data == -1) {
            color = "#37474F"; // unstarted = gray
            } else if (event.data == 0) {
            color = "#FFFF00"; // ended = yellow
            } else if (event.data == 1) {
            color = "#33691E"; // playing = green
            } else if (event.data == 2) {
            color = "#DD2C00"; // paused = red
            } else if (event.data == 3) {
            color = "#AA00FF"; // buffering = purple
            } else if (event.data == 5) {
            color = "#FF6DOO"; // video cued = orange
            }
            if (color) {
                document.getElementById('org.ekstep.youtuberenderer').style.borderColor = color;
            }
        }

        function apiLoaded() {
            YT.ready(function() {
                Youtube.isApiReady = true;

                for (var i = 0; i < Youtube.apiReadyQueue.length; ++i) {
                    Youtube.apiReadyQueue[i].initYTPlayer();
                }
            });
            // YT.ready(function() {
            //     player = new YT.Player('org.ekstep.youtuberenderer', {
            //         events: {
            //         'onReady': onPlayerReady,
            //         'onStateChange': onPlayerStateChange
            //         }
            //     });    
            // });
        }
        function loadScript(src, callback) {
            var loaded = false;
            var tag = document.createElement('script');
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            tag.onload = function () {
                if (!loaded) {
                    loaded = true;
                    callback();
                }
            };
            tag.onreadystatechange = function () {
                if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
                    loaded = true;
                    callback();
                }
            };
            tag.src = src;
        }
        if (typeof document !== 'undefined'){
            loadScript('https://www.youtube.com/iframe_api', apiLoaded);
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
        return "https://www.youtube-nocookie.com/embed/"+ID;
      }  
});

//# sourceURL=YoutubeRenderer.js
// Reference: 
// http://jsfiddle.net/CaoimhinMac/6BUgL/
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp
var VideoPlugin = Plugin.extend({
    _render: true,
    _data: undefined,
    _videoEle: undefined,
    _instance: undefined,    
    initPlugin: function(data) {
        this._data = data;
        if(this._data){
            if(_.isUndefined(data.autoplay)) this._data.autoplay = true;
            if(_.isUndefined(data.controls)) this._data.controls = false;
        }
        this.loadVideo();
        _instance = this;
    },
    loadVideo: function (){
        var lItem =  this._createDOMElementVideo();
        this.registerEvents();    
        this._self = new createjs.Bitmap(lItem);
        //If autoplay set to true, then play video
        if(this._data.autoplay == true){ 
            this.play();           
        }        
    },
    registerEvents : function(){
        var action = {},instance = this;
        action.asset = this._data.asset;
        action.stageId = this._theme._currentStage;
        var videoEle = instance.getVideo(this._data.asset);
        jQuery(videoEle).bind('play', function (e) {
             instance.sendTelemeteryData(action,"PLAY");
        });        
        jQuery(videoEle).bind('pause', function (e) {  
            instance.sendTelemeteryData(action,"PAUSE");        
        });
        videoEle.addEventListener("error", function (evt) {
        var lErrMesg = "Error loading video element, event.type [" + evt.type + "]  Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);

        });
        videoEle.addEventListener("abort", function (evt) {
            var lErrMesg = "Abort/Error loading video element, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);
        });        
        
        videoEle.addEventListener("loadeddata", function (evt) {
            var lMesg = "Media element can be played, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            if(_instance.autoplay == true){
                _instance.play();
            }
            console.log(lMesg);
        });
        videoEle.addEventListener('ended', function (evt){
            _instance.end();
        });
    },
    play: function(action) {
        var videoEle = this.isActiondefined(action);
        if (videoEle) {
            if (videoEle.paused) {
                videoEle.readyState > 2 ? this.start(videoEle) : console.info("Video is not ready retry once again");
            }else {
                console.info("Video is already playing");
            }
        };
    },
    pause:function(action){
       var videoEle = this.isActiondefined(action);
       !_.isUndefined(videoEle) ? videoEle.pause() : console.info("video pause failed");
    },
    stop: function(action) {
        var _videoEle = this.isActiondefined(action);
        _videoEle.currentTime = 0;
        _videoEle.pause();
        this.sendTelemeteryData(action, "STOP");
    },   
    end: function(){
        this.stop();        
    },
    replay: function(){
        _videoEle = this.getVideo(this._data.asset);
        _videoEle.currentTime = 0;
        this.play();
    },
    start: function(videoEle) {
        videoEle.style.display = "block";
        if (videoEle.delay) {
            setTimeout(function() {
                videoEle.play();
            }, videoEle.delay);
        } else {
            videoEle.play();
        }
    },
    isActiondefined: function(action) {
        if(!_.isUndefined(action)){
            return this.getVideo(action.asset);
        }else{
            console.info("Video started without any ECML action");
            return this.getVideo(this._data.asset);
        }
    },    
    sendTelemeteryData: function(action, subType){
        if(action)
            EventManager.processAppTelemetry(action, 'LISTEN', this._instance, {subtype : subType});
    },
    getVideo: function(videoId){
        return document.getElementById(videoId);
    },
    _createDOMElementVideo: function () {
        // This function will create the video Dom element and adding into theme object
        var videoAsset;
        videoAsset = !_.isUndefined(this._data.asset) ? this._theme.getAsset(this._data.asset) : console.warn("Video asset is not present");
        if(_.isUndefined(videoAsset)) return false;        
        var jqVideoEle = jQuery(videoAsset).insertBefore("#gameArea");       
        !_.isUndefined(this._data.type) ? jQuery(jqVideoEle).attr("type",this._data.type) : console.warn("Video type is not defined");
        var dims = this.relativeDims();
        jQuery(jqVideoEle).attr("id", this._data.asset)
        .prop({autoplay: this._data.autoplay, controls: this._data.controls, width: dims.w, height: dims.h})
        .css({position: 'absolute', left: dims.x + "px", top: dims.y + "px"});
        //Pushing video element to the stage HTML elements list
        // So when stage is chagned, remove all HTML elements of previous stage
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));        
        var videoEle = this.getVideo(this._data.asset);
        var div = document.getElementById('gameArea');
        div.insertBefore(videoEle, div.childNodes[0]);
        _videoEle = videoEle;       
        return new createjs.Bitmap(videoEle);
    },
    clear:function(){
        
    }

 });
 PluginManager.registerPlugin('video', VideoPlugin);
       
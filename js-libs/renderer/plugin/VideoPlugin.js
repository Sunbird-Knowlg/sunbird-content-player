// Reference: 
// http://jsfiddle.net/CaoimhinMac/6BUgL/
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp
var VideoPlugin = Plugin.extend({
    _render: true,
    _data: undefined,
    _videoEle: undefined,
    _instance: undefined, 
    _type:'video',   
    initPlugin: function(data) {
        this._data = data;
        if(this._data){
            if(_.isUndefined(data.autoplay)) this._data.autoplay = true;
            if(_.isUndefined(data.controls)) this._data.controls = false;
            if(_.isUndefined(data.muted)) this._data.muted = false;   
        }
        this.loadVideo();
        _instance = this;
       
    },
    loadVideo: function (){
        var lItem =  this._createDOMElementVideo();
        var videoEle = this.getVideo(this._data.asset);
        videoEle.load();
        this.registerEvents();    
        this._self = new createjs.Bitmap(lItem);
        //If autoplay set to true, then play video
        if(this._data.autoplay == true){ 
            this.play();           
        }        
    },
    registerEvents : function(){
        // This function will only takecare of registering of the events relted to video
        var action = {},instance = this;
        action.asset = this._data.asset;
        action.stageId = this._theme._currentStage;
        var videoEle = instance.getVideo(this._data.asset);
        jQuery(videoEle).bind('play', function (e) {
        // Blocking OE_INTREACT Telemetry if the case of autoPlay prop is defined to Video Eleme
            if(!instance._data.autoplay)instance.sendTelemeteryData(action,"PLAY");
                instance._data.autoplay = undefined;
        });        
        jQuery(videoEle).bind('pause', function(e) {
             /*If user click on pause button
             then it looks for the video currentTime
            if it is == 0 then it is stop else this video is just paused */
            videoEle.currentTime > 0 ? instance.sendTelemeteryData(action, "PAUSE") : instance.sendTelemeteryData(action, "STOP");
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
        var videoEle = this.handleAsset(action);
        if (videoEle) {
            if (videoEle.paused) {
                videoEle.readyState > 2 ? this.start(videoEle) : console.warn("Video is not ready to play,READY STATE:",videoEle.readyState);
            }else {
                console.info("Video is already playing");
            }
        };
    },
    pause:function(action){
       var videoEle = this.handleAsset(action);
       !_.isUndefined(videoEle) ? videoEle.pause() : console.info("video pause failed");
    },
    stop: function(action) {
        var videoEle = this.handleAsset(action);
        videoEle.currentTime = 0;       
        videoEle.pause();        
    },   
    end: function(){
        this.stop();        
    },
    replay: function(){
       var videoEle = this.getVideo(this._data.asset);
       videoEle.currentTime = 0;
       this.play();
    },
    start: function(videoEle) {
        var delay =  _.isUndefined(this._data.delay) ? 36 : this._data.delay;
            setTimeout(function(){
                videoEle.play();
            },delay);
    },
    handleAsset: function(action) {
        if(!_.isUndefined(action)){
            return this.getVideo(action.asset);
        }else{
            console.info("Video started without any ECML action");
            return this.getVideo(this._data.asset);
        }
    },    
    sendTelemeteryData: function(action, subType){
        if(action)
            EventManager.processAppTelemetry(action, 'OTHER', this._instance, {subtype : subType});
    },
    getVideo: function(videoId){
        return document.getElementById(videoId);
    },
    _createDOMElementVideo: function () {
        // This function will create the video Dom element and adding into theme object
        var videoAsset;
        videoAsset = !_.isUndefined(this._data.asset) ? this._theme.getAsset(this._data.asset) : console.warn("Video asset is not present");
        if(_.isUndefined(videoAsset)) return false;
        if (videoAsset instanceof HTMLElement == false) {
            var src = videoAsset
            videoAsset = document.createElement("video");
            videoAsset.src = src;
            console.info("Asset load failed Please refresh the stage");            
        }
        var jqVideoEle = jQuery(videoAsset).insertBefore("#gameArea");       
        !_.isUndefined(this._data.type) ? jQuery(jqVideoEle).attr("type",this._data.type) : console.warn("Video type is not defined");
        var dims = this.relativeDims();
        jQuery(jqVideoEle).attr("id", this._data.asset)
        .prop({autoplay: this._data.autoplay, muted:this._data.muted, controls: this._data.controls, width: dims.w, height: dims.h})
        .css({position: 'absolute', left: dims.x + "px", top: dims.y + "px","display":'block'});
        //Pushing video element to the stage HTML elements list
        // So when stage is chagned, remove all HTML elements of previous stage
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));        
        var videoEle = this.getVideo(this._data.asset);
        var div = document.getElementById('gameArea');
        div.insertBefore(videoEle, div.childNodes[0]);
        _videoEle = videoEle;       
        return new createjs.Bitmap(videoEle);
    }
 });
 PluginManager.registerPlugin('video', VideoPlugin);

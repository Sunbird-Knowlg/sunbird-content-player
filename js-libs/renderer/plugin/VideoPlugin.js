// Reference: 
// http://jsfiddle.net/CaoimhinMac/6BUgL/
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp
var VideoPlugin = Plugin.extend({
    _render: true,
    _data: undefined,
    _instance: undefined,
    _defaultStart: 50, //Start video to play after loading all video frames; 
    _type: 'video',
    initPlugin: function(data) {
        this._data = data;
        if(this._data){
            if(_.isUndefined(this._data.autoplay)) this._data.autoplay = true;
            if(_.isUndefined(this._data.controls)) this._data.controls = false;
            if(_.isUndefined(this._data.muted)) this._data.muted = false;   
        }
        this.loadVideo(data);
        _instance = this;
    },
    loadVideo: function (data){
        if(!data.asset) return false;
        var lItem =  this.createDOMElementVideo();
        var videoEle = this.getVideo(data.asset);
        videoEle.load();
        this.registerEvents();    
        this._self = new createjs.Bitmap(lItem);
        if(data.autoplay == true){ 
            this.play();           
        }        
    },
    registerEvents : function(){
        var videoEle = this.getVideo(this._data.asset);
        jQuery(videoEle).bind('play', this.logTelemetry);        
        jQuery(videoEle).bind('pause', this.logTelemetry);
        jQuery(videoEle).bind("error", this.logConsole);
        jQuery(videoEle).bind("abort", this.logConsole);        
        jQuery(videoEle).bind("loadeddata", this.onLoadData);
    },
    logTelemetry: function(event) {
        var action = {}, videoEle = event.target;
        action.asset = videoEle.id;
        action.stageId = Renderer.theme._currentStage;
        if (event.type === 'pause') {
            event.type = videoEle.currentTime > 0 ? 'pause' : 'stop';
            if(!videoEle.ended){
                EventManager.processAppTelemetry(action, 'OTHER', _instance, {subtype: event.type.toUpperCase()});
            }
        }
        if (event.type === 'play') {
            if (!videoEle.autoplay) {
                    EventManager.processAppTelemetry(action, 'OTHER', _instance, {subtype: event.type.toUpperCase()});
            }
            videoEle.autoplay = undefined;
        }
    },
    onLoadData: function() {
        if (_instance.autoplay == true) {
            _instance.play();
        }
    },
    logConsole:function(e){
        console.warn("This video has",e.type);
    },
    sendTelemeteryData: function(action, subType){
        if(action)
            EventManager.processAppTelemetry(action, 'OTHER', this._instance, {subtype : subType});
    },
    play: function(action) {
        var videoEle = this.handleAsset(action);
        videoEle.paused && videoEle.readyState > 2 ? this.start(videoEle) : console.warn('Video is not ready to play',videoEle.readyState);
    },
    pause:function(action){
       var videoEle = this.handleAsset(action);
       !_.isUndefined(videoEle) ? videoEle.pause() : console.info("video pause failed");
    },
    stop: function(action) {
        var videoEle = this.handleAsset(action);
        videoEle.pause();
        videoEle.currentTime = 0;          
    },   
    replay: function(){
       var videoEle = this.getVideo(this._data.asset);
       videoEle.currentTime = 0;
       this.play();
    },
    start: function(videoEle) {
        var delay =  _.isUndefined(this._data.delay) ? this._defaultStart : this._data.delay;
        this._data.delay = this._defaultStart;
            setTimeout(function(){
                videoEle.play();
            },delay);
    },
    handleAsset: function(action) {
        if (!_.isUndefined(action)) {
            return this.getVideo(action.asset);
        } else {
            console.info("Video started without any ECML action");
            return this.getVideo(this._data.asset);
        }
    },
    getVideo: function(videoId){
        return document.getElementById(videoId);
    },
    setPropsandCss: function(jqVideoEle) {
        var dims = this.relativeDims();
        jQuery(jqVideoEle).attr("id", this._data.asset)
        .prop({autoplay: this._data.autoplay, muted:this._data.muted, controls: this._data.controls, width: dims.w, height: dims.h})
        .css({position: 'absolute', left: dims.x + "px", top: dims.y + "px","display":'block'});
    },
    addVideotoTheme: function(jqVideoEle) {
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));
        var videoEle = this.getVideo(this._data.asset);
        var div = document.getElementById('gameArea');
        div.insertBefore(videoEle, div.childNodes[0]);
    },
    createDOMElementVideo: function() {
        var videoAsset;
        videoAsset = this._theme.getAsset(this._data.asset);
        if (videoAsset instanceof HTMLElement == false) {
            var src = videoAsset;
            videoAsset = document.createElement("video");
            videoAsset.src = src;
        }
        var jqVideoEle = jQuery(videoAsset).insertBefore("#gameArea");
        !_.isUndefined(this._data.type) ? jQuery(jqVideoEle).attr("type", this._data.type) : console.warn("Video type is not defined");
        this.setPropsandCss(jqVideoEle);
        this.addVideotoTheme(jqVideoEle);
         var videoEle = this.getVideo(this._data.asset);
        return new createjs.Bitmap(videoEle);
    }
 });
 PluginManager.registerPlugin('video', VideoPlugin);
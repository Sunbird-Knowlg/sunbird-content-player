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
        this.loadVideo();
        _instance = this;
    },
    loadVideo: function (){
        var lItem =  this._createDOMElementVideo();
        this._self = new createjs.Bitmap(lItem);

        //If autoplay set to true, then play video
        if(this._data.autoplay == true){
            this.play();
        }
    }, 
    play: function(action){
        if(action){
            _videoEle = this.getVideo(action.asset);
        }
        _videoEle.style.display = "block";
        //this._self.paused = false;
        _videoEle.play();
        this.sendTelemeteryData(action, "PLAY");
    },
    pause: function(action) {
        if(action){
            _videoEle = this.getVideo(action.asset);
        }
        //this._self.paused = true;
        _videoEle.pause();
        this.sendTelemeteryData(action, "PAUSE");
    },
    stop: function(action) {
        if(action){
            _videoEle = this.getVideo(action.asset);
        }
        _videoEle.currentTime = 0;
        _videoEle.pause();
        this.sendTelemeteryData(action, "STOP");
    },   
    end: function(){
        this.stop();
        console.log("video end..");
    },
    replay: function(){
        _videoEle = this.getVideo(this._data.asset);
        _videoEle.currentTime = 0;
        this.play();
    },
    sendTelemeteryData: function(action, subType){
        if(action)
            EventManager.processAppTelemetry(action, 'LISTEN', this._instance, {subtype : subType});
    },
    getVideo: function(videoId){
        return document.getElementById(videoId);
    },
    _createDOMElementVideo: function () {

        var videoAssest = this._theme.getAsset(this._data.asset);
        var dims = this.relativeDims();
        
        console.log(videoAssest);

        var jqVideoEle = jQuery(videoAssest).insertBefore("#gameArea");
        jQuery(jqVideoEle).attr("type", this._data.type);
        jQuery(jqVideoEle).attr("id", this._data.asset)
        .prop({autoplay: this._data.autoplay, controls: this._data.controls, width: dims.w, height: dims.h})
        .css({position: 'absolute', left: dims.x + "px", top: dims.y + "px"});

        //Pushing video element to the stage HTML elements list
        // So when stage is chagned, remove all HTML elements of previous stage
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));

        var videoEle = document.getElementById(this._data.asset);

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

        var div = document.getElementById('gameArea');
        div.insertBefore(videoEle, div.childNodes[0]);
        
        if(videoEle.readyState >= 2){ 
            if(this._data.autoplay == true)  {
                this.replay();
            }
        }

        _videoEle = videoEle;
       
        return new createjs.Bitmap(videoEle);
    } // end_function createDOMElementVideo
 });
 PluginManager.registerPlugin('video', VideoPlugin);
       
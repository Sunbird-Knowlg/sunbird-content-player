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
        this._self = new createjs.Bitmap(lItem);//new createjs.DOMElement(document.createElement('p'));

        if(_videoEle.readyState >= 2){   
            this.replay();
        }
    }, 
    play: function(action){
        _videoEle.style.display = "block";
        this._self.paused = false;
        _videoEle.play();
        this.sendTelemeteryData(action, "PLAY");
    },
    pause: function(action) {
        this._self.paused = true;
        _videoEle.pause();
        this.sendTelemeteryData(action, "PAUSE");
    },
    stop: function(action) {
        _videoEle.currentTime = 0;
        _videoEle.pause();
        this.sendTelemeteryData(action, "STOP");
    },   
    end: function(){
        this.stop();
        console.log("video end..");
    },
    replay: function(){
        _videoEle.currentTime = 0;
        this.play();
    },
    sendTelemeteryData: function(action, subType){
        if(action)
            EventManager.processAppTelemetry(action, 'LISTEN', this._instance, {subtype : subType});
    },
    _createDOMElementVideo: function () {

        var videoAssest = this._theme.getAsset(this._data.asset);
        var dims = this.relativeDims();
        console.log(dims);

        var jqVideoEle = jQuery(videoAssest).insertBefore("#gameArea");
        jQuery(jqVideoEle).attr({type: "video/webm", id: "video1"})
        .prop({autoplay: this._data.autoplay, controls: this._data.controls, width: dims.w, height: dims.h})
        .css({position: 'absolute', display: "none", left: dims.x + "px", top: dims.y + "px"});

        //Pushing video element to the stage HTML elements list
        // So when stage is chagned, remove all HTML elements of previous stage
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr('id'));

        _videoEle = document.getElementById('video1');

        _videoEle.addEventListener("error", function (evt) {
        var lErrMesg = "Error loading video element, event.type [" + evt.type + "]  Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);

        });

        _videoEle.addEventListener("abort", function (evt) {
            var lErrMesg = "Abort/Error loading video element, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);
        });

        _videoEle.addEventListener("loadeddata", function (evt) {
            var lMesg = "Media element can be played, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            _instance.play();
            console.log(lMesg);
        });

        _videoEle.addEventListener('ended', function (evt){
            _instance.end();
        });

        /*function draw(v,c,w,h) {
            if(v.paused || v.ended) return false;
            c.drawImage(v,0,0,w,h);
            setTimeout(draw,20,v,c,w,h);
        }*/
        var div = document.getElementById('gameArea');
        div.insertBefore(_videoEle, div.childNodes[0]);
        
        return new createjs.Bitmap(_videoEle);
    } // end_function createDOMElementVideo
 });
 PluginManager.registerPlugin('video', VideoPlugin);
       
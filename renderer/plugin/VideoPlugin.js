 var VideoPlugin = Plugin.extend({
    _render: true,
    _data: undefined,
    initPlugin: function(data) {
        //http://jsfiddle.net/CaoimhinMac/6BUgL/
        this._data = data;
        this.play();
    },
    play: function (){
        var lItem =  this._createDOMElementVideo();
        this._self = lItem;
    }, 
    _createDOMElementVideo: function () {

        var videoAssest = this._theme.getAsset(this._data.asset);

        var jqVideoEle = jQuery(videoAssest).insertBefore("#gameArea");
        jQuery(jqVideoEle).attr({type: "video/webm", id: "video1"})
        .prop({autoplay:true, controls: true})
        .css({position: 'absolute', display: "none"});

        var vidEle = document.getElementById('video1');
        vidEle.addEventListener("error", function (evt) {
        var lErrMesg = "Error loading video element, event.type [" + evt.type + "]  Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);
        });

        vidEle.addEventListener("abort", function (evt) {
            var lErrMesg = "Abort/Error loading video element, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            console.log(lErrMesg);
        });

        vidEle.addEventListener("loadeddata", function (evt) {
            var lMesg = "Media element can be played, event.type [" + evt.type + "] Media Details: [" + evt.target.src + "]";
            vidEle.style.display = "block";
            vidEle.play();
            console.log(lMesg);
        });
        var div = document.getElementById('gameArea');
        div.insertBefore(vidEle, div.childNodes[0]);
        
        return new createjs.Bitmap(vidEle);
    } // end_function createDOMElementVideo
 });
 PluginManager.registerPlugin('video', VideoPlugin);
       
 org.ekstep.contentrenderer.baseLauncher.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.html-archive', this.launch, this);
        EkstepRendererAPI.addEventListener('renderer:content:replay', this.relaunchGame, this);
        this.launchGame();
    },
    launchGame: function(evt, data) {
        data = content;
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = {"env": envHTML, "envpath": 'dev'};
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : data.baseDir;
        var path = prefix_url + '/index.html?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        jQuery('#ekstep_htmlIframe').remove()
        var iframe = document.createElement('iframe');
        iframe.src = path;
        iframe.id = 'ekstep_htmlIframe'
        this.addIframe(iframe);
    },
    addIframe: function(iframe) {
        jQuery('#ekstep_htmlIframe').insertBefore("#gameArea");
        var gameArea = document.getElementById('gameArea');
        gameArea.insertBefore(iframe, gameArea.childNodes[0]);
        this.setStyle();
    },
    setStyle: function() {
        jQuery('#gameArea') .css({left: '0px', top: '0px', width: "100%", height: "100%"});
        jQuery('#ekstep_htmlIframe') .css({position: 'absolute', display: 'block',width: '100%', height: '100%'});
        // if html content want to show overlay, they should dispatch "renderer:overlay:show" to show overlay
        // AppConfig.overlay.showOverlay ? jQuery('#overlay').css({display: 'block'}) : jQuery('#overlay').css({display: 'none'})
    },
    getAsseturl: function(content) {
        var content_type = "html/";
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var path = window.location.origin + globalConfig.s3ContentHost + content_type;
        path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    },
    relaunchGame:function(){
        this.relaunch();
        //TODO: Base functionality should take care of reLaunching of the game
        this.launchGame();
    }
});
//# sourceURL=HTMLRendererePlugin.js

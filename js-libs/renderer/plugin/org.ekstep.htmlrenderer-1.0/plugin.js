Plugin.extend({
    initialize: function() {
        console.info('HTML Renderer intialize is called');
        EkstepRendererAPI.addEventListener('renderer:html:launch', this.launch, this);

    },
    launch: function(evt, data) {
        console.info('HTML plugin init')
        jQuery('#loading').hide();
        // using state
        /*window.location.hash = "#/render/htmlcontent/do_20045479"*/
       

        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = {"env": envHTML, "envpath": 'dev'}; 
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : data.baseDir;
        var path = prefix_url + '/index.html?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        /*using  window.open*/
        /*if (isMobile) {
            console.log("Opening through cordova custom webview.");
            cordova.InAppBrowser.open(path, '_self', 'location=no,hardwareback=no');
        }else{
             window.open(path, '_self');
        }*/


      var iframe = document.createElement('iframe');
       iframe.src = path;
       var ifrmaeEleme = jQuery(iframe).insertBefore("#gameArea");
        var dims = this.relativeDims();
         jQuery(gameArea).attr("id", 'gameArea')
            .css({
                position: 'absolute',
                left: '0px',
                top: '0px',               
            });
        jQuery(ifrmaeEleme).attr("id", 'ifrmae')
            .css({
                position: 'absolute',
                left: '20px',
                top: '30px',
                "display": 'block',
                background: 'red',
                width: '100%',
                height: '100%'
            });
       
        var div = document.getElementById('gameArea');
        div.insertBefore(iframe, div.childNodes[0]);
    },
    getAsseturl: function(content) {
        var content_type = "html/";
        var path = window.location.origin + AppConfig.S3_CONTENT_HOST + content_type;
        path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    }
});

//# sourceURL=HTMLRendererePlugin.js
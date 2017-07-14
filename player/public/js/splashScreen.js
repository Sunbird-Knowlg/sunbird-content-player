var splashScreen = {
    elementId: '#loading',
    config: {
        text: "Powered by EkStep Genie",
        icon: "img/icons/icn_genie.png",
        bgImage: "img/icons/background_1.png",
        webLink: "https://www.ekstep.in"
    },
    progressEle:undefined,
    initialize: function() {
        var appConfigKeys = Object.keys(AppConfig.splash);
        // _.each(appConfigKeys, function(each){
        for (var i = 0; i < appConfigKeys.length; i++) {
            var objKey = appConfigKeys[i];
            splashScreen.config[objKey] = AppConfig.splash[objKey];
        };
        var html = this.createHtml();
        jQuery(this.elementId).html(html);
        // add event listener for hide and show of splash splashScreen
        var instance = this;

        instance.show();
        setTimeout(function() {
            EkstepRendererAPI.addEventListener("renderer:launcher:load", instance.loadContentDetails);
            EkstepRendererAPI.addEventListener("renderer:splash:show", instance.show);
            EkstepRendererAPI.addEventListener("renderer:splash:hide", instance.hide);
            EkstepRendererAPI.addEventListener("renderer:content:start", instance.hide);
        }, 100);
    },

    createHtml: function() {
        var html = '<img src=' + splashScreen.config.bgImage + ' class="gc-loader-img" /><P class="splashText" id="splashTextId"> Loading your content ... </p><div id="progressArea"><div id="progressBar"></div><p id="progressCount" class="font-lato gc-loader-prog"></p></div><a href="' + splashScreen.config.webLink + '" target="_blank"><div class="splashScreen"> <img src=' + splashScreen.config.icon + ' class="splash-icon " /> <span>' + splashScreen.config.text + '</span> </div></a>';
        return html;
    },

    loadContentDetails: function(eve, data){
        console.log("loadContentDetails data: ", data);
        $("#splashTextId").text(data.name);
    },

    show: function() {
        jQuery(splashScreen.elementId).show();
        splashScreen.showProgressBar();

    },
    hide: function(event) {
        jQuery(splashScreen.elementId).hide();
        splashScreen.hideProgressBar();
    },
    showProgressBar: function() {
        splashScreen.progressEle = document.getElementById("progressBar");
        jQuery("#progressBar").width(0);
        jQuery('#loading').show();
        var width = 1;
        var id = setInterval(frame, 100);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
            } else {
                width++;
                if (splashScreen.progressEle && splashScreen.progressEle.style)
                    splashScreen.progressEle.style.width = width + '%';
                jQuery('#progressCount').text(width + '%');
            }
        }

    },
    hideProgressBar:function(){
      splashScreen.progressEle.style.width = 0 + '%'
      jQuery('#loading').hide();
    }
}
splashScreen.initialize();

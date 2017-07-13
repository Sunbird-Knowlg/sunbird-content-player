var splashScreen = {
    elementId: '#loading',
    config: {
        text: "Powered by EkStep Genie",
        icon: "img/icons/icn_genie.png",
        bgImage: "img/icons/background_1.png",
        webLink: "https://www.ekstep.in"
    },
    initialize: function() {
        var appConfigKeys = Object.keys(AppConfig.splash);
        // _.each(appConfigKeys, function(each){
        for (var i = 0; i < appConfigKeys.length; i++) {
            var objKey = appConfigKeys[i];
            splashScreen.config[objKey] = AppConfig.splash[objKey];
        };
        var html = this.createHtml();
        jQuery(this.elementId).html(html);
        splashScreen.showProgressBar();
        // add event listener for hide and show of splash splashScreen
        var instance = this;

        setTimeout(function() {
            instance.show();
            EkstepRendererAPI.addEventListener("renderer:splash:show", instance.show);
            EkstepRendererAPI.addEventListener("renderer:splash:hide", instance.hide);
            EkstepRendererAPI.addEventListener("renderer:content:start", instance.hide);
        }, 100);
    },

    createHtml: function() {
        var html = '<img src=' + splashScreen.config.bgImage + ' class="gc-loader-img" /><div id="progressArea"> <div id="progressBar"></div> <p id="progressCount" class="font-lato gc-loader-prog"></p> </div> <a href="' + splashScreen.config.webLink + '" target="_parent"> <div class="splashScreen"> <img src=' + splashScreen.config.icon + ' class="splash-icon " /> <span id="pageTitle">' + splashScreen.config.text + '</span> </div> </a>';
        return html;
    },

    show: function() {
        jQuery(splashScreen.elementId).show();
        splashScreen.showProgressBar();
    },

    hide: function(event) {
        jQuery(splashScreen.elementId).hide();
    },
    showProgressBar: function() {
        var elem = document.getElementById("progressBar");
        jQuery("#progressBar").width(0);
        jQuery('#loading').show();

        var width = 20;
        var id = setInterval(frame, 0.6);

        function frame() {
            if (width >= 100) {
                clearInterval(id);
            } else {
                width++;
                if (elem && elem.style)
                    elem.style.width = width + '%';
                jQuery('#progressCount').text(width + '%');
            }
        }

    }
}
splashScreen.initialize();
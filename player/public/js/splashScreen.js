var splashScreen = {
    elementId : '#loading',
    config: {
        text: "Powered by EkStep Genie",
		icon: "img/icons/icn_genie.png",
		bgImage: "img/icons/background_1.png",
		download_link: "https://www.ekstep.in"
    },
    initialize: function() {
        var appConfigKeys = Object.keys(AppConfig.splash);
        // _.each(appConfigKeys, function(each){
        for(var i = 0; i < appConfigKeys.length; i++) {
            var objKey = appConfigKeys[i];
            splashScreen.config[objKey] = AppConfig.splash[objKey];
        };
        var html = this.createHtml();
        jQuery(this.elementId).html(html);

        // add event listener for hide and show of splash splashScreen
        var instance = this;

        setTimeout(function() {
            instance.show();
            EkstepRendererAPI.addEventListener("renderer:splash:show", instance.show);
            EkstepRendererAPI.addEventListener("renderer:splash:hide", instance.hide);
        }, 0);
    },

    createHtml: function() {
        var html = '<img src=' + splashScreen.config.bgImage + ' class="gc-loader-img"/><a href=' + splashScreen.config.download_link + '><div class="splashScreen"><img src=' + splashScreen.config.icon + ' class="splash-icon "/><span id="pageTitle">' + splashScreen.config.text + '</span></div></a>';
        return html;
    },

    show: function() {
        jQuery(splashScreen.elementId).show();
    },

    hide: function(event) {
        jQuery(splashScreen.elementId).hide();
    }
}
splashScreen.initialize();

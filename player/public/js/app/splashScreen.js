var splashScreen = {
    config: {
        text: "Powered by EkStep Genie",
		icon: "img/icons/icn_genie.png",
		image: "img/icons/background_1.png",
		download_link: "http://www.ekstep.in"
    },
    initialize: function() {
        var appConfigKeys = _.keys(AppConfig.splash);
        _.each(appConfigKeys, function(each){
            splashScreen.config[each] = AppConfig.splash[each];
        });
        var html = splashScreen.createHtml();
        jQuery('#loading').html(html);
        splashScreen.show();

    },

    createHtml: function() {
        var html = '<img src=' + splashScreen.config.image + ' class="gc-loader-img"/><a href=' + splashScreen.config.download_link + '><div class="splashScreen"><img src=' + splashScreen.config.icon + ' class="splash-icon "/><span id="pageTitle">' + splashScreen.config.text + '</span></div></a>';
        return html;
    },

    show: function() {
        jQuery('#loading').show();
    },

    hide: function(delay) {
        delay = delay || 3000; // splash screen is going to be hidden after 3secs.
        setTimeout(function(){
            jQuery('#loading').hide();
        },delay);
    }

}

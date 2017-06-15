var splashScreen = {
    splashText: AppConfig.SPLASH_TEXT,
    splashBackground: AppConfig.SPLASH_IMAGE,
    initialize: function() {

        // jQuery('#loading').show();
        var html = splashScreen.createHtml();
        jQuery('#loading').html(html);
        splashScreen.show();
    },
    createHtml: function() {
        var html = '<img src=' + splashScreen.splashBackground + ' class="gc-loader-img"/><p class="icon-font cover-page-title" id="pageTitle">' + splashScreen.splashText + '</p>';
        return html;
    },
    show: function() {
        jQuery('#loading').show();
    },
    hide: function() {
        jQuery('#loading').hide();
    }

}

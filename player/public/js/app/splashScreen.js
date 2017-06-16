var splashScreen = {
    splashText: AppConfig.SPLASH_TEXT,
    splashBackground: AppConfig.SPLASH_IMAGE,
    splashIcon: AppConfig.SPLASH_ICON,
    appDownloadLink: AppConfig.APP_DOWNLOAD_LINK,
    initialize: function() {
        var html = splashScreen.createHtml();
        jQuery('#loading').html(html);
        splashScreen.show();
    },
    createHtml: function() {
        var html = '<img src=' + splashScreen.splashBackground + ' class="gc-loader-img"/><div class="splashScreen"><img src=' + splashScreen.splashIcon + ' class="splash-icon "/></div><p class="icon-font cover-page-title" id="pageTitle">' + splashScreen.splashText + '</p><p id="pageTitle" class="download-text"><small>Click here to <a href=' + splashScreen.appDownloadLink + '>Download</a> Genie !!</small></p>';
        return html;
    },
    show: function() {
        jQuery('#loading').show();
    },
    hide: function(delay) {
        setTimeout(function(){
            jQuery('#loading').hide();
        },delay);
    }

}

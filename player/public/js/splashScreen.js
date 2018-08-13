var splashScreen = {
    elementId: '#loading',
    progressEle: undefined,
    config: {},
    initialize: function() {
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var appConfigKeys = Object.keys(globalConfig.splash);

        for (var i = 0; i < appConfigKeys.length; i++) {
            var objKey = appConfigKeys[i];
            splashScreen.config[objKey] = globalConfig.splash[objKey];
        };
        var html = this.createHtml();
        jQuery('#loading-center').append(html);
        // add event listener for hide and show of splash splashScreen
        var instance = this;
        var elem = document.getElementById('splashScreen');
        if (elem != null || elem != undefined) {
            elem.onclick = function() {
                instance.launchPortal();
            };
        }
        instance.show();
    },
    addEvents: function() {
        EkstepRendererAPI.addEventListener("renderer:launcher:load", splashScreen.loadContentDetails);
        EkstepRendererAPI.addEventListener("renderer:splash:show", splashScreen.show);
        EkstepRendererAPI.addEventListener("renderer:splash:hide", splashScreen.hide);
        EkstepRendererAPI.addEventListener("renderer:content:start", splashScreen.hide);
    },
    createHtml: function() {
        var html = '<img src="' + splashScreen.config.bgImage + '" class="gc-loader-img" onerror="this.style.display=\'none\'" /><P class="splashText" id="splashTextId"> Loading your content</p></div><a href="' + splashScreen.config.webLink + '" target="_blank"><div id="splashScreen" class="splashScreen"> <img src="' + splashScreen.config.icon + '" class="splash-icon " onerror="this.style.display=\'none\'" /> <span>' + splashScreen.config.text + '</span> </div></a>';
        return html;
    },

    launchPortal: function() {
        if (window.cordova) {
            var url = splashScreen.config.webLink;
            genieservice.launchPortal(url);
        }
    },

    loadContentDetails: function(eve, data) {
        $("#splashTextId").text(data.name);
    },

    show: function() {
        EkstepRendererAPI.dispatchEvent('renderer:launcher:load', undefined, window.content);
        jQuery(splashScreen.elementId).show();
    },

    hide: function(event) {
        jQuery(splashScreen.elementId).hide();
    }
};
window.splashScreen = splashScreen;
// splashScreen.initialize();
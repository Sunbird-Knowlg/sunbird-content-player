var MainView = function () {}
window.org.ekstep.view = new MainView()
MainView = undefined
var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

org.ekstep.view.mainView = Class.extend({
    init: function (config) {},
    setGlobalContext: function(){
        return new Promise(function (resolve, reject) {
            GlobalContext.game.id = !GlobalContext.game.id ? packageName : GlobalContext.game.id
            GlobalContext.game.ver = !GlobalContext.game.ver ? version : GlobalContext.game.ver

            // Only for the local
            GlobalContext.config = {
                origin: "Genie",
                contentId: "org.ekstep.num.addition.by.grouping",
                appInfo: {
                    code: "org.ekstep.contentplayer",
                    mimeType: "application/vnd.android.package-archive",
                    identifier: "org.ekstep.contentplayer"
                }
            }
            window.globalConfig = mergeJSON(AppConfig, GlobalContext.config)
            GlobalContext.config = window.globalConfig
            setTelemetryEventFields(window.globalConfig)
            resolve(GlobalContext.config)
        })
    }
})
org.ekstep.view.init = function () {
    if (isMobile) {
        org.ekstep.view.renderer = mobileView;
        org.ekstep.view.renderer.init($ionicPlatform, $timeout);
    }
}
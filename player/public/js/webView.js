var webView = {
    init: function(){
        var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
        if (!isMobile) {
            console.log("======Web View======");
            splashScreen.addEvents()
            org.ekstep.service.init()
            this.setGlobalContext().then(function (appInfo) {
                if (typeof localPreview !== "undefined" && localPreview === "local") { return }

                // commented for now for offline desktop app. if we remove this, player will not work in local
                //org.ekstep.contentrenderer.startGame(GlobalContext.config.appInfo)
            }).catch(function (res) {2
                console.log("Error Globalcontext.init:", res)
                EkstepRendererAPI.logErrorEvent(res, {
                    "type": "system",
                    "severity": "fatal",
                    "action": "play"
                })
                alert(res.errors)
                exitApp()
            })
            
        }
    },
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
}
window.webView = webView;
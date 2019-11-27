org.ekstep.view.local = new (org.ekstep.view.mainView.extend({
    init: function(){
        console.log("======Local View======");
        this.setGlobalContext().then(function (appInfo) {
            if (typeof localPreview !== "undefined" && localPreview === "local") { return }

            // commented for now for offline desktop app. if we remove this, player will not work in local
            org.ekstep.contentrenderer.startGame(GlobalContext.config.appInfo)
        }).catch(function (res) {
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
}))();
org.ekstep.view.renderer = org.ekstep.view.local
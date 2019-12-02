org.ekstep.contentrenderer.local = function () {
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
	org.ekstep.contentrenderer.startGame(GlobalContext.config.appInfo)
}
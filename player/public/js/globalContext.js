GlobalContext = {
	user: {},
	game: {
		id: "",
		ver: ""
	},
	_params: {},
	config: {},
	registerEval: [],
	filter: undefined,
	init: function (gid, ver) {
		return new Promise(function (resolve, reject) {
			GlobalContext.game.id = !GlobalContext.game.id ? gid : GlobalContext.game.id
			GlobalContext.game.ver = !GlobalContext.game.ver ? ver : GlobalContext.game.ver
			GlobalContext._setGlobalContext(resolve, reject)
		})
	},
	_setGlobalContext: function (resolve, reject) {
		new Promise(function (resolve, reject) {
			if (window.plugins && window.plugins.webintent) {
				var promises = []
				var configuration = {}
				promises.push(GlobalContext._getIntentExtra("playerConfig", configuration))
				Promise.all(promises).then(function (result) {
					setGlobalConfig(configuration.playerConfig)
					var globalConfig = EkstepRendererAPI.getGlobalConfig()
					org.ekstep.service.renderer.initializeSdk(globalConfig.appQualifier)
					if (globalConfig.metadata) {
						GlobalContext.game.id = globalConfig.metadata.identifier
						GlobalContext.game.ver = globalConfig.metadata.pkgVersion || "1"
					}
					var telemetryEventFields = AppConfig.telemetryEventsConfigFields
					for (var i = 0; i < telemetryEventFields.length; i++) {
						GlobalContext._params[telemetryEventFields[i]] = globalConfig.config[telemetryEventFields[i]]
					}
					resolve(globalConfig)
				})
			}
		}).then(function (config) {
			if (config.origin === "Genie") {
				return org.ekstep.service.renderer.getCurrentUser()
			} else {
				showToaster("error", "Invalid Origin " + config.origin)
				reject("INVALID_ORIGIN")
			}
		}).then(function (result) {
			if (result.uid) {
				GlobalContext.user = result
				GlobalContext._params.user = GlobalContext.user
				resolve(true)
			} else {
				reject("INVALID_USER")
			}
		}).catch(function (err) {
			reject(err)
		})
	},
	_getIntentExtra: function (param, contextObj) {
		return new Promise(function (resolve, reject) {
			window.plugins.webintent.getExtra(param, function (url) {
				if (url) {
					try {
						contextObj[param] = JSON.parse(url)
					} catch (e) {
						contextObj[param] = url
					}
				}
				resolve(true)
			}, function (e) {
				console.log("intent value not set for: " + param)
				resolve(true)
			})
		})
	},
	setParam: function (param, value, incr, max) {
		if (param !== "user") {
			var fval = GlobalContext._params[param]
			if (incr) {
				if (!fval) { fval = 0 }
				fval = (fval + incr)
			} else {
				fval = value
			}
			if (fval < 0) { fval = 0 }
			if (typeof max !== "undefined" && fval >= max) { fval = 0 }
			GlobalContext._params[param] = fval
		} else {
			console.error("user param can not set")
		}
	},
	getParam: function (param) {
		return GlobalContext._params[param]
	}
}

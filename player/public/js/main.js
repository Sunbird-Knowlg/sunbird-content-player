window.packageName = "org.ekstep.contentplayer"
window.version = AppConfig.version
window.packageNameDelhi = "org.ekstep.delhi.curriculum"
window.geniePackageName = "org.ekstep.genieservices"
window.currentUser = {}
window.userList = []
window.COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection"
window.stack = []
window.collectionChildrenIds = []
window.collectionPath = []
window.collectionPathMap = {}
window.collectionChildren = true
window.content = {}
window.config = { showEndPage: true, showHTMLPages: true }
window.isbrowserpreview = getUrlParameter("webview")
window.isMobile = getUrlParameter("isMobile")
window.isCoreplugin = undefined
window.Renderer = undefined

document.body.addEventListener("logError", telemetryError, false)

function telemetryError (e) {
	document.body.removeEventListener("logError", e)
}

function removeRecordingFiles (path) {
	_.each(RecorderManager.mediaFiles, function (path) {
		$cordovaFile.removeFile(cordova.file.dataDirectory, path)
			.then(function (success) {
				console.log("success : ", success)
			}, function (error) {
				console.log("err : ", error)
			})
	})
}

function createCustomEvent (evtName, data) {
	var evt = new CustomEvent(evtName, data)
	console.log("event is", evt)
}

function imageExists (url, callback, index) {
	// eslint-disable-next-line
    var img = new Image()
	// eslint-disable-next-line
    img.onload = function() { callback(true, index) }
	// eslint-disable-next-line
    img.onerror = function() { callback(false, index) }
	img.src = url
}

function getUrlParameter (sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1))

	var sURLVariables = sPageURL.split("&")

	var sParameterName

	var i
	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split("=")

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1]
		}
	}
}

function getCurrentStageId () {
	var stageId = EkstepRendererAPI.getCurrentStageId()
	return (stageId) || (angular.element(document).scope() ? angular.element(document).scope().pageId : "")
}

function contentExitCall () {
	if(window.cordova || !isbrowserpreview) org.ekstep.service.renderer.showExitConfirmPopup()
}

// After integration with Genie, onclick of exit we should go to previous Activity of the Genie.
// So, change exitApp to do the same.
function exitApp (stageId) {
	if (!stageId) {
		stageId = getCurrentStageId()
	}
	try {
		TelemetryService.exit(stageId)
	} catch (err) {
		console.error("End telemetry error:", err.message)
	}
	org.ekstep.service.renderer.endGenieCanvas()
}

function startApp (app) {
	if (!app) app = geniePackageName
	if (!_.isUndefined(navigator) && !_.isUndefined(navigator.startApp)) {
		navigator.startApp.start(app, function (message) {
			exitApp()
			TelemetryService.exit(getCurrentStageId())
			// TelemetryService.exit(packageName, version)
			// eslint-disable-next-line
		}, function(error) {
			if (app === geniePackageName) { showToaster("error", "Unable to start Genie App.") } else {
				var bool = confirm("App not found. Do you want to search on PlayStore?")
				if (bool) cordova.plugins.market.open(app)
			}
		})
	}
}

function contentNotAvailable (error) {
	EkstepRendererAPI.logErrorEvent(error, { "type": "content", "action": "play", "severity": "fatal" })
	showToaster("error", AppMessages.NO_CONTENT_FOUND)
	exitApp()
}

function checkStage (showalert) {
	if (GlobalContext.config.appInfo.mimeType === "application/vnd.ekstep.content-collection") {
		if (showalert === "showAlert") {
			showToaster("error", "No stage found, redirecting to collection list page")
		}
		exitApp()
	} else {
		if (showalert === "showAlert") {
			showToaster("error", "No Stage found, existing canvas")
		}
		exitApp()
	}
	Renderer.running = false
}

function objectAssign () {
	Object.assign = function (target) {
		if (target === undefined || target === null) {
			throw new TypeError("Cannot convert undefined or null to object")
		}
		var output = Object(target)
		_.each(arguments, function (argument) {
			if (argument !== undefined && argument !== null) {
				for (var nextKey in argument) {
					if (argument.hasOwnProperty(nextKey)) {
						output[nextKey] = argument[nextKey]
					}
				}
			}
		})
		return output
	}
}

function startTelemetry (id, ver, cb) {
	var correlationData = []
	if (!_.isEmpty(GlobalContext.game.contentExtras) && !_.isUndefined(GlobalContext.game.contentExtras)) {
		GlobalContext.game.contentExtras = (typeof (GlobalContext.game.contentExtras) === "string") ? JSON.parse(GlobalContext.game.contentExtras) : GlobalContext.game.contentExtras
		correlationData.push(GlobalContext.game.contentExtras)
	}
	var otherData = GlobalContext.config.otherData
	if (!_.isUndefined(otherData) && !_.isUndefined(otherData.cdata)) {
		_.each(otherData.cdata, function (cdata) {
			correlationData.push(cdata)
		})
		delete otherData.cdata
	}
	otherData.enableValidation = otherData.enableTelemetryValidation
	delete otherData.enableTelemetryValidation
	correlationData.push({ "id": CryptoJS.MD5(Math.random().toString()).toString(), "type": "ContentSession" })
	TelemetryService.init(GlobalContext.game, GlobalContext.user, correlationData, otherData).then(function (response) {
		TelemetryService.eventDispatcher = EkstepRendererAPI.dispatchEvent
		if (!_.isUndefined(TelemetryService.instance)) {
			var tsObj = _.clone(TelemetryService)
			tsObj._start = JSON.stringify(tsObj.instance._start)
			tsObj._end = JSON.stringify(tsObj.instance._end)
		}
		if (!_.isUndefined(cb) && response === true) {
			cb()
		}
	}).catch(function (error) {
		EkstepRendererAPI.logErrorEvent(error, { "type": "system", "action": "play", "severity": "fatal" })
		showToaster("error", "TelemetryService init failed.")
		exitApp()
	})
}

function getAsseturl (content) {
	var contentType = content.mimeType === "application/vnd.ekstep.html-archive" ? "html/" : "ecml/"
	var globalConfig = EkstepRendererAPI.getGlobalConfig()
	var path = globalConfig.host + globalConfig.s3ContentHost + contentType
	path += content.status === "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot"
	return path
}
// ref: http://www.jqueryscript.net/other/Highly-Customizable-jQuery-Toast-Message-Plugin-Toastr.html
function showToaster (toastType, message, customOptions) {
	var defaultOptions = { "positionClass": "toast-top-right", "preventDuplicates": true, "tapToDismiss": true, "hideDuration": "1000", "timeOut": "4000" }
	toastr.options = _.extend(defaultOptions, customOptions)
	if (toastType === "warning") {
		toastr.warning(message)
	}
	if (toastType === "error") {
		toastr.error(message)
	}
	if (toastType === "info") {
		toastr.info(message)
	}
}

function addWindowUnloadEvent () {
	var origin = ""
	if (!window.location.origin) {
		origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
	} else {
		origin = window.location.origin
	}
	// Use Iframe unload event
	window.onunload = function (e) { // onbeforeunload is not dispatched when navigating to other page
		e = e || window.event
		var y = e.pageY || e.clientY
		if (!y) {
			EkstepRendererAPI.getTelemetryService().interrupt("OTHER", EkstepRendererAPI.getCurrentStageId())
			window.postMessage({"player.telemetry.interrupt": telemetry_web.tList}, origin)
			EkstepRendererAPI.dispatchEvent("renderer:content:close")
		}
	}
	if (EkstepRendererAPI.getGlobalConfig().context.mode === "edit") {
		parent.document.getElementsByTagName("iframe")[0].contentWindow.onunload = function () {
			EkstepRendererAPI.getTelemetryService().interrupt("OTHER", EkstepRendererAPI.getCurrentStageId())
			window.postMessage({"player.telemetry.interrupt": telemetry_web.tList}, origin)
			EkstepRendererAPI.dispatchEvent("renderer:content:close")
		}
	}
}

function compareObject (obj1, obj2) {
	// Loop through properties in object 1
	for (var p in obj1) {
		// Check property exists on both objects
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false

		switch (typeof (obj1[p])) {
		// Deep compare objects
		case "object":
			if (!Object.compare(obj1[p], obj2[p])) return false
			break
			// Compare function code
		case "function":
			if (typeof (obj2[p]) === "undefined" || (p !== "compare" && obj1[p].toString() !== obj2[p].toString())) return false
			break
			// Compare values
		default:
			if (obj1[p] !== obj2[p]) return false
		}
	}

	// Check object 2 for any extra properties
	// eslint-disable-next-line
	for (var p in obj2) {
		if (typeof (obj1[p]) === "undefined") return false
	}
	return true
}

function getPreviewMode () {
	var mode = "preview"
	if (typeof cordova !== "undefined") {
		mode = !_.isUndefined(GlobalContext.config.mode) ? GlobalContext.config.mode : "play"
	} else if (EkstepRendererAPI.getGlobalConfig().context.mode) {
		mode = EkstepRendererAPI.getGlobalConfig().context.mode
	}
	return mode
}

function logContentProgress (value) {
	if (_.isUndefined(value)) {
		if (!_.isUndefined(Renderer)) {
			var stageLenth = Renderer.theme._data.stage.length
			var currentIndex = _.findIndex(Renderer.theme._data.stage, {
				id: Renderer.theme._currentScene.id
			})
			currentIndex = currentIndex + 1
			return (currentIndex / stageLenth) * 100
		} else {
			return 100
		}
	} else {
		return value
	}
}

function setGlobalConfig (configuration) {
	_.extend(configuration, configuration.context) // TelemetryEvent is using globalConfig.context.sid/did
	_.extend(configuration, configuration.config)
	if (typeof configuration.metadata === "string") {
		configuration.metadata = JSON.parse(configuration.metadata)
	}
	if (configuration.metadata && configuration.metadata.contentData) {
		// Mobile specific temporary fix release-1.9.0
		var metadata = configuration.metadata.contentData
		_.extend(metadata, _.pick(configuration.metadata, "hierarchyInfo", "isAvailableLocally", "basePath", "rollup"))
		metadata.basepath = metadata.basePath
		configuration.basepath = configuration.basePath

		// Override the metadata object of intent with proper structure.
		// manifest & hierarchyInfo
		configuration.metadata = metadata
	}

	// To set Organization heirarchy
	if (configuration.contextRollup) {
		configuration.rollup = configuration.contextRollup
	}

	configuration.object = configuration.object || {}

	// To set Textbook heirarchy
	if (_.isUndefined(configuration.object.rollup)) {
		var rollup = {}
		if (configuration.metadata.rollup) {
			rollup = configuration.metadata.rollup
		} else if (configuration.objectRollup) {
			rollup = configuration.objectRollup
		}
		configuration.object = _.assign({rollup: rollup}, configuration.object)
	}

	if (!_.isUndefined(configuration.context.pdata) && !_.isUndefined(configuration.context.pdata.pid) && !configuration.context.pdata.pid.includes("." + AppConfig.pdata.pid)) {
		configuration.context.pdata.pid = configuration.context.pdata.pid + "." + AppConfig.pdata.pid
	}
	GlobalContext.config = mergeJSON(AppConfig, configuration)
	window.globalConfig = GlobalContext.config

	if (_.isUndefined(window.cordova)) {
		org.ekstep.service.renderer.api.setBaseUrl(window.globalConfig.host + window.globalConfig.apislug)
	}
	setTelemetryEventFields(window.globalConfig)
	splashScreen.initialize()
}

function setTelemetryEventFields (globalConfig) {
	var otherData = {}
	for (var i = 0; i < globalConfig.telemetryEventsConfigFields.length; i++) {
		var key = globalConfig.telemetryEventsConfigFields[i]
		var value = globalConfig[key]
		if (!_.isUndefined(value)) otherData[key] = value
	}
	var etags = {
		"dims": otherData.dims || AppConfig.etags.dims,
		"app": otherData.app || AppConfig.etags.app,
		"partner": otherData.partner || AppConfig.etags.partner
	}
	otherData.etags = etags
	otherData.object = globalConfig.object
	otherData.env = globalConfig.env ? globalConfig.env : getPreviewMode()
	delete otherData.dims
	delete otherData.app
	delete otherData.partner
	GlobalContext.config.otherData = otherData
}

function mergeJSON (a, b) {
	// create new object and copy the properties of first one
	var res = _.clone(a)
	// iterate over the keys of second object
	Object.keys(b).forEach(function (e) {
		// check key is present in first object
		// check type of both value is object(not array) and then
		// recursively call the function
		if (e in res && typeof res[e] === "object" && typeof res[e] === "object" && !(Array.isArray(res[e]) || Array.isArray(b[e]))) {
			// recursively call the function and update the value
			// with the returned ne object
			res[e] = mergeJSON(res[e], b[e])
		} else {
			// otherwise define the preperty directly
			if ((Array.isArray(res[e]) && Array.isArray(b[e]))) {
				res[e] = _.union(res[e], b[e])
			} else {
				res[e] = b[e]
			}
		}
	})
	return res
}

// Append all the functions to window

// window.postMessageHandler = postMessageHandler;
window.mergeJSON = mergeJSON
window.setTelemetryEventFields = setTelemetryEventFields
window.setGlobalConfig = setGlobalConfig
window.logContentProgress = logContentProgress
window.getPreviewMode = getPreviewMode
window.compareObject = compareObject
window.addWindowUnloadEvent = addWindowUnloadEvent
window.showToaster = showToaster
window.getAsseturl = getAsseturl
window.startTelemetry = startTelemetry
window.exitApp = exitApp
window.imageExists = imageExists
window.getCurrentStageId = getCurrentStageId
window.contentExitCall = contentExitCall
window.telemetryError = telemetryError
window.removeRecordingFiles = removeRecordingFiles
window.createCustomEvent = createCustomEvent
window.getUrlParameter = getUrlParameter
window.startApp = startApp
window.contentNotAvailable = contentNotAvailable
window.checkStage = checkStage
window.objectAssign = objectAssign

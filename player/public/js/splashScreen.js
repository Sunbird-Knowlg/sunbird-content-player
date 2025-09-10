var splashScreen = {
	elementId: "#loading",
	progressEle: undefined,
	config: {},
	files: [],
	currentProgress: 0,
	progressIncrement: 0,
	loadType: {
		"corePlugins": {"name": "corePlugins", "startProgress": 1, "endProgress": 25},
		"externalPlugins": {"name": "externalPlugins", "startProgress": 25, "endProgress": 25},
		"contentPlugins": {"name": "contentPlugins", "startProgress": 50, "endProgress": 25},
		"contentAssets": {"name": "contentAssets", "startProgress": 75, "endProgress": 25}
	},
	initialize: function () {
		var globalConfig = EkstepRendererAPI.getGlobalConfig()
		var appConfigKeys = Object.keys(globalConfig.splash)

		for (var i = 0; i < appConfigKeys.length; i++) {
			var objKey = appConfigKeys[i]
			splashScreen.config[objKey] = globalConfig.splash[objKey]
		};
		var html = this.createHtml()
		jQuery(this.elementId).html(html)
		// add event listener for hide and show of splash splashScreen
		var instance = this
		var elem = document.getElementById("splashScreen")
		if (elem) {
			elem.onclick = function () {
				instance.launchPortal()
			}
		}

		instance.show()
	},
	addEvents: function () {
		EkstepRendererAPI.addEventListener("renderer:launcher:load", splashScreen.loadContentDetails)
		EkstepRendererAPI.addEventListener("renderer:splash:show", splashScreen.show)
		EkstepRendererAPI.addEventListener("renderer:splash:hide", splashScreen.hide)
		EkstepRendererAPI.addEventListener("renderer:content:start", splashScreen.hide)
		EkstepRendererAPI.addEventListener("renderer:content:progress", splashScreen.progress)
		// EkstepRendererAPI.addEventListener("plugin:add", splashScreen.pluginLoadSuccess)
		EkstepRendererAPI.addEventListener("plugin:load:success", splashScreen.pluginLoadSuccess)
	},
	createHtml: function () {
		const loadingText = (EkstepRendererAPI.getGlobalConfig().context.resourceBundles || window.parent.ecEditor.getConfig('resourceBundles').frmelmnts.lbl || {}).loadingYourContent || "Loading your content";
		var html = "<img src=\"" + splashScreen.config.bgImage + "\" class=\"gc-loader-img\" onerror=\"this.style.display='none'\" /><P class=\"splashText\" id=\"splashTextId\">" + loadingText + "</p><div id=\"progressArea\"><div id=\"progressBar\"></div><p id=\"progressCount\" class=\"font-lato gc-loader-prog\"></p></div><a href=\"" + splashScreen.config.webLink + "\" target=\"_blank\"><div id=\"splashScreen\" class=\"splashScreen\"> <img src=\"" + splashScreen.config.icon + "\" class=\"splash-icon \" onerror=\"this.style.display='none'\" /> <span>" + splashScreen.config.text + "</span> </div></a>"
		return html
	},

	launchPortal: function () {
		if (window.cordova) {
			var url = splashScreen.config.webLink
			genieservice.launchPortal(url)
		}
	},

	loadContentDetails: function (eve, data) {
		$("#splashTextId").text(data.name)
	},

	show: function () {
		EkstepRendererAPI.dispatchEvent("renderer:launcher:load", undefined, window.content)
		jQuery(splashScreen.elementId).show()
		splashScreen.showProgressBar()
	},

	hide: function (event) {
		splashScreen.setProgress(100)
		setTimeout(function () {
			jQuery(splashScreen.elementId).hide()
			splashScreen.hideProgressBar()
		}, 100)
	},
	pluginLoadSuccess: function (event) {
		if (event && event.target) {
			event.target.file = event.target.id
			splashScreen.progress(event)
		}
	},
	showProgressBar: function () {
		splashScreen.progressEle = document.getElementById("progressBar")
		jQuery("#progressBar").width(0)
		jQuery("#loading").show()
		isMobile && setTimeout(function () {
			navigator.splashscreen.hide()
		}, 100)
		splashScreen.setProgress(1)
	},
	progress: function (event) {
		if (event.target && event.target.name) {
			splashScreen.changeProgressType(event.target)
		} else if (event.target && event.target.file) {
			splashScreen.updateProgress(event.target.file)
		} else {
			// This file is not valid for this progress
			// Log telemetry event(LOG event) code issue
			console.log("renderer:content:progress event triggered without target name/file: ", event)
		}
	},
	changeProgressType: function (data) {
		console.log("Progress Change type: ", data)
		splashScreen.files = data.files
		splashScreen.progressIncrement = (data.name.endProgress / data.files.length)
		splashScreen.setProgress(data.name.startProgress)
		console.log("Progress Increment: ", splashScreen.progressIncrement)
	},
	updateProgress: function (fileName) {
		splashScreen.setProgress(splashScreen.currentProgress += splashScreen.progressIncrement)
		console.log("Progress : " + fileName + ", value: " + splashScreen.currentProgress)
		// if (splashScreen.files[fileName]) {
		// 	// If the current loadType endProgress is lessthan the CurrentProgress+value then only increament
		// 	splashScreen.setProgress(splashScreen.currentProgress += splashScreen.progressIncrement)
		// } else {
		// 	// This file is not valid for this progress
		// 	// Log telemetry event(LOG event) code issue
		// }
	},
	setProgress: function (value) {
		var width = Math.trunc(value)
		console.log("value", width)
		// eslint-disable-next-line
        // clearInterval(id)
		// var id = setInterval(frame, 50)

		// function frame () {
		// 	if (width >= 100) {
		// 		clearInterval(id)
		// 	} else {
		// 		width++
		// 		if (splashScreen.progressEle && splashScreen.progressEle.style) { splashScreen.progressEle.style.width = width + "%" }
		// 		jQuery("#progressCount").text(width + "%")
		// 	}
		// }
		if (width <= 100) {
			if (splashScreen.progressEle && splashScreen.progressEle.style) {
				splashScreen.progressEle.style.width = width + "%"
			}

			jQuery("#progressCount").text(width + "%")
			splashScreen.currentProgress = width
		} else {
			console.log("Progress value is >100.", value)
		}
	},
	resetProgressBar: function () {
		// reset all the values
		// all private varibles used to track progress
		splashScreen.currentProgress = 0
	},
	hideProgressBar: function () {
		//   splashScreen.progressEle.style.width = 0 + '%'
		jQuery("#loading").hide()
		splashScreen.resetProgressBar()
	}
}
window.splashScreen = splashScreen
// splashScreen.initialize();

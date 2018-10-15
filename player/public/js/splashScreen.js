var splashScreen = {
	elementId: "#loading",
	progressEle: undefined,
	config: {},
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
	},
	createHtml: function () {
		var html = "<img src=\"" + splashScreen.config.bgImage + "\" class=\"gc-loader-img\" onerror=\"this.style.display='none'\" /><P class=\"splashText\" id=\"splashTextId\"> Loading your content</p><div id=\"progressArea\"><div id=\"progressBar\"></div><p id=\"progressCount\" class=\"font-lato gc-loader-prog\"></p></div><a href=\"" + splashScreen.config.webLink + "\" target=\"_blank\"><div id=\"splashScreen\" class=\"splashScreen\"> <img src=\"" + splashScreen.config.icon + "\" class=\"splash-icon \" onerror=\"this.style.display='none'\" /> <span>" + splashScreen.config.text + "</span> </div></a>"
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
		jQuery(splashScreen.elementId).hide()
		splashScreen.hideProgressBar()
	},

	showProgressBar: function () {
		splashScreen.progressEle = document.getElementById("progressBar")
		jQuery("#progressBar").width(0)
		jQuery("#loading").show()
		isMobile && setTimeout(function () {
			navigator.splashscreen.hide()
		}, 100)
		var width = 1
		// eslint-disable-next-line
        clearInterval(id)
		var id = setInterval(frame, 50)

		function frame () {
			if (width >= 100) {
				clearInterval(id)
			} else {
				width++
				if (splashScreen.progressEle && splashScreen.progressEle.style) { splashScreen.progressEle.style.width = width + "%" }
				jQuery("#progressCount").text(width + "%")
			}
		}
	},

	hideProgressBar: function () {
		//   splashScreen.progressEle.style.width = 0 + '%'
		jQuery("#loading").hide()
	}
}
window.splashScreen = splashScreen
// splashScreen.initialize();

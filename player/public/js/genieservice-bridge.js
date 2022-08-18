window.genieServiceBridge = (function () {
	var _callbackFunc

	function initialize () {
		var contentId = getUrlParameter("contentId")
		if (contentId) {
			// This is to GC end-page when html content is launched in mobile or poratl preview
			localStorage.setItem("cotentId", contentId)
		}

		if (!isMobile) {
			if ((typeof AppConfig === "undefined") && (typeof isbrowserpreview === "undefined")) {
				var flavor = getUrlParameter("flavor")
				// var launchData = JSON.parse(getUrlParameter("launchData"))
				if (flavor) {
					// falvor will be available only for the content preview showing in portal/AT
					// eslint-disable-next-line
                    genieservice = genieservice_portal
					// genieservice.api.setBaseUrl(launchData.envpath);
					_callbackFunc()
				} else {
					genieservice.getLocalData(function () {
						_callbackFunc()
					})
				}
			}
		} else {
			loadCordova()
		}
	};

	/* Load Cordova file for mobile only */
	function loadCordova () {
		loadJsFile("///android_asset/www/cordova.js", function () {
			document.addEventListener("deviceready", onDeviceReady, false)
		})
	}

	/* Load js file */
	function loadJsFile (src, callbackFunc) {
		var fileref = document.createElement("script")
		fileref.setAttribute("type", "text/javascript")
		fileref.setAttribute("src", src)
		fileref.onload = function () {
			callbackFunc()
		}
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}

	/* Cordova plugins can access only on device ready state */
	function onDeviceReady (event) {
		console.log("onDeviceReady()", event)

		_callbackFunc()
	};

	/**
     * Get url parameter value
     * sPram: input url paramater name to get its value in url
     */
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

	return {
		init: function (callback) {
			_callbackFunc = callback
			initialize()
		}
	}
})()

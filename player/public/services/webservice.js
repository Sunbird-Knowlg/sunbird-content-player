org.ekstep.service.web = new (org.ekstep.service.mainService.extend({
	init: function () {},
	initialize: function () {},
	api: {
		_baseUrl: undefined,
		contentBasePath: "/content/v3/read/",
		languageBasePath: "/language/v3/",
		telemetryBasePath: "/data/v3/telemetry",
		getAPI: function () {
			return this._baseUrl + this.contentBasePath
		},
		getLanguageAPI: function () {
			return this._baseUrl + this.languageBasePath
		},
		getTelematyAPI: function () {
			return this._baseUrl + this.telemetryBasePath
		},
		setBaseUrl: function (baseUrl) {
			this._baseUrl = baseUrl
		},
		getBaseUrl: function () {
			if (_.isUndefined(this._baseUrl)) {
				console.log("Base path is undefined.")
				return
			}
			return this._baseUrl
		}
	},
	callApi: function (url, type, headersParam, data, cb) {
		headersParam["Content-Type"] = "application/json"
		jQuery.ajax({
			url: url,
			type: type,
			headers: headersParam,
			data: data
		}).done(function (resp) {
			cb(resp)
		})
	},
	getCurrentUser: function () {
		return new Promise(function (resolve, reject) {
			$.getJSON("assets/user_list/user_list.json", function (data) {
				resolve(data[0])
			})
		})
	},

	getAllUserProfile: function () {
		return new Promise(function (resolve, reject) {
			$.getJSON("assets/user_list/user_list.json", function (data) {
				resolve(data)
			})
		})
	},

	checkMaxLimit: function () {
		return new Promise(function (resolve, reject) {
			resolve(false)
		})
	},

	setUser: function (uid) {
		return new Promise(function (resolve, reject) {
			resolve(true)
		})
	},

	getMetaData: function () {
		return new Promise(function (resolve, reject) {
			var result = {}
			result = {
				"flavor": "sandbox",
				"version": "1.0.1"
			}
			resolve(result)
		})
	},
	getContentBody: function (id, headersParam) {
		var instance = this
		return new Promise(function (resolve, reject) {
			instance.callApi(org.ekstep.service.web.api.getAPI() + id + "?fields=body", "GET", headersParam, undefined, function (resp) {
				var result = {}
				if (!resp.error) {
					result.list = resp
					resolve(resp.result.content)
				} else {
					console.info("err : ", resp.error)
				}
			})
		})
	},
	getContent: function (id) {
		return new Promise(function (resolve, reject) {
			if (!(typeof content === "undefined")) {
				if (content.metadata.mimeType === "application/vnd.ekstep.content-collection") {
					resolve(genieservice.getContentMetadata(id))
				} else {
					resolve(content.metadata)
				}
			} else {
				resolve(genieservice.getContentMetadata(id))
			}
		})
	},
	getContentMetadata: function (id, headersParam) {
		var instance = this
		return new Promise(function (resolve, reject) {
			instance.callApi(org.ekstep.service.web.api.getAPI() + id, "GET", headersParam, undefined, function (resp) {
				var result = {}
				if (!resp.error) {
					result.list = resp
					var metadata = resp.result.content
					var map = {}
					map.identifier = metadata.identifier
					map.localData = metadata
					map.mimeType = metadata.mimeType
					map.isAvailable = true
					map.path = "stories/" + metadata.code
					resolve(map)
				} else {
					console.info("err : ", resp.error)
				}
			})
		})
	},
	languageSearch: function (filter) {
		var instance = this
		return new Promise(function (resolve, reject) {
			var headersParam = {}
			instance.callApi(org.ekstep.service.web.api.getLanguageAPI() + "search", "POST", headersParam, filter, function (resp) {
				var result = {}
				if (!resp.error) {
					result.list = resp
					resolve(resp.result)
				} else {
					console.info("err : ", resp.error)
				}
			})
		})
	},
	sendTelemetry: function (data, headersParam) {
		var instance = this
		return new Promise(function (resolve, reject) {
			headersParam["dataType"] = "json"
			instance.callApi(org.ekstep.service.web.api.getTelematyAPI(), "POST", headersParam, JSON.stringify(data), function (resp) {
				var result = {}
				if (!resp.error) {
					result.data = resp
					resolve(resp.result)
				} else {
					console.info("err : ", resp.error)
				}
			})
		})
	},
	endContent: function () {
		// On close of the content call this function
		var contentId = localStorage.getItem("cotentId")
		if (_.isUndefined(contentId)) {
			console.log("ContentId is not defined in URL.")
			return
		}
		var endPageStateUrl = "#/content/end/" + contentId
		this.showPage(endPageStateUrl)
	},
	showPage: function (pageUrl) {
		if (typeof cordova !== "undefined") {
			var url = "file:///android_asset/www/index.html" + pageUrl
			window.location.href = url
		} else if (self !== top) {
			// if the it is Iframe then fallow the below url syntax
			/* https://dev.ekstep.in/assets/public/preview/dev/preview.html?webview=true#/content/end/do_10097197" */
			var iframeUrl = window.frameElement.src
			iframeUrl = iframeUrl.indexOf("&") !== -1 ? iframeUrl.substring(0, iframeUrl.indexOf("&")) : iframeUrl
			window.location = iframeUrl + pageUrl
		} else {
			window.location = "/" + pageUrl
		}
	}
}))()
org.ekstep.service.renderer = org.ekstep.service.web

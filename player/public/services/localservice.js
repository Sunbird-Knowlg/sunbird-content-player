org.ekstep.service.local = new (org.ekstep.service.mainService.extend({
	init: function () {},
	initialize: function () {},
	api: {
		basePath: "/genie-canvas/v2/",
		contentList: "content/list",
		getAPI: function (specificApi) {
			return this.basePath + specificApi
		},
		getContentList: function () {
			return this.getAPI(this.contentList)
		}
	},

	getCurrentUser: function () {
		return new Promise(function (resolve, reject) {
			$.getJSON("assets/user_list/user_list.json", function (data) {
				if (data.length === 0) {
					data = [{ "uid": "9g8h4ndAnonymouscg56ngd" }]
				}
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

	getContent: function (id, url) {
		if (isbrowserpreview) {
			return new Promise(function (resolve, reject) {
				if (content) {
					resolve(content.metadata)
				}
			})
		} else {
			return new Promise(function (resolve, reject) {
				jQuery.post(org.ekstep.service.local.api.getContentList(), function (resp) {
					var result = {}
					if (!resp.error) {
						result.list = resp
						var item = _.findWhere(resp.content, { "identifier": id })
						resolve(item)
					} else {
						reject(resp)
					}
				})
					.fail(function (err) {
						reject(err)
					})
			})
		}
	},
	getContentList: function (filter) {
		return new Promise(function (resolve, reject) {
			jQuery.post(org.ekstep.service.local.api.getContentList(), function (resp) {
				var result = {}
				if (!resp.error) {
					result.list = resp.content
					resolve(result)
				} else {
					reject(resp)
				}
			})
				.fail(function (err) {
					reject(err)
				})
		})
	},
	sendTelemetry: function (data) {
		return new Promise(function (resolve, reject) {
			resolve(data)
		})
	},
	setAPIEndpoint: function (endpoint) {
		return endpoint
	},
	// Get previous and next content of particular content
	getRelevantContent: function (request) {
		return new Promise(function (resolve, reject) {
			var response = JSON.parse("{\"next\":{\"content\":{\"basePath\":\"fixture-stories/video-renderer\",\"contentData\":{\"appIcon\":\"do_2123999168105512961495/beee6757847b84a1e41ce827ae02ccc7_1477485749628.jpeg\",\"artifactUrl\":\"fixture-stories/video-renderer/cat.mp4\",\"audience\":[\"Learner\"],\"board\":\"CBSE\",\"channel\":\"b00bc992ef25f1a9a8d63291e20efc8d\",\"contentDisposition\":\"inline\",\"contentEncoding\":\"identity\",\"contentType\":\"Resource\",\"createdBy\":\"0b174e4f-eff1-44e9-b15e-415787470456\",\"createdOn\":\"2017-12-19T05:35:20.038+0000\",\"owner\":\"bodhi1 user\",\"description\":\"Video\",\"downloadUrl\":\"do_2123999168105512961495/dummy.mp4\",\"gradeLevel\":[\"Class 1\"],\"identifier\":\"org.ekstep.videorenderer\",\"language\":[\"English\"],\"lastPublishedOn\":\"2018-05-31T12:15:39.161+0000\",\"mimeType\":\"video/webm\",\"name\":\"Water Conservation\",\"osId\":\"org.ekstep.quiz.app\",\"pkgVersion\":\"5.0\",\"publisher\":\"EkStep\",\"resourceType\":\"Read\",\"size\":\"64271.0\",\"status\":\"Live\",\"subject\":\"English\",\"versionKey\":\"1527768938990\"},\"contentType\":\"resource\",\"hierarchyInfo\":[{\"contentType\":\"textbook\",\"identifier\":\"do_2125251490189148161635\"},{\"contentType\":\"textbookunit\",\"identifier\":\"do_2125251493823201281636\"},{\"contentType\":\"collection\",\"identifier\":\"do_2123999194039664641503\"}],\"identifier\":\"org.ekstep.videorenderer\",\"isAvailableLocally\":false,\"isUpdateAvailable\":false,\"lastUpdatedTime\":1531915165000,\"mimeType\":\"video/webm\",\"referenceCount\":1,\"sizeOnDevice\":101206}},\"prev\":{\"content\":{\"basePath\":\"fixture-stories/shapes\",\"contentData\":{\"appIcon\":\"do_2123999198485053441504/b5c2ff92ab5512754a24b7ed0a09e97f_1478082514640.jpeg\",\"audience\":[\"Learner\"],\"board\":\"CBSE\",\"channel\":\"b00bc992ef25f1a9a8d63291e20efc8d\",\"contentDisposition\":\"inline\",\"contentEncoding\":\"identity\",\"contentType\":\"Resource\",\"createdBy\":\"0b174e4f-eff1-44e9-b15e-415787470456\",\"createdOn\":\"2017-12-19T05:41:30.882+0000\",\"owner\":\"Vinu Kumar V S\",\"description\":\"Different Shapes\",\"downloadUrl\":\"do_2123999198485053441504/dummy.mp4\",\"gradeLevel\":[\"Class 1\"],\"identifier\":\"org.ekstep.shapes\",\"language\":[\"English\"],\"lastPublishedOn\":\"2018-05-31T12:15:40.732+0000\",\"mimeType\":\"application/vnd.ekstep.ecml-archive\",\"name\":\"Directions\",\"osId\":\"org.ekstep.quiz.app\",\"pkgVersion\":\"4.0\",\"resourceType\":\"Read\",\"size\":\"38058.0\",\"status\":\"Live\",\"subject\":\"Hindi\",\"variants\":{\"spine\":{\"ecarUrl\":\"https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/ecar_files/do_2123999198485053441504/elevator-pitch-bi-hana_1527768940895_do_2123999198485053441504_4.0_spine.ecar\",\"size\":24190}},\"versionKey\":\"1527768940387\"},\"contentType\":\"resource\",\"hierarchyInfo\":[{\"contentType\":\"textbook\",\"identifier\":\"do_2125251490189148161635\"},{\"contentType\":\"textbookunit\",\"identifier\":\"do_2125251493823201281636\"},{\"contentType\":\"collection\",\"identifier\":\"do_2123999194039664641503\"}],\"identifier\":\"org.ekstep.shapes\",\"isAvailableLocally\":true,\"isUpdateAvailable\":false,\"lastUpdatedTime\":1531914190000,\"mimeType\":\"application/vnd.ekstep.ecml-archive\",\"referenceCount\":1,\"sizeOnDevice\":9371}}}")
			resolve(response)
		})
	},
	// Get max limit of particular content
	checkMaxLimit: function (request) {
		return new Promise(function (resolve, reject) {
			resolve(false)
		})
	}
}))()
org.ekstep.service.renderer = org.ekstep.service.local

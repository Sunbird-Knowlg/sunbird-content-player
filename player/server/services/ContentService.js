/**
 * Content Service - Invoke MW API's, transform data for UI and viceversa
 * @author Jitendra Singh Sankhwar
 */
var async = require("async")

var restClient = require("../helpers/RESTClientWrapper")

var _ = require("underscore")

var fs = require("fs")

var Download = require("download")

var jsonfile = require("jsonfile")

var SUPPORTED_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"]

var downloading = false

var isAvailableList = []

var contentList = []

var path = "app-data/content-list.json"

exports.getContentList = function (cb, type, contentType) {
	var args = {
		data: {
			request: {
				"search": {
					"sort": ["name", "contentType"],
					"order": "desc"
				}
			}
		}
	}
	if (!downloading) {
		downloading = true
		restClient.postCall("/taxonomy-service/v2/content/list", args, function (err, data) {
			if (err) {
				cb(err)
			} else {
				var contents = data.result
				// eslint-disable-next-line
				var result = {}
				var contentList = []
				_.each(contents.content, function (object) {
					if (_.contains(SUPPORTED_MIMETYPES, object.mimeType)) {
						var map = {}
						map.identifier = object.identifier
						map.localData = object
						map.mimeType = object.mimeType
						map.isAvailable = false
						map.path = "stories/" + object.code
						contentList.push(map)
					}
				})
				localStorage(contentList, function (err, data) {
					if (err) { console.log(err) }
				})
			}
		})
	} else {
		var result = {}
		result.content = isAvailableList
		cb(null, result)
	}
}

function localStorage (contents, cb) {
	// eslint-disable-next-line
	var localMap = {}
	var asyncTask = []
	// eslint-disable-next-line
	jsonfile.readFile(path, function (err, localMap) {
		if (localMap === undefined) {
			// eslint-disable-next-line
			var promises = []
			_.each(contents, function (content) {
				asyncTask.push(function (callback) {
					downloadHelper(content)
				})
			})
			async.parallel(asyncTask, function (err, result) {
				cb(err, result)
			})
		} else {
			_.each(contents, function (content) {
				var dir = appConfig.STORY + "/" + content.localData.code

				if (fs.existsSync(dir) && _.findWhere(localMap, {
					"identifier": content.identifier
				})) {
					var localContent = _.findWhere(localMap, {
						"identifier": content.identifier
					})
					if (content.localData.pkgVersion !== localContent.localData.pkgVersion) {
						asyncTask.push(function (callback) {
							downloadHelper(content)
						})
					} else {
						localContent.isAvailable = true
						isAvailableList.push(localContent)
						contentList.push(localContent)
						writeFile(contentList)
						cb(localContent)
					}
				} else {
					asyncTask.push(function (callback) {
						downloadHelper(content)
					})
				}
			})
			async.parallel(asyncTask, function (err, result) {
				cb(err, result)
			})
		}
	})
}

function writeFile (obj) {
	jsonfile.writeFile(path, obj, {
		spaces: 2
	}, function (err) {
		if (err) { console.error(err) }
	})
}

function downloadHelper (content) {
	return new Promise(function (resolve, reject) {
		download(content.localData.downloadUrl, appConfig.STORY + content.localData.code)
			.then(function (resp) {
				content.isAvailable = true
				isAvailableList.push(content)
				contentList.push(content)
				writeFile(contentList)
				console.info("Content downloaded for " + content.identifier)
				resolve(content)
			}).catch(function (err) {
				reject(err)
			})
	})
}

function download (src, dest) {
	return new Promise(function (resolve, reject) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest)
		}
		new Download({
			mode: "777",
			extract: true
		}).get(src).dest(dest)
			.run(function (err, files) {
				if (err) { reject(err) } else {
					resolve({
						"downloading": "success"
					})
				}
			})
	})
}

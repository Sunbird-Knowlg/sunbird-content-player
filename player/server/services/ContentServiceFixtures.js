/**
 *
 * @author Jitendra Singh Sankhwar
 */
var fs = require("fs")

exports.getContentList = function (cb) {
	fs.readFile("app-data/fixture-content-list.json", "utf8", function (err, data) {
		if (err) {
			cb(err)
		} else {
			var obj = JSON.parse(data)
			console.log("Fetched content list.")
			if (obj != null) {
				cb(null, obj.result)
			} else {
				// eslint-disable-next-line
				cb("Content list not found for stories.")
			}
		}
	})
}

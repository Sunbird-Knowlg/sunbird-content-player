/**
 * View Helper for Content UX.
 *
 * @author Jitendra Singh SankhwarFixtures
 */
var service = (appConfig.APP_STATUS === "LIVE" ? require("../services/ContentService") : require("../services/ContentServiceFixtures"))

exports.getContentList = function (req, res) {
	service.getContentList(responseCB(res))
}

function responseCB (res) {
	return function (err, data) {
		if (err) {
			console.log(data)
			res.json({
				error: true,
				errorMsg: err
			})
		} else {
			console.log(data)
			res.json(data)
		}
	}
}

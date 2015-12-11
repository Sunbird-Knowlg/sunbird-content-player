
/**
 * Content Service - Invoke MW API's, transform data for UI and viceversa
 *
 * @author Mohammad Azharuddin
 */
var async = require('async')
	, mwService = require('../commons/MWServiceProvider')
	, util = require('../commons/Util')
	, _ = require('underscore');

exports.getContentList = function(cb, type, contentType) {
	var args = {
		path: {type: type, contentType: contentType},
		data: {
			request: {
			}
		}
	}
	mwService.postCall("/taxonomy-service/v1/content/list?type=${type}", args, function(err, data) {
		if(err) {
			cb(err);
		} else {
			var contents = data.result.content;
			var result = {};
			result.contents = contents;
			console.log("contents : ", contents);
			cb(null, result);
		}
	});
}



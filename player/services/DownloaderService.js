/*
 * Copyright (c) 2014-2015 Canopus Consulting. All rights reserved.
 *
 * This code is intellectual property of Canopus Consulting. The intellectual and technical
 * concepts contained herein may be covered by patents, patents in process, and are protected
 * by trade secret or copyright law. Any unauthorized use of this code without prior approval
 * from Canopus Consulting is prohibited.
 */

/**
 * View Helper for Content UX.
 *
 * @author Jitendra Singh Sankhwar
 */
var async = require('async')
	, util = require('../commons/Util');
var fs = require('fs');
var Download = require('download');

exports.downloadFromUrl = function(req, res) {
	var url = decodeURIComponent(req.params.url);
	var cb = util.responseCB(res);
	var dir = req.params.type.toLowerCase()== "story" ? (appConfig.STORY + req.params.id) : (appConfig.WORKSHEET + req.params.id);
	var type = req.params.type.toLowerCase() == "story" ? "stories" : "worksheets";
	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
	new Download({mode: '777', extract: true}).get(url).dest(dir)
    .run(function(err, files){
    	var baseDir = "/" + type + "/" + req.params.id;
    	cb(null, {"status": "ready", "baseDir": baseDir , "appIcon" : baseDir + "/logo.png", "errorCode": err});
    });
}


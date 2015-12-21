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
	, service = (appConfig.APP_STATUS == "LIVE" ? require('../services/ContentService') : require('../services/ContentServiceFixtures'))
	, util = require('../commons/Util');

exports.getContentList = function(req, res) {
	service.getContentList(util.responseCB(res), req.params.type, "application/json");
}


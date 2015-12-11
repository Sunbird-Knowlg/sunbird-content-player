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
 * @author Mohammad Azharuddin
 */
var async = require('async')
	, service = (require('../services/ContentService'))
	, util = require('../commons/Util');

exports.getContentList = function(req, res) {
	service.getContentList(util.responseCB(res), req.params.type, "application/json");
}


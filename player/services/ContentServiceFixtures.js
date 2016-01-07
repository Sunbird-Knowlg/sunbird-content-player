/*
 * Copyright (c) 2014-2015 Canopus Consulting. All rights reserved.
 *
 * This code is intellectual property of Canopus Consulting. The intellectual and technical
 * concepts contained herein may be covered by patents, patents in process, and are protected
 * by trade secret or copyright law. Any unauthorized use of this code without prior approval
 * from Canopus Consulting is prohibited.
 */

/**
 *
 * @author Jitendra Singh Sankhwar
 */
var async = require('async'), mwService = require('../commons/MWServiceProvider'), util = require('../commons/Util'), fs = require('fs'), _ = require('underscore');

exports.getContentList = function(cb) {
    fs.readFile('fixtures/stories.json', 'utf8', function(err, data) {
        if (err) {
            cb(err);
        } else {
            var obj = JSON.parse(data);
            if (obj != null) {
                cb(null, obj.result);
            } else {
                cb('Content list not found for stories.');
            }
        }
    });
}
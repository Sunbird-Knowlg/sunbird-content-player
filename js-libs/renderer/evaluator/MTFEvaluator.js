MTFEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];

		if (item) {
			// var index = [];
			// _.each(item.lhs_options, function(opt){
			// 	index.push(opt.index);
			// });
			var options = item.rhs_options;
			var selectedOptions = [];
			if (_.isArray(options)) {
				_.each(options ,function(opt) {

					// Generate telemetry if there was a response to this option (rhs -> lhs)
					if (typeof opt.selected != 'undefined') {
						var obj = {};
						obj[opt.value.resvalue] = opt.value.mapped;
						res.push(obj);
						selectedOptions.push(opt);
					}

					// Answer is specified and correctly matched
					if (typeof opt.answer != 'undefined') {
						if (opt.answer == opt.selected) {
							score += (_.isNumber(opt.score)) ? opt.score: 1;
						}
 					} else {
 						// Answer is not specified, but still matched (distractor)
 						if(typeof opt.selected != 'undefined') {
 							pass = false;
 						}
					 }
				});
			}

			if(pass){
				var ansMatched = (_.isEqual(_.pluck(selectedOptions, "selected"), _.pluck(selectedOptions, "answer")) && item.lhs_options.length == selectedOptions.length) || false;
				pass = ansMatched;
			}

			if (!pass) {
				result.feedback = item.feedback;
				if (!item.partial_scoring) {
					score = 0;
				}
			}
		}

		result.pass = pass;
		result.score = score;
		result.res = res;

		return result;
	},

	reset: function(item) {
		if (item) {
			var options = item.rhs_options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
					opt.selected = undefined;
					delete opt.value.mapped;
				});
			}
		}
	}

};

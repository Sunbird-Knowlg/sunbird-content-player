MTFEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];

		if (item) {
			var options = item.rhs_options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
					if (typeof opt.answer != 'undefined') {

						// rhs id -> lhs index
						if (typeof opt.selected != 'undefined') {
							res.push(opt.value.asset + '->' + opt.selected);
						}

						if (opt.answer == opt.selected) {
							console.log('correct answer');
							score += opt.score || 1;
						} else {
							pass = false;
						}
 					}
				});
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

		console.log(result);
		return result;
	},

	reset: function(item) {
		if (item) {
			var options = item.rhs_options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
					opt.selected = undefined;
				});
			}
		}
	}

};
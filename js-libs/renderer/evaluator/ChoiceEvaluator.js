MCQEvaluator = {
	readyToEvaluate: false,
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];

		if (item) {
			var options = item.options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
					
					// remember in telemetry what the response was 
					if (opt.selected) {
						res.push({"0": opt.value.asset});
					}

					// evaluate if this is correct answer
					if (opt.answer === true) {
						if (!opt.selected) {
							pass = false;
						} else {
							score += opt.score || 1;
						}
					} else {
						if (opt.selected === true) {
							pass = false;
							delete opt.selected;
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
		return result;
	},
	isReadyToEvaluate: function(item){
		if (item) {
			var options = item.options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
						
					// remember in telemetry what the response was 
					if (opt.selected) {
						readyToEvaluate = true;
					}
				});

				//None of the option is selected
				readyToEvaluate = false;
			}else{
				readyToEvaluate = options.selected;
			}
		}
	},
	reset: function(item) {
		if (item) {
			var options = item.options;
			if (_.isArray(options)) {
				options.forEach(function(opt) {
					opt.selected = undefined;
				});
			}
		}
	}
};
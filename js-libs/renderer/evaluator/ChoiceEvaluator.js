MCQEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];

		if (item) {
			var options = item.options;
			if (_.isArray(options)) {
				var isMCQ = false;
				var answersCount = 0;
                options.forEach(function(opt) {
                    if (opt.answer == true) {
                        answersCount++;
                    }
                });
                if (answersCount > 1) {
                    //if multiple ans is present then it is MMCQ
                    isMCQ = false;
                } else if (answersCount == 1) {
                    //if answer count is equalto one then it is MCQ
                    isMCQ = true;
                } else {
                    console.warn("Its not MCQ and MMCQ");
                    return;
                }
				options.forEach(function(opt) {

					// remember in telemetry what the response was
					if (opt.selected) {
						var tuple = {};
						tuple[opt.value.resvalue] = "true";
						res.push(tuple);
					}

					// evaluate if this is correct answer
					if (opt.answer === true) {
						if (!opt.selected) {
							pass = false;
						} else {
							score += (_.isNumber(opt.score)) ? opt.score: 1;
						}
					} else {
						if (opt.selected === true) {
							pass = false;
							if(isMCQ==true)
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

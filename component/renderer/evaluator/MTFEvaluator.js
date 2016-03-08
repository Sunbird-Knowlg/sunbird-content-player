MTFEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];
		var answer = {};
		if (item) {
			var index = [];
			_.each(item.lhs_options, function(opt){
				index.push(opt.index);
			});
			var options = item.rhs_options;
			if (_.isArray(options)) {
				_.each(options ,function(opt) {
					if (typeof opt.answer != 'undefined') {

						// rhs id -> lhs index
						if (typeof opt.selected != 'undefined') {
							var obj = {};
							obj[opt.value.asset] = opt.selected;
							res.push(obj);
						} 

						if (opt.answer == opt.selected) {
							score += opt.score || 1;
							answer[opt.value.asset] = true;
						} else {
							if(!(_.contains(index, opt.answer)) && (opt.selected != undefined))
								pass = false; 
							else if(_.contains(index, opt.answer) && opt.selected || _.contains(index, opt.answer) && !opt.selected)
								answer[opt.value.asset] = false;
						}
 					} else {
 						if(typeof opt.selected != 'undefined') {
 							pass = false;
 							var key = opt.value.asset;
 							var obj = {};
 							obj[opt.value.asset] = opt.selected;
 							res.push(obj);
 						}
 					}
				});
			}
			_.map(answer, function(value, key){
				if(!value)
					pass = false;
			})

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
				});
			}
		}
	}

};
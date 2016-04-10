FTBEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];

		if (item) {
			var answer = item.answer;
			var model = item.model;
			for (var ans in answer) {

				// each value answered
				if (model[ans]) {
					var obj = {};
					obj[ans] = model[ans];
					res.push(obj);
				}

				if (model[ans] && answer[ans] && answer[ans].value) {
					if (_.isString(answer[ans].value)) answer[ans].value = answer[ans].value.toLowerCase();
					if (_.isString(model[ans])) model[ans] = model[ans].toLowerCase();
					(answer[ans].value == model[ans]) ? score += answer[ans].score : pass = false;
				} else {
					pass = false;
				}
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
			var answer = item.answer;
			var model = item.model;
			for (var ans in answer) {
				if (model[ans]) {
					model[ans] = "";
				}
			}
		}
	}
};
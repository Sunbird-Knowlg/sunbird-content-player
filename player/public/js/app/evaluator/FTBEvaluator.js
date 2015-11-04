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
					res.push(ans + '=' + model[ans]);
				}

				if (model[ans] && answer[ans].value == model[ans]) {
					score += answer[ans].score;
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
					model[ans] = undefined;
				}
			}
		}
	}
};
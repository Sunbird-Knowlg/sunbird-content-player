FTBEvaluator = {
	evaluate: function(item) {
		var result = {};
		var pass = true;
		var score = 0;
		var res = [];
		

		if (item) {
			var answer = item.answer;
			var passCount=0;
			var model = item.model || {};
			for (var ans in answer) {

				// each value answered
				if (model[ans]) {
					var obj = {};
					obj[ans] = model[ans];
					res.push(obj);
				}
				if (("undefined" != typeof model[ans]) && ("undefined" != typeof answer[ans]) && ("undefined" != typeof answer[ans].value)) {
					var isCorrect = this._isCorrectAnswer(answer[ans].value, model[ans]);
					console.info(isCorrect,"isCorrect");
					if (isCorrect) {
						var s = answer[ans].score;
						score += (_.isNumber(s) ? s: 1);
						//pass = true;
						passCount++;
					} else {
						//pass = false;
						passCount--;
					}
					if(passCount==res.length){
						pass=true;
					}else{
						pass=false;
					}

				} else {
					console.warn('Answer is undefined', answer);
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
	_isCorrectAnswer: function(actual, given) {
		var isCorrect = false;
		actual = _.isString(actual) ? actual.toLowerCase() : actual;
		given = _.isString(given) ? given.toLowerCase() : given;
		if (_.isString(actual)) {
			if (-1 < actual.indexOf(",")) {
				var actualList = actual.split(",");
				for(var index in actualList) {
					if (actualList[index] == given) {
						isCorrect = true;
						break;
					}
				}
			} else {
				isCorrect = (actual == given) ? true : false;
			}
		} else {
			isCorrect = (actual == given) ? true : false;
		}
		return isCorrect;
	},
	reset: function(item) {
		if (item) {
			var answer = item.answer;
			var model = item.model || {};
			for (var ans in answer) {
				if (model[ans]) {
					model[ans] = "";
				}
			}
		}
	}
};
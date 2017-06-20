MCQEvaluator = {
    evaluate: function(item) {
        var result = {}, pass = !0, score = 0, res = [];
        if (item) {
            var options = item.options;
            if (_.isArray(options)) {
                var isMCQ = !1, answersCount = 0;
                if (options.forEach(function(opt) {
                    1 == opt.answer && answersCount++;
                }), answersCount > 1) isMCQ = !1; else {
                    if (1 != answersCount) return void console.warn("Its not MCQ and MMCQ");
                    isMCQ = !0;
                }
                options.forEach(function(opt) {
                    if (opt.selected) {
                        var tuple = {};
                        tuple[opt.value.resindex] = opt.value.resvalue, res.push(tuple);
                    }
                    !0 === opt.answer ? opt.selected ? score += _.isNumber(opt.score) ? opt.score : 1 : pass = !1 : !0 === opt.selected && (pass = !1, 
                    1 == isMCQ && delete opt.selected);
                });
            }
            pass || (result.feedback = item.feedback, item.partial_scoring || (score = 0));
        }
        return result.pass = pass, result.score = score, result.res = res, result;
    },
    reset: function(item) {
        if (item) {
            var options = item.options;
            _.isArray(options) && options.forEach(function(opt) {
                opt.selected = void 0;
            });
        }
    }
}, FTBEvaluator = {
    evaluate: function(item) {
        var result = {}, pass = !0, score = 0, res = [];
        if (item) {
            var answer = item.answer, passCount = 0, model = item.model || {};
            for (var ans in answer) {
                if (model[ans]) {
                    var obj = {};
                    obj[ans] = model[ans], res.push(obj);
                }
                if (void 0 !== model[ans] && void 0 !== answer[ans] && void 0 !== answer[ans].value) {
                    var isCorrect = this._isCorrectAnswer(answer[ans].value, model[ans]);
                    if (console.info(isCorrect, "isCorrect"), isCorrect) {
                        var s = answer[ans].score;
                        score += _.isNumber(s) ? s : 1, passCount++;
                    } else passCount--;
                    pass = passCount == res.length;
                } else console.warn("Answer is undefined", answer), pass = !1;
            }
            pass || (result.feedback = item.feedback, item.partial_scoring || (score = 0));
        }
        return result.pass = pass, result.score = score, result.res = res, result;
    },
    _isCorrectAnswer: function(actual, given) {
        var isCorrect = !1;
        if (actual = _.isString(actual) ? actual.toLowerCase() : actual, given = _.isString(given) ? given.toLowerCase() : given, 
        _.isString(actual)) if (-1 < actual.indexOf(",")) {
            var actualList = actual.split(",");
            for (var index in actualList) if (actualList[index] == given) {
                isCorrect = !0;
                break;
            }
        } else isCorrect = actual == given; else isCorrect = actual == given;
        return isCorrect;
    },
    reset: function(item) {
        if (item) {
            var answer = item.answer, model = item.model || {};
            for (var ans in answer) model[ans] && (model[ans] = "");
        }
    }
}, MTFEvaluator = {
    evaluate: function(item) {
        var result = {}, pass = !0, score = 0, res = [];
        if (item) {
            var options = item.rhs_options;
            if (_.isArray(options) && _.each(options, function(opt) {
                if (void 0 !== opt.selected) {
                    var obj = {};
                    obj[opt.value.resvalue] = opt.value.mapped, res.push(obj);
                }
                void 0 !== opt.answer ? opt.answer == opt.selected && (score += _.isNumber(opt.score) ? opt.score : 1) : void 0 !== opt.selected && (pass = !1);
            }), pass) {
                var ansMatched = _.isEqual(_.pluck(options, "selected"), _.pluck(options, "answer"));
                pass = ansMatched;
            }
            pass || (result.feedback = item.feedback, item.partial_scoring || (score = 0));
        }
        return result.pass = pass, result.score = score, result.res = res, result;
    },
    reset: function(item) {
        if (item) {
            var options = item.rhs_options;
            _.isArray(options) && options.forEach(function(opt) {
                opt.selected = void 0, delete opt.value.mapped;
            });
        }
    }
};
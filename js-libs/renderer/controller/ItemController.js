var ItemController = Controller.extend({
    assessStartEvent: undefined,
    initController: function(ic, baseDir) {
        if (ic.__cdata) {
            var data = (_.isString(ic.__cdata)) ? JSON.parse(ic.__cdata) : ic.__cdata;
            ItemDataGenerator._onLoad(data, this);
        } else {
            ItemDataGenerator.loadData(baseDir, ic.type, ic.id, this);
        }
    },
    onLoad: function(data, model) {
        if (_.isObject(data) && _.isArray(model)) {
            ControllerManager.registerControllerInstance(this._id, this);
            this._data = data;
            this._loaded = true;
            this._model = model;
            this._repeat = this._model.length;
        } else {
            this._error = true;
        }
    },
    next: function() {
        var d;
      try {
        if (this.hasNext()) {
            this._index += 1;
            var item = this._model[this._index];
            if (item) {
                // Reset the current state of the item (in case one is going back and forth)
                this.resetItem(item);

                if ("undefined" == typeof item.model || null == item.model) item.model = {};
                // Start assessment telemetry
                d = item.model;

                try {
                    this.assessStartEvent = TelemetryService.assess((_.isString(item.identifier) && !_.isEmpty(item.identifier)) ? item.identifier : item.qid.trim(), this._data.subject, item.qlevel, {
                        maxscore: item.max_score
                    }).start();
                } catch (e) {
                    ControllerManager.addError('ItemController.next() - OE_ASSESS_START error: ' + e);
                }
            }
        }
        else{
            //when we have only one item then call reset
            this.resetItem(this._model[this._index]);
        }
        return d;
      }catch(e) {
          //TelemetryService.error(e.stack);
          showToaster('error','Invalid questions');
          console.warn("Item controller have some issue due to",e);
        }  
    },
    resetItem: function(item) {
        if (item) {
            if (item.type.toLowerCase() == 'ftb') {
                FTBEvaluator.reset(item);
            } else if ((item.type.toLowerCase() == 'mcq' || item.type.toLowerCase() == 'mmcq')) { // need to modify and re look at hasStageSet
                MCQEvaluator.reset(item);
            } else if (item.type.toLowerCase() == 'mtf') {
                MTFEvaluator.reset(item);
            }
        }
    },
    evalItem: function() {
    try {  
      var item = this.getModel();
      var result;
      var pass = false;
      /*if (item.max_score == 0) {
          console.warn("Max score(max_score) is not defined for this item.", item);
          result = {};
      }*/
      if (item.type.toLowerCase() == 'ftb') {
          result = FTBEvaluator.evaluate(item);
      } else if (item.type.toLowerCase() == 'mcq' || item.type.toLowerCase() == 'mmcq') {
          result = MCQEvaluator.evaluate(item);
      } else if (item.type.toLowerCase() == 'mtf') {
          result = MTFEvaluator.evaluate(item);
      }
      if (result) {
          pass = result.pass;
          item.score = result.score;
      }
          var data = {
              pass: result.pass,
              score: item.score,
              res: result.res,
              mmc: item.mmc,
              qindex: item.qindex,
              mc: _.pluck(item.concepts, 'identifier'),
              qtitle: item.title,
              qdesc : item.description ? item.description : ""
          };
          TelemetryService.assessEnd(this.assessStartEvent, data);

      } catch (e) {
          console.warn("Item controller failed due to",e);
          showToaster('error','Evaluation fails');
          ControllerManager.addError('ItemController.evalItem() - OE_ASSESS_END error: ' + e);
      }

      console.info("Item Eval result:", result);
      return result;
  },
    feedback: function() {
        var message;
        var feedback = this._data.feedback;
        if (feedback) {
            var score = 0;
            if (this._model) {
                if (_.isArray(this._model)) {
                    this._model.forEach(function(item) {
                        if (item.score) {
                            score += item.score;
                        }
                    });
                } else {
                    if (this._model.score) {
                        score = this._model.score;
                    }
                }
            }
            var percent = parseInt((score / this._data.max_score) * 100);
            feedback.forEach(function(range) {
                var min = 0;
                var max = 100;
                if (range.range) {
                    if (range.range.min) {
                        min = range.range.min;
                    }
                    if (range.range.max) {
                        max = range.range.max;
                    }
                }
                if (percent >= min && percent <= max) {
                    message = range.message;
                }
            });
        }
        return message;
    }
});
ControllerManager.registerController('items', ItemController);

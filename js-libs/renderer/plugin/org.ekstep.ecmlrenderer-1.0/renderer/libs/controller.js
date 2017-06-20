ControllerManager = {
    controllerMap: {},
    instanceMap: {},
    errors: [],
    reset: function() {
        ControllerManager.instanceMap = {};
    },
    registerController: function(type, controller) {
        ControllerManager.controllerMap[type] = controller;
    },
    isController: function(type) {
        return !!ControllerManager.controllerMap[type];
    },
    get: function(c, baseDir) {
        var d, controllerMap = ControllerManager.controllerMap;
        if (c.type && c.id) if (controllerMap[c.type]) {
            var controllerId = c.type + "." + c.id;
            d = ControllerManager.getControllerInstance(controllerId), d || (d = new controllerMap[c.type](c, baseDir));
        } else ControllerManager.addError("No Controller found for - " + c.type);
        return d;
    },
    registerControllerInstance: function(id, instance) {
        ControllerManager.instanceMap[id] = instance;
    },
    getControllerInstance: function(id) {
        return ControllerManager.instanceMap[id];
    },
    addError: function(error) {
        ControllerManager.errors.push(error);
    },
    getErrors: function() {
        return ControllerManager.errors;
    }
};

var Controller = Class.extend({
    _id: "",
    _data: void 0,
    _type: void 0,
    _model: void 0,
    _repeat: 0,
    _index: -1,
    _loaded: !1,
    _error: !1,
    init: function(c, baseDir) {
        this._type = c.type, this._id = c.type + "." + c.id, this.initController(c, baseDir);
    },
    initController: function(c, baseDir) {
        ControllerManager.addError("Subclasses of Controller should implement initController()");
    },
    onLoad: function(data, model) {
        ControllerManager.addError("Subclasses of Controller should implement onLoad()");
    },
    reset: function() {
        this._index = -1;
    },
    setIndex: function(idx) {
        this._loaded && (idx && (this._index = idx), this._index < -1 && (this._index = -1), 
        this._index >= this._repeat && (this._index = this._repeat - 1));
    },
    incrIndex: function(incr) {
        this._loaded && (incr || (incr = 1), this._index = this._index + incr, this._index >= this._repeat && (this._index = this._repeat - 1));
    },
    decrIndex: function(decr) {
        this._loaded && (decr || (decr = 1), this._index = this._index - decr, this._index < -1 && (this._index = -1));
    },
    getModel: function() {
        var m;
        if (_.isArray(this._model)) {
            var index = this._index;
            index < 0 && (index = 0), m = this._model[index];
        } else m = this._model;
        return m;
    },
    getTemplate: function() {
        var t;
        if (this._model) {
            var m = this.getModel();
            m && m.template && (t = m.template);
        }
        return t;
    },
    getModelValue: function(param) {
        var val;
        if (this._model && param) {
            var m = this.getModel();
            if (m) {
                try {
                    val = eval("m." + param);
                } catch (e) {}
                if (!val && m.model) {
                    m = m.model;
                    try {
                        val = eval("m." + param);
                    } catch (e) {}
                }
            }
        } else this._model && (val = this.getModel());
        return val;
    },
    setModelValue: function(name, val, param) {
        if (name) {
            var m = this.getModel();
            if (m) {
                var o = eval("m." + name);
                !o && m.model && (m = m.model);
                var expr = "m." + name;
                param && (expr += "." + param), expr += " = " + JSON.stringify(val);
                try {
                    eval(expr);
                } catch (e) {}
            }
        }
    },
    getCount: function() {
        return this._repeat;
    },
    hasNext: function() {
        return !!this._loaded && this._index < this._repeat - 1;
    },
    hasPrevious: function() {
        return !!this._loaded && this._index > 0;
    },
    next: function() {
        var d;
        return this.hasNext() && (this._index += 1, d = this._getCurrentModelItem()), d;
    },
    previous: function() {
        var d;
        return this.hasPrevious() && (this._index -= 1, d = this._getCurrentModelItem()), 
        d;
    },
    current: function() {
        var d;
        return this._loaded && this._index >= 0 && this._index <= this._repeat - 1 && (d = this._getCurrentModelItem()), 
        d;
    },
    evalItem: function() {
        ControllerManager.addError("evalItem() is not supported by this Controller");
    },
    feedback: function() {
        ControllerManager.addError("feedback() is not supported by this Controller");
    },
    _getCurrentModelItem: function() {
        var item;
        return item = _.isArray(this._model) ? this._model[this._index] : this._model, item && item.model && (item = item.model), 
        item;
    }
}), DataController = Controller.extend({
    initController: function(dc, baseDir) {
        if (dc.__cdata) {
            var data = _.isString(dc.__cdata) ? JSON.parse(dc.__cdata) : dc.__cdata;
            this.onLoad(data);
        } else DataGenerator.loadData(baseDir, dc.type, dc.id, this);
    },
    onLoad: function(data) {
        data ? (ControllerManager.registerControllerInstance(this._id, this), this._data = data, 
        this._loaded = !0, data.model ? this._model = data.model : this._model = data, _.isArray(this._model) ? this._repeat = this._model.length : this._repeat = 1) : this._error = !0;
    }
});

ControllerManager.registerController("data", DataController);

var ItemController = Controller.extend({
    assessStartEvent: void 0,
    initController: function(ic, baseDir) {
        if (ic.__cdata) {
            var data = _.isString(ic.__cdata) ? JSON.parse(ic.__cdata) : ic.__cdata;
            ItemDataGenerator._onLoad(data, this);
        } else ItemDataGenerator.loadData(baseDir, ic.type, ic.id, this);
    },
    onLoad: function(data, model) {
        _.isObject(data) && _.isArray(model) ? (ControllerManager.registerControllerInstance(this._id, this), 
        this._data = data, this._loaded = !0, this._model = model, this._repeat = this._model.length) : this._error = !0;
    },
    next: function() {
        var d;
        try {
            if (this.hasNext()) {
                this._index += 1;
                var item = this._model[this._index];
                if (item) {
                    this.resetItem(item), void 0 !== item.model && null != item.model || (item.model = {}), 
                    d = item.model;
                    try {
                        this.assessStartEvent = TelemetryService.assess(_.isString(item.identifier) && !_.isEmpty(item.identifier) ? item.identifier : item.qid.trim(), this._data.subject, item.qlevel, {
                            maxscore: item.max_score
                        }).start();
                    } catch (e) {
                        EkstepRendererAPI.logErrorEvent(e, {
                            type: "content",
                            severity: "fatal",
                            action: "transitionTo",
                            objectId: item.identifier,
                            objectType: "question"
                        }), ControllerManager.addError("ItemController.next() - OE_ASSESS_START error: " + e);
                    }
                }
            } else this.resetItem(this._model[this._index]);
            return d;
        } catch (e) {
            EkstepRendererAPI.logErrorEvent(e, {
                type: "content",
                severity: "fatal",
                action: "transitionTo"
            }), showToaster("error", "Invalid questions"), console.warn("Item controller have some issue due to", e);
        }
    },
    resetItem: function(item) {
        item && ("ftb" == item.type.toLowerCase() ? FTBEvaluator.reset(item) : "mcq" == item.type.toLowerCase() || "mmcq" == item.type.toLowerCase() ? MCQEvaluator.reset(item) : "mtf" == item.type.toLowerCase() && MTFEvaluator.reset(item));
    },
    evalItem: function() {
        try {
            var result, item = this.getModel();
            "ftb" == item.type.toLowerCase() ? result = FTBEvaluator.evaluate(item) : "mcq" == item.type.toLowerCase() || "mmcq" == item.type.toLowerCase() ? result = MCQEvaluator.evaluate(item) : "mtf" == item.type.toLowerCase() && (result = MTFEvaluator.evaluate(item)), 
            result && (result.pass, item.score = result.score);
            var data = {
                pass: result.pass,
                score: item.score,
                res: result.res,
                mmc: item.mmc,
                qindex: item.qindex,
                mc: _.pluck(item.concepts, "identifier"),
                qtitle: item.title,
                qdesc: item.description ? item.description : ""
            };
            TelemetryService.assessEnd(this.assessStartEvent, data);
        } catch (e) {
            console.warn("Item controller failed due to", e), EkstepRendererAPI.logErrorEvent(e, {
                type: "content",
                severity: "error",
                action: "eval",
                objectId: item.identifier,
                objectType: "question"
            }), showToaster("error", "Evaluation Fails"), ControllerManager.addError("ItemController.evalItem() - OE_ASSESS_END error: " + e);
        }
        return console.info("Item Eval result:", result), result;
    },
    feedback: function() {
        var message, feedback = this._data.feedback;
        if (feedback) {
            var score = 0;
            this._model && (_.isArray(this._model) ? this._model.forEach(function(item) {
                item.score && (score += item.score);
            }) : this._model.score && (score = this._model.score));
            var percent = parseInt(score / this._data.max_score * 100);
            feedback.forEach(function(range) {
                var min = 0, max = 100;
                range.range && (range.range.min && (min = range.range.min), range.range.max && (max = range.range.max)), 
                percent >= min && percent <= max && (message = range.message);
            });
        }
        return message;
    }
});

ControllerManager.registerController("items", ItemController);
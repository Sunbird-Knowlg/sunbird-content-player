var SetPlugin = Plugin.extend({
    _type: 'set',
    _isContainer: false,
    _modelName: undefined,
    _model: undefined,
    _index: 0,
    _render: false,
    initPlugin: function(data) {
        this._modelName = undefined;
        this._model = undefined;
        this._index = 0;
        var value = data.value;
        if (data['ev-value']) {
            this._modelName = data.param;
            this._model = this.evaluateExpr(data['ev-value']);
            if (_.isArray(this._model)) {
                value = this._model[0];
            } else {
                value = this._model;
            }
        } else if (data['model']) {
            if (this._stage) {
                value = this._stage.getModelValue(data['model']);
            }
        } else if (data['ev-model']) {
            if (this._stage) {
                var model = this.replaceExpressions(data['ev-model']);
                this._modelName = data.param;
                this._model = this._stage.getModelValue(model);
                if (_.isArray(this._model)) {
                    value = this._model[0];
                } else {
                    value = this._model;
                }
            }
        }
        this.setParam(data.param, value, undefined, data.scope);
    },
    replaceExpressions: function(model) {
        var arr = [];
        var idx = 0;
        var nextIdx = model.indexOf('${', idx);
        var endIdx = model.indexOf('}', idx + 1);
        while (nextIdx != -1 && endIdx != -1) {
            var expr = model.substring(nextIdx, endIdx+1);
            arr.push(expr);
            idx = endIdx;
            nextIdx = model.indexOf('${', idx);
            endIdx = model.indexOf('}', idx + 1);
        }
        if (arr.length > 0) {
            for (var i=0; i<arr.length; i++) {
                var val = this.evaluateExpr(arr[i]);
                model = model.replace(arr[i], val);
            }
        }
        return model;
    },
    setParamValue: function(action) {
        var scope = action.scope;
        var param = action.param;
        var paramIdx = action['param-index'];
        var paramKey = action['param-key'];
        var paramExpr = action['ev-value'];
        var paramModel = action['ev-model'];
        var val;
        if (paramIdx) {
            if (paramIdx == 'previous') {
                if (_.isArray(this._model) && this._model.length > 0) {
                    if (this._index > 0) {
                        this._index = (this._index - 1);
                    } else {
                        this._index = (this._model.length - 1);
                    }
                    val = this._model[this._index];
                } else {
                    val = this._model;
                }
            } else {
                if (_.isArray(this._model)) {
                    if (this._index < this._model.length - 1) {
                        this._index = (this._index + 1);
                    } else {
                        this._index = 0;
                    }
                    val = this._model[this._index];
                } else {
                    val = this._model;
                }
            }
        } else if (paramKey) {
            if (_.isObject(this._model) && this.model[paramKey]) {
                val = this.model[paramKey];
            } else {
                val = '';
            }
        } else if (paramExpr) {
            this._model = this.evaluateExpr(paramExpr);
            if (_.isArray(this._model)) {
                val = this._model[0];
            } else {
                val = this._model;
            }
        } else if (paramModel) {
            if (this._stage) {
                var model = this.replaceExpressions(paramModel);
                this._model = this._stage.getModelValue(model);
                if (_.isArray(this._model)) {
                    val = this._model[0];
                } else {
                    val = this._model;
                }
            }
        } else {
            val = action['param-value'];
        }
        // if ("undefined" == typeof val) val = 0;
        // if ("undefined" != typeof val && 0 > val ) val = action['param-incr'] = 0;
        var max = undefined;
        if (action['param-max']) {
             max = this.evaluateExpr(action['param-max']);
            if (val >= max) val = action['param-incr'] = 0;
        }
        this.setParam(param, val, action['param-incr'], scope, max);
        // this.setParam(param, val, action['param-incr'], scope);
    },
    setParam: function(param, value, incr, scope, max) {
        if (scope && scope.toLowerCase() == 'app') {
            GlobalContext.setParam(param, value, incr, max);
        } else if (scope && scope.toLowerCase() == 'stage') {
            this._stage.setParam(param, value, incr, max);
        } else if (scope && scope.toLowerCase() == 'parent') {
            this._parent.setPluginParam(param, value, incr, max);
        } else {
            this._theme ? this._theme.setParam(param, value, incr, max) : undefined;
        }
    },
    getParam: function(param) {
        var value = GlobalContext.getParam(param);
        if (!value && !_.isUndefined(this._theme)) value = this._theme.getParam(param);
        if (!value) value = this._stage.getParam(param);
        if (!value && !_.isUndefined(this._theme)) value = this._parent.getPluginParam(param);
        return value;
    }
});
PluginManager.registerPlugin('set', SetPlugin);

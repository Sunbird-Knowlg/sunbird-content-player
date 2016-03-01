var StagePlugin = Plugin.extend({
    _type: 'stage',
    _render: true,
    params: {},
    _stageParams: {},
    _stageController: undefined,
    _stageControllerName: undefined,
    _templateVars: {},
    _controllerMap: {},
    _inputs: [],
    initPlugin: function(data) {
        this._inputs = [];
        var instance = this;
        this.params = {};
        this._self = new creatine.Scene();;
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        if (data.iterate && data.var) {
            var controllerName = data.var.trim();
            var stageController = this._theme._controllerMap[data.iterate.trim()];
            if (stageController) {
                if (this._theme._previousStage && this._theme._previousStage != data.id) {
                    stageController.reset();
                }
                this._stageControllerName = controllerName;
                this._stageController = stageController;
                this._stageController.next();
            }
        }
        for (k in data) {
            if(k === 'param') {
                if(_.isArray(data[k])) {
                    var instance = this;
                    data[k].forEach(function(param) {
                        instance.setParamValue(param);
                    });
                } else {
                    this.setParamValue(data[k]);
                }
            } else if (k === 'controller') {
                if(_.isArray(data[k])) {
                    data[k].forEach(function(p) {
                        this.addController(p);
                    });
                } else {
                    this.addController(data[k]);
                }
            }
        }
        this.invokeChildren(data, this, this, this._theme);
    },
    setParamValue: function(p) {
        if (p.value) {
            this.params[p.name] = p.value;
        } else if (p.model) {
            this.params[p.name] = this.getModelValue(p.model);
        }
    },
    addController: function(p) {
        var add = true;
        // Conditional evaluation to add controller.
        if (p['ev-if']) {
            var expr = p['ev-if'].trim();
            if (!(expr.substring(0,2) == "${")) expr = "${" + expr;
            if (!(expr.substring(expr.length-1, expr.length) == "}")) expr = expr + "}"
            add = this.evaluateExpr(expr);
        }
        if (add) {
            var controller = ControllerManager.get(p, this._theme.baseDir);
            if (controller) {
                this._controllerMap[p.name] = controller;
            }
        }
    },
    getController: function(name) {
        var c;
        if (this._templateVars[name]) {
            name = this._templateVars[name];
        }
        if (this._stageControllerName === name) {
            c = this._stageController;
        } else if (this._controllerMap[name]) {
            c = this._controllerMap[name];
        } else if (this._theme._controllerMap[name]) {
            c = this._theme._controllerMap[name];
        }
        return c;
    },
    getTemplate: function(controller) {
        var c = this.getController(controller);
        var t;
        if (c) {
            t = c.getTemplate();   
        }
        return t;
    },
    getModelValue: function(param) {
        var val;
        if (param) {
            var tokens = param.split('.');
            if (tokens.length >= 2) {
                var name = tokens[0].trim();
                var idx = param.indexOf('.');
                var paramName = param.substring(idx+1);
                if (this._templateVars[name]) {
                    name = this._templateVars[name];
                    if (name.indexOf('.') > 0) {
                        paramName = name.substring(name.indexOf('.')+1) +'.' + paramName;
                        name = name.substring(0, name.indexOf('.'));
                    }
                }
                var controller = this.getController(name);
                if (controller) {
                    val = controller.getModelValue(paramName);
                }
            }
        }
        return val;
    },
    setModelValue: function(param, val) { 
        if (param) {
            var tokens = param.split('.');
            if (tokens.length >= 2) {
                var name = tokens[0].trim();
                var idx = param.indexOf('.');
                var paramName = param.substring(idx+1);
                var controller = this.getController(name);
                if (controller) {
                    val = controller.setModelValue(paramName, val);
                }
            }
        }
    },
    evaluate: function(action) {
        var valid = false;
        if (this._stageController) {
            this._inputs.forEach(function(input) {
                input.setModelValue();
            });
            var result = this._stageController.evalItem();
            if (result) {
                valid = result.pass;    
            }
        }
        if (valid) {
            this.dispatchEvent(action.success);
        } else {
            this.dispatchEvent(action.failure);
        }
    },
    reload: function(action) {
        if (this._stageController) {
            this._stageController.decrIndex(1);
        }
        this._theme.replaceStage(this._data.id, action);
    },
    setParam: function(param, value) {
        var instance = this;
        instance._stageParams[param] = value;
    },
    getParam: function(param) {
        var instance = this;
        return instance._stageParams[param];
    }
});
PluginManager.registerPlugin('stage', StagePlugin);

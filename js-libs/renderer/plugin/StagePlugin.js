var StagePlugin = Plugin.extend({
    _type: 'stage',
    _isContainer: true,
    _render: true,
    params: {},
    _stageParams: {},
    _stageController: undefined,
    _stageControllerName: undefined,
    _templateVars: {},
    _controllerMap: {},
    _inputs: [],
    _startDrag: undefined,
    _doDrag: undefined,
    _stageInstanceId: undefined,
    _currentState: {},
    isStageStateChanged: undefined,
    maxTimeToLoad: 5000,
    timeInstance: {},
    initPlugin: function(data) {
        var instance = this;
        //Should be released in April Release
        this.destroyTimeInstance(data);
        this._inputs = [];
        this.params = {};
        this._self = new creatine.Scene();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._stageInstanceId = this._theme._currentStage + '__' + Math.random().toString(36).substr(2, 9);
        if (data.iterate && data.var) {
            var controllerName = data.var.trim();
            var stageController = this._theme._controllerMap[data.iterate.trim()];
            if (stageController) {
                /*if (this._theme._previousStage && this._theme._previousStage != data.id) {
                    stageController.reset();
                }*/
                this._stageControllerName = controllerName;
                this._stageController = stageController;
                this._stageController.next();
            }
        }
        for (k in data) {
            if (k === 'param') {
                if (_.isArray(data[k])) {
                    var instance = this;
                    data[k].forEach(function(param) {
                        instance.setParamValue(param);
                    });
                } else {
                    this.setParamValue(data[k]);
                }
            } else if (k === 'controller') {
                if (_.isArray(data[k])) {
                    data[k].forEach(function(p) {
                        this.addController(p);
                    });
                } else {
                    this.addController(data[k]);
                }
            }
        }
        // handling keyboard interaction.
        this._startDrag = this.startDrag.bind(this);
        this._doDrag = this.doDrag.bind(this);
        window.addEventListener('native.keyboardshow', this.keyboardShowHandler.bind(this), true);
        window.addEventListener('native.keyboardhide', this.keyboardHideHandler.bind(this), true);
        // get object data from the theme object
        var stageKey = this.getStagestateKey();
        if (typeof this._theme.getParam === "function") {
            this._currentState = this._theme.getParam(stageKey);
            if (_.isUndefined(this._currentState)) {
                this.setParam(this._type, {
                    id: Renderer.theme._currentStage,
                    stateId: stageKey
                });
            }
        }
        // Should be released in April Release
        var isStageLoaded;
        if (!_.isUndefined(AssetManager.strategy)) {
            isStageLoaded = AssetManager.strategy.isStageAssetsLoaded(data.id);
        }
        if (isStageLoaded == false) {
            var timeInst;
            //If assets is not loaded, add a event bus which will be trigurred as soon as assets are loaded completely
            EventBus.addEventListener(data.id + '_assetsLoaded', instance.invokeRenderElements, this);
            timeInst = setTimeout(function() {
                // if manifest loading time is less
                // Its very irritating to show loader even less time on each stage, so
                // Waiting 0.5 sec before showing loader
                isStageLoaded = AssetManager.strategy.isStageAssetsLoaded(data.id);
                if (!isStageLoaded && instance._theme._currentStage == data.id) {
                    instance.showHideLoader('block')
                    timeInst = setTimeout(function() {
                        // If some how loader didn't go off, after 5 sec we are removing
                        if (jQuery('#loaderArea').css('display') == 'block' && instance._theme._currentStage == instance._data.id) {
                            instance.invokeRenderElements();
                        }
                    }, instance.maxTimeToLoad)
                    instance.timeInstance[data.id] = timeInst;
                }
            }, 500)
            this.timeInstance[data.id] = timeInst;
            return
        }
        this.invokeChildren(data, this, this, this._theme);
        this.logImpressionEvent();
    },
    logImpressionEvent: function(){
        if (!_.isUndefined(Renderer.theme._previousStage) && Renderer.theme._previousStage != Renderer.theme._currentStage) {
            TelemetryService.navigate(Renderer.theme._previousStage, Renderer.theme._currentStage, {
                "duration": (Date.now()/1000) - window.PLAYER_STAGE_START_TIME
            });
        }
    },
    destroyTimeInstance: function(data) {
        if (Renderer.theme && Renderer.theme.getStagesToPreLoad) {
            var stages = Renderer.theme.getStagesToPreLoad(data);
            if (!_.isUndefined(stages.next) && this.timeInstance[stages.next]) {
                clearTimeout(this.timeInstance[stages.next]);
                delete this.timeInstance[stages.next];
            }
            if (!_.isUndefined(stages.prev) && this.timeInstance[stages.prev]) {
                clearTimeout(this.timeInstance[stages.prev]);
                delete this.timeInstance[stages.prev];
            }
        }
    },
    invokeRenderElements: function() {
        this.invokeChildren(this._data, this, this, this._theme);
        this.logImpressionEvent();
        Renderer.update = true;
        this.showHideLoader('none');
        if (!_.isUndefined(Renderer.theme) && !_.isUndefined(Renderer.theme._currentScene)) {
            Renderer.theme._currentScene.dispatchEvent('enter');
        }
        EventBus.removeEventListener(this._data.id + '_assetsLoaded', this.invokeRenderElements, this);
    },
    keyboardShowHandler: function(e) {
        this._self.y = -(e.keyboardHeight);
        if (!this._self.hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawRect(0, 0, this._self.width, this._self.height);
            this._self.hitArea = hit;
            console.info("HitArea added to the stage.");
        }
        Renderer.update = true;
        this.keyboardH = e.keyboardHeight;
        this._self.addEventListener("mousedown", this._startDrag);
        this.offset = new createjs.Point();

    },
    startDrag: function() {
        this.offset.x = Renderer.theme._self.mouseX - this._self.x;
        this.offset.y = Renderer.theme._self.mouseY - this._self.y;
        this._self.addEventListener("pressmove", this._doDrag);
    },
    doDrag: function(event) {
        if (this._self.y >= this.keyboardH || this._self.y >= -this.keyboardH) {
            this._self.y = event.stageY - this.offset.y;
            if (this._self.y < -this.keyboardH)
                this._self.y = -this.keyboardH + 1;
            if (this._self.y > 0)
                this._self.y = 0;
            Renderer.update = true;
        }
    },
    keyboardHideHandler: function(e) {
        this._self.y = 0;
        this._self.removeEventListener("mousedown", this._startDrag);
        this._self.removeEventListener("pressmove", this._doDrag);
        Renderer.update = true;
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
            if (!(expr.substring(0, 2) == "${")) expr = "${" + expr;
            if (!(expr.substring(expr.length - 1, expr.length) == "}")) expr = expr + "}"
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
                var paramName = param.substring(idx + 1);
                if (this._templateVars[name]) {
                    name = this._templateVars[name];
                    if (name.indexOf('.') > 0) {
                        paramName = name.substring(name.indexOf('.') + 1) + '.' + paramName;
                        name = name.substring(0, name.indexOf('.'));
                    }
                }
                var controller = this.getController(name);
                if (controller) {
                    val = controller.getModelValue(paramName);
                }
            } else {
                var controller = this.getController(param);
                if (controller) {
                    val = controller.getModelValue();
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
                var paramName = param.substring(idx + 1);
                var controller = this.getController(name);
                if (controller) {
                    val = controller.setModelValue(paramName, val);
                }
            }
        }
    },
    isStageStateChanged: function(isChanged) {
        this._isStageStateChanged = isChanged;
        if (isChanged) {
            this._currentState["isEvaluated"] = false;
        }
    },
    evaluate: function(action) {
        var isEvaluated = _.isUndefined(this._currentState) ? false : this._currentState.isEvaluated;

        if (!((this._isStageStateChanged === false) && isEvaluated)) {
            // evaluate only if item/assessment is not evaluated & changed
            // isEvaluated  | isSceneChanged    | Evaluate
            //      0       |       0           |     1
            //      0       |       1           |     1
            //      1       |       0           |     0
            //      1       |       1           |     1
            var valid = false;
            var showImmediateFeedback = true;

            if (this._stageController) {
                //Checking to show feedback or not
                if (!_.isUndefined(this._stageController._data.showImmediateFeedback)) {
                    showImmediateFeedback = this._stageController._data.showImmediateFeedback;
                }
                this._inputs.forEach(function(input) {
                    input.setModelValue();
                });

                var result = this._stageController.evalItem();
                if (result) {
                    valid = result.pass;
                }
                this._currentState["isEvaluated"] = true;
                EventBus.dispatch("evaluated", result);

                // setting the stage state change as false
                this.isStageStateChanged(false);

                if (showImmediateFeedback) {
                    //Show valid feeback
                    if (valid == true) {
                        var showOverlayGoodJobFd = OverlayManager.showFeeback(valid);
                        if (!showOverlayGoodJobFd) {
                            this.dispatchEvent(action.success);
                        }
                    } else {
                        var showOverlayTryAgainFd = OverlayManager.showFeeback(valid);
                        if (!showOverlayTryAgainFd) {
                            this.dispatchEvent(action.failure);
                        }
                    }
                    return;
                }
            }
        }
        //Directly take user to next stage, without showing feedback popup
        OverlayManager.skipAndNavigateNext();
    },
    reload: function(action) {
        if (this._stageController) {
            this._stageController.decrIndex(1);
        }
        this._theme.replaceStage(this._data.id, action);
    },
    getStagestateKey: function() {
        if (!_.isUndefined(this._stageController)) {
            return Renderer.theme._currentStage + "_" + this._stageController._id + "_" + this._stageController._index;
        } else {
            return Renderer.theme._currentStage;
        }
    },
    setParam: function(param, value, incr, max) {
        var instance = this;
        var fval = instance.params[param];
        if (incr) {
            if (!fval)
                fval = 0;
            fval = (fval + incr);
        } else {
            fval = value;
        }
        if (0 > fval) fval = 0;
        if ("undefined" != typeof max && fval >= max) fval = 0;
        instance.params[param] = fval;
        // saveState="true/false" is switch in the controller
        if (this.stateConfig) {
            // Merge the params and currentstate object data
            // clone to the currentstate object after merging is done
            instance._currentState = $.extend({}, instance._currentState, instance.params);
            instance._currentState = JSON.parse(JSON.stringify(instance._currentState));
        }
    },
    stateConfig: function() {
        if (!_.isUndefined(this._stageController)) {
            if (this._stageController._data.saveState == undefined || this._stageController._data.saveState == true) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    },
    getParam: function(param) {
        var instance = this;
        var params = instance.params;
        var expr = 'params.' + param;
        return eval(expr);
    },
    isItemScene: function() {
        var stageCtrl = this._stageController;
        if (!_.isUndefined(stageCtrl) && !_.isUndefined(stageCtrl._model) && ("items" == stageCtrl._type)) {
            return true;
        } else {
            return false;
        }
        //return ("undefined" != typeof Renderer.theme._currentScene._stageController && "items" == Renderer.theme._currentScene._stageController._type)? true : false;
    },
    isReadyToEvaluate: function() {
        var enableEval = false;
        var stageCtrl = this._stageController;
        if (!_.isUndefined(stageCtrl) && ("items" == stageCtrl._type) && !_.isUndefined(stageCtrl._model)) {

            var modelItem = stageCtrl._model[stageCtrl._index];
            if (modelItem && modelItem.type.toLowerCase() == 'ftb') {
                // If FTB item, enable submit button directly
                enableEval = true;
            } else {
                if (!_.isUndefined(this._currentState) && (!_.isUndefined(this._currentState.isEvaluated))) {
                    enableEval = !this._currentState.isEvaluated;
                }
            }
        }
        return enableEval;
    },
    showHideLoader: function(val) {
        var elem = document.getElementById('loaderArea');
        if (!_.isNull(elem)) {
            elem.style.display = val;
        }
    }
});
PluginManager.registerPlugin('stage', StagePlugin);
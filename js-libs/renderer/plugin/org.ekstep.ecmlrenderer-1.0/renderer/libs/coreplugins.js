var Plugin = Class.extend({
    _isContainer: !1,
    _defaultFont: void 0,
    _render: !0,
    _theme: void 0,
    _parent: void 0,
    _stage: void 0,
    _data: void 0,
    _currIndex: 0,
    _index: 0,
    _self: void 0,
    _dimensions: void 0,
    _id: void 0,
    _childIds: [],
    _enableEvents: !0,
    events: [],
    appEvents: [],
    borderShape: void 0,
    _pluginParams: {},
    _manifest: {},
    _unSupportedFonts: [ "notosans", "verdana", "notosans oriya" ],
    init: function(data, parent, stage, theme) {
        if (1 == arguments.length) {
            if (_.isUndefined(data)) return void this.initialize();
            if (!data.canvasId) return this._manifest = data, void this.initialize();
        }
        try {
            this.events = [], this.appEvents = [], this._childIds = [], this._pluginParams = {}, 
            this._theme = theme, this._stage = stage, this._parent = parent, this._data = data, 
            this.handleFont(data), this.initPlugin(data);
            var dims = this.relativeDims();
            dims && this._self && (this._self.origX = dims.x, this._self.origY = dims.y, this._self.width = dims.w, 
            this._self.height = dims.h), data.enableDrag && this.enableDrag(this._self, data.snapTo);
            var instance = this;
            if (_.isUndefined(data.appEvents) || (_.isArray(data.appEvents) ? _.each(data.appEvents, function(value, key) {
                instance.appEvents.push.apply(instance.appEvents, data.appEvents[key].list.split(/[\s,]+/));
            }) : this.appEvents.push.apply(this.appEvents, data.appEvents.list.split(/[\s,]+/))), 
            this._enableEvents && EventManager.registerEvents(this, this._data), this._id = this.id = this._data.id || this._data.asset || _.uniqueId("plugin"), 
            PluginManager.registerPluginObject(this), this._self && !1 === data.visible && (this._self.visible = !1), 
            data["ev-if"]) {
                var expr = data["ev-if"].trim(), modelExpr = expr = this.replaceExpressions(expr);
                "${" != expr.substring(0, 2) && (expr = "${" + expr), "}" != expr.substring(expr.length - 1, expr.length) && (expr += "}");
                var exprVal = this.evaluateExpr(expr);
                void 0 === exprVal && this._stage && (exprVal = this._stage.getModelValue(modelExpr)), 
                void 0 !== exprVal && this._self && (this._self.visible = this._self.visible && exprVal);
            }
            this._self && (this._self["z-index"] = data["z-index"]), this._render && (this._isContainer && "stage" == this._type && this.cache(), 
            this.render()), this._self && this._self.visible && (this.drawBorder(data, dims), 
            data.shadow && this.addShadow()), this._self && this.rotation(data);
        } catch (e) {
            var pluginName;
            _.isUndefined(data) || (pluginName = data.pluginType ? data.pluginType : "Custom"), 
            EkstepRendererAPI.logErrorEvent(e, {
                type: "plugin",
                objectType: data.pluginType,
                action: data.event ? data.event.action ? data.event.action.command : data.event.type : "transistion",
                objectId: data.id || data._id
            }), showToaster("error", pluginName + ":Plugin failed"), console.warn("Plugin init is failed due to", e);
        }
    },
    handleFont: function(data) {
        data.font && (data.font = data.font.trim()), (_.isEmpty(data.font) || !_.isUndefined(data.font) && this._unSupportedFonts.indexOf(data.font.toLowerCase()) > -1) && (data.font = this.getDefaultFont());
    },
    cache: function() {
        this._self.cache(this._dimensions.x, this._dimensions.y, this._dimensions.w, this._dimensions.h);
    },
    uncache: function() {
        this._self.uncache();
    },
    setIndex: function(idx) {
        this._index = idx;
    },
    setDimensions: function() {
        var dims = this.relativeDims();
        this._self.x = dims.x ? dims.x : 0, this._self.y = dims.y ? dims.y : 0, this._self.width = dims.w ? dims.w : 1, 
        this._self.height = dims.h ? dims.h : 1;
    },
    addChild: function(child, childPlugin) {
        var nextIdx = this._currIndex++;
        this._self.addChildAt(child, this._self.children.length), childPlugin && (childPlugin.setIndex(nextIdx), 
        childPlugin._id && this._childIds.push(childPlugin._id));
    },
    removeChildAt: function(idx) {
        this._self.removeChildAt(idx);
    },
    removeChild: function(child) {
        this._self.removeChild(child);
    },
    render: function() {
        this._self ? this._parent.addChild(this._self, this) : console.warn("Skipped rendering the plugin object: ", this._id);
    },
    update: function() {
        this._theme.update();
    },
    dimensions: function() {
        return this._dimensions;
    },
    relativeDims: function() {
        if (this._parent) {
            var parentDims = this._parent.dimensions();
            this._dimensions = {
                x: parseFloat(parentDims.w * (this._data.x || 0) / 100),
                y: parseFloat(parentDims.h * (this._data.y || 0) / 100),
                w: parseFloat(parentDims.w * (this._data.w || 0) / 100),
                h: parseFloat(parentDims.h * (this._data.h || 0) / 100),
                stretch: void 0 === this._data.stretch || this._data.stretch
            };
        }
        return this._dimensions;
    },
    getRelativeDims: function(data) {
        var parentDims = this._parent.dimensions();
        return {
            x: parseFloat(parentDims.w * (data.x || 0) / 100),
            y: parseFloat(parentDims.h * (data.y || 0) / 100),
            w: parseFloat(parentDims.w * (data.w || 0) / 100),
            h: parseFloat(parentDims.h * (data.h || 0) / 100),
            stretch: void 0 === data.stretch || data.stretch
        };
    },
    setScale: function() {
        var sb = this._self.getBounds(), dims = this.relativeDims(), parentDims = this._parent.dimensions();
        dims.stretch || 0 != dims.h && 0 != dims.w && (sb.height > sb.width ? dims.h = 0 : dims.w = 0), 
        0 == dims.h && (dims.h = dims.w * sb.height / sb.width, parentDims.h < dims.h && (dims.h = parentDims.h, 
        dims.w = dims.h * sb.width / sb.height)), 0 == dims.w && (dims.w = dims.h * sb.width / sb.height, 
        parentDims.w < dims.w && (dims.w = parentDims.w, dims.h = dims.w * sb.height / sb.width)), 
        this._dimensions.h = dims.h, this._dimensions.w = dims.w, this._self && (this._self.scaleY = dims.h / sb.height, 
        this._self.scaleX = dims.w / sb.width);
    },
    initialize: function() {},
    initPlugin: function(data) {
        throw PluginManager.addError("Subclasses of plugin should implement this function"), 
        "Subclasses of plugin should implement this function";
    },
    play: function() {
        PluginManager.addError("Subclasses of plugin should implement play()");
    },
    pause: function() {
        PluginManager.addError("Subclasses of plugin should implement pause()");
    },
    stop: function() {
        PluginManager.addError("Subclasses of plugin should implement stop()");
    },
    togglePlay: function() {
        PluginManager.addError("Subclasses of plugin should implement togglePlay()");
    },
    refresh: function() {
        PluginManager.addError("Subclasses of plugin should implement refresh()");
    },
    show: function(action) {
        _.contains(this.events, "show") ? EventManager.dispatchEvent(this._data.id, "show") : this._self.visible || (this._self.visible = !0, 
        EventManager.processAppTelemetry(action, "SHOW", this)), Renderer.update = !0;
    },
    hide: function(action) {
        _.contains(this.events, "hide") ? EventManager.dispatchEvent(this._data.id, "hide") : this._self && this._self.visible && (this._self.visible = !1, 
        EventManager.processAppTelemetry(action, "HIDE", this)), Renderer.update = !0;
    },
    toggleShow: function(action) {
        _.contains(this.events, "toggleShow") ? EventManager.dispatchEvent(this._data.id, "toggleShow") : (this._self.visible = !this._self.visible, 
        EventManager.processAppTelemetry(action, this._self.visible ? "SHOW" : "HIDE", this)), 
        Renderer.update = !0;
    },
    toggleShadow: function(action) {
        var isVisible = !1;
        return this.hasShadow() ? (this.removeShadow(), isVisible = !1) : (this.addShadow(), 
        isVisible = !0), Renderer.update = !0, isVisible;
    },
    addShadow: function() {
        var shadowObj = this._self.shadow;
        if (shadowObj && shadowObj._self && "visible" in shadowObj._self) shadowObj._self.visible = !0; else {
            var shadowColor = this._data.shadowColor || "#cccccc";
            shadowColor = this._data.shadow || shadowColor;
            var offsetX = this._data.offsetX || 0, offsetY = this._data.offsetY || 0, blur = this._data.blur || 5;
            this._self.shadow = new createjs.Shadow(shadowColor, offsetX, offsetY, blur);
        }
    },
    removeShadow: function() {
        var shadowObj = this._self.shadow;
        shadowObj && shadowObj._self && "visible" in shadowObj._self ? shadowObj._self.visible = !1 : this._self.shadow = void 0;
    },
    hasShadow: function() {
        var visibleShadow = !1, shadowObj = this._self.shadow;
        return shadowObj && shadowObj._self && "visible" in shadowObj._self ? visibleShadow = shadowObj._self.visible : this._self.shadow && (visibleShadow = !0), 
        visibleShadow;
    },
    drawBorder: function(data, dims) {
        if (data.stroke) {
            var strokeWidth = data["stroke-width"] || 1, graphics = this._self.graphics;
            this._self.graphics || (this.borderShape = new createjs.Shape(), this.borderShape.x = this._self.x, 
            this.borderShape.y = this._self.y, graphics = this.borderShape.graphics), graphics.beginStroke(data.stroke), 
            this.borderShape.alpha = data["stroke-opacity"] || 1, graphics.setStrokeStyle(strokeWidth), 
            graphics.dr(0, 0, dims.w, dims.h), this._self.graphics || this._parent.addChild(this.borderShape), 
            Renderer.update = !0;
        }
    },
    rotation: function(data) {
        var degreeRotation = 0;
        data.rotate ? degreeRotation = data.rotate : _.isNumber(data) && (degreeRotation = data), 
        _.isUndefined(this.borderShape) || (this.borderShape.rotation = degreeRotation), 
        this._self.rotation = degreeRotation;
    },
    enableDrag: function(asset, snapTo) {
        asset.cursor = "pointer", asset.on("mousedown", function(evt) {
            this.parent.addChild(this), this.offset = {
                x: this.x - evt.stageX,
                y: this.y - evt.stageY
            };
        }), asset.on("pressmove", function(evt) {
            this.x = evt.stageX + this.offset.x, this.y = evt.stageY + this.offset.y, Renderer.update = !0;
        }), snapTo && asset.on("pressup", function(evt) {
            var plugin = PluginManager.getPluginObject(snapTo), dims = plugin._dimensions, xFactor = parseFloat(.5 * this.width), yFactor = parseFloat(.5 * this.height), x = dims.x - xFactor, y = dims.y - yFactor, maxX = dims.x + dims.w + xFactor, maxY = dims.y + dims.h + yFactor, snapSuccess = !1;
            this.x >= x && this.x + this.width <= maxX && this.y >= y && this.y + this.height <= maxY && (snapSuccess = !0), 
            snapSuccess ? (plugin._data.snapX && (this.x = dims.x + dims.w * plugin._data.snapX / 100), 
            plugin._data.snapY && (this.y = dims.y + dims.h * plugin._data.snapY / 100)) : (this.x = this.origX, 
            this.y = this.origY), Renderer.update = !0;
        });
    },
    evaluateExpr: function(expr) {
        if (!expr) return "";
        var app = GlobalContext._params, stage = {};
        this._stage ? stage = this._stage.params : "stage" == this._type && (stage = this.params);
        var content = {};
        this._theme && (content = this._theme._contentParams);
        var value = void 0;
        try {
            expr = expr.trim(), "${" == expr.substring(0, 2) && "}" == expr.substring(expr.length - 1, expr.length) ? (expr = expr.substring(2, expr.length), 
            expr = expr.substring(0, expr.length - 1), value = eval(expr)) : value = eval(expr);
        } catch (err) {
            console.warn("expr: " + expr + " evaluation faild:", err.message);
        }
        return value;
    },
    replaceExpressions: function(model) {
        for (var arr = [], idx = 0, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1); -1 != nextIdx && -1 != endIdx; ) {
            var expr = model.substring(nextIdx, endIdx + 1);
            arr.push(expr), idx = endIdx, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1);
        }
        if (arr.length > 0) for (var i = 0; i < arr.length; i++) {
            var val = this.evaluateExpr(arr[i]);
            model = model.replace(arr[i], val);
        }
        return model;
    },
    getParam: function(param) {
        var value, tokens = param.split(".");
        if (tokens.length >= 2) {
            var scope = tokens[0], idx = param.indexOf("."), paramName = param.substring(idx + 1);
            value = scope && "app" == scope.toLowerCase() ? GlobalContext.getParam(paramName) : scope && "stage" == scope.toLowerCase() ? this._stage.getParam(paramName) : this._theme.getParam(paramName);
        } else this._stage && (value = this._stage.getParam(param));
        return value;
    },
    getDefaultFont: function() {
        return this._defaultFont = "NotoSans, NotoSansGujarati, NotoSansOriya, NotoSansMalayalam", 
        this._defaultFont;
    },
    transitionTo: function() {
        PluginManager.addError("Subclasses of plugin should implement transitionTo()");
    },
    evaluate: function() {
        PluginManager.addError("Subclasses of plugin should implement evaluate()");
    },
    reload: function() {
        PluginManager.addError("Subclasses of plugin should implement reload()");
    },
    restart: function() {
        PluginManager.addError("Subclasses of plugin should implement reload()");
    },
    blur: function(action) {
        var instance = this, obj = instance._self, blurFilter = new createjs.BlurFilter(25, 25, 1);
        obj.filters = [ blurFilter ];
        var bounds = instance.relativeDims();
        obj.cache(bounds.x, bounds.y, bounds.w, bounds.h), Renderer.update = !0;
    },
    unblur: function(action) {
        var instance = this;
        instance._self.filters = [], instance._self.uncache(), Renderer.update = !0;
    },
    invokeChildren: function(data, parent, stage, theme) {
        var children = [];
        for (k in data) PluginManager.isPlugin(k) && (_.isArray(data[k]) ? _.each(data[k], function(item) {
            item.pluginType = k, item["z-index"] || (item["z-index"] = -1), children.push(item);
        }) : (data[k].pluginType = k, data[k]["z-index"] || (data[k]["z-index"] = -1), children.push(data[k])));
        for (k in children) {
            var item = children[k];
            item.pluginType && PluginManager.invoke(item.pluginType, item, parent, stage, theme);
        }
        parent._self && parent._self.sortChildren(function(obj1, obj2, options) {
            return _.isUndefined(obj2["z-index"]) && (obj2["z-index"] = -1), _.isUndefined(obj1["z-index"]) && (obj1["z-index"] = -1), 
            obj1["z-index"] > obj2["z-index"] ? 1 : obj1["z-index"] < obj2["z-index"] ? -1 : 0;
        });
    },
    getPluginParam: function(param) {
        var instance = this, params = instance._pluginParams, expr = "params." + param;
        return eval(expr);
    },
    setPluginParam: function(param, value, incr, max) {
        var instance = this, fval = instance._pluginParams[param];
        incr ? (fval || (fval = 0), fval += incr) : fval = value, 0 > fval && (fval = 0), 
        void 0 !== max && fval >= max && (fval = 0), instance._pluginParams[param] = fval;
    },
    setPluginParamValue: function(action) {
        var val, scope = action.scope, param = action.param, paramExpr = action["ev-value"], paramModel = action["ev-model"];
        if (paramExpr) val = this.getPluginParam(paramExpr); else if (paramModel) {
            if (this._stage) {
                var model = this.replaceExpressions(paramModel);
                val = this._stage.getModelValue(model);
            }
        } else val = action["param-value"];
        var incr = action["param-incr"];
        scope && "app" == scope.toLowerCase() ? GlobalContext.setParam(param, val, incr) : scope && "stage" == scope.toLowerCase() ? this._stage.setParam(param, val, incr) : scope && "content" == scope.toLowerCase() ? this._theme.setParam(param, val, incr) : this.setPluginParam(param, val, incr);
    },
    getInnerECML: function(data) {
        var children = {};
        data = void 0 === data ? this._data : data;
        for (k in data) PluginManager.isPlugin(k) && _.isObject(data[k]) && !_.isEmpty(data[k]) && (children[k] = data[k]);
        return children;
    },
    setState: function(param, value, isStateChanged) {
        _.isUndefined(isStateChanged) || this._stage.isStageStateChanged(isStateChanged), 
        this._stage.setParam(param.toLowerCase(), value);
    },
    getState: function(param) {
        if (!_.isUndefined(this._stage._currentState)) return this._stage._currentState[param];
    }
}), HTMLPlugin = Plugin.extend({
    _div: void 0,
    _isContainer: !1,
    _render: !0
});

AnimationPlugin = Class.extend({
    _data: void 0,
    init: function(data, plugin) {
        this._data = data, this._id = data.id || _.uniqueId("animation"), this.initPlugin(data, plugin), 
        AnimationManager.registerPluginObject(this);
    },
    initPlugin: function(data, plugin) {
        PluginManager.addError("Subclasses of AnimationPlugin should implement this function");
    },
    animate: function(plugin) {
        PluginManager.addError("Subclasses of AnimationPlugin should implement play()");
    }
});

var LayoutPlugin = Plugin.extend({
    _isContainer: !0,
    _render: !0,
    _cells: [],
    _cellsCount: 0,
    _iterateModel: void 0,
    initPlugin: function(data) {
        this._cells = [], this._cellsCount = 0, this._self = new createjs.Container();
        var dims = this.relativeDims();
        if (this._self.x = dims.x, this._self.y = dims.y, _.isUndefined(data.iterate) && _.isUndefined(data.count)) return void console.warn("LayoutPlugin require iterate or count", data);
        void 0 !== data.count && (this._cellsCount = data.count);
        var model = data.iterate;
        model = this._iterateModel = this.replaceExpressions(model);
        var dataObjs = this._stage.getModelValue(model);
        if (dataObjs) {
            var length = dataObjs.length;
            this._cellsCount = length < this._cellsCount || 0 == this._cellsCount ? length : this._cellsCount;
        }
        this.generateLayout(), this.renderLayout(), this._enableEvents = !1;
    },
    generateLayout: function() {
        PluginManager.addError("Subclasses of layout plugin should implement generateLayout()");
    },
    renderLayout: function() {
        var instance = this, index = 0;
        this._cells.forEach(function(data) {
            var cellECML = instance.getInnerECML(), cellEvents = instance.getCellEvents();
            instance._stage._templateVars[instance._data.var] = instance._iterateModel + "[" + index + "]", 
            instance._addCellAttributes(data), Object.assign && Object.assign(data, cellECML);
            var resolvedEvents = instance.resolveActionModelValues(cellEvents);
            Object.assign && Object.assign(data, resolvedEvents), PluginManager.invoke("g", data, instance, instance._stage, instance._theme), 
            index++;
        });
    },
    _addCellAttributes: function(data) {
        data.padX = this._data.padX || 0, data.padY = this._data.padY || 0, data.snapX = this._data.snapX, 
        data.snapY = this._data.snapY, data.stroke = this._data.stroke, data["stroke-width"] = this._data["stroke-width"], 
        data.events = this._data.events, data.event = this._data.event, this._data.shadow && (data.shadowColor = this._data.shadow), 
        this._data.highlight && (data.highlight = this._data._highlight), _.isFinite(this._data.blur) && (data.blur = this._data.blur), 
        _.isFinite(this._data.offsetX) && (data.offsetX = this._data.offsetX), _.isFinite(this._data.offsetY) && (data.offsetY = this._data.offsetY), 
        this._data.opacity && (data.opacity = this._data.opacity);
    },
    getCellEvents: function() {
        var events = void 0, instance = this;
        return instance._data.events ? _.isArray(instance._data.events) ? (events = [], 
        instance._data.events.forEach(function(e) {
            events.push.apply(events, e.event);
        })) : events = instance._data.events.event : events = instance._data.event, events;
    },
    resolveActionModelValues: function(events) {
        var returnEvents = void 0, instance = this, updateAction = function(tempAction) {
            var action = _.clone(tempAction);
            if (action.asset_model) {
                var model = action.asset_model, val = instance._stage.getModelValue(model);
                action.asset = val, delete action.asset_model;
            }
            if (action["ev-model"]) {
                var model = action["ev-model"], val = instance._stage.getModelValue(model);
                action.value = val, action["param-value"] = val, delete action["ev-model"];
            }
            return action;
        }, updateEvent = function(evt) {
            var returnEvent = {
                type: evt.type
            };
            return _.isArray(evt.action) ? (returnEvent.action = [], evt.action.forEach(function(action) {
                returnEvent.action.push(updateAction(action));
            })) : evt.action && (returnEvent.action = updateAction(evt.action)), returnEvent;
        };
        return _.isArray(events) ? (returnEvents = {
            events: [],
            hitArea: !0
        }, events.forEach(function(e) {
            returnEvents.events.push(updateEvent(e));
        })) : events && (returnEvents = {
            hitArea: !0
        }, returnEvents.event = updateEvent(events)), returnEvents;
    }
}), ShapePlugin = Plugin.extend({
    _type: "shape",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        this._self = new createjs.Shape();
        var graphics = this._self.graphics, dims = this.relativeDims();
        data.fill && graphics.beginFill(data.fill), data.stroke && graphics.beginStroke(data.stroke), 
        data["stroke-width"] && graphics.setStrokeStyle(data["stroke-width"]);
        var radius = data.radius || 10;
        switch (data.type = data.type ? data.type.toLowerCase() : "rect", data.type) {
          case "rect":
            if (graphics.dr(0, 0, dims.w, dims.h), data.hitArea) {
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h), this._self.hitArea = hit;
            }
            break;

          case "roundrect":
            if (graphics.drawRoundRect(0, 0, dims.w, dims.h, radius), data.hitArea) {
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h), this._self.hitArea = hit;
            }
            break;

          case "circle":
            if (graphics.dc(0, 0, dims.r || dims.w), data.hitArea) {
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").dc(0, 0, dims.w), this._self.hitArea = hit;
            }
            break;

          case "ellipse":
            if (graphics.de(0, 0, dims.w, dims.h), data.hitArea) {
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").de(0, 0, dims.w, dims.h), this._self.hitArea = hit;
            }
            break;

          default:
            this.drawPolygon(data, dims, graphics);
        }
        graphics.cp(), this._self.x = dims.x, this._self.y = dims.y, _.isUndefined(data.opacity) || (this._self.alpha = data.opacity);
    },
    drawBorder: function() {},
    drawPolygon: function(data, dims, graphics) {
        var points = this.getPoints(data);
        if (!points) return void console.log("Unsupported shape");
        var end = points[points.length - 1], x = dims.w * (end.x || 0) / 100, y = dims.h * (end.y || 0) / 100;
        graphics.moveTo(x, y), points.forEach(function(point) {
            x = dims.w * (point.x || 0) / 100, y = dims.h * (point.y || 0) / 100, graphics.lineTo(x, y);
        });
    },
    getPoints: function(data) {
        var shape = data.type, sides = data.sides, corners = data.corners;
        "trapezium" != shape && (sides ? shape = sides + "polygon" : corners && (shape = corners + "star"));
        var points;
        if (this.shapes.hasOwnProperty(shape)) points = this.shapes[shape]; else if (data.config.__cdata) try {
            var config = JSON.parse(data.config.__cdata);
            points = config.points;
        } catch (err) {
            console.log("Points array not available");
        }
        return points;
    },
    shapes: {
        "4star": [ {
            x: 100,
            y: 50
        }, {
            x: 62.7,
            y: 62.7
        }, {
            x: 50,
            y: 100
        }, {
            x: 37.3,
            y: 62.7
        }, {
            x: 0,
            y: 50
        }, {
            x: 37.3,
            y: 37.3
        }, {
            x: 50,
            y: 0
        }, {
            x: 62.7,
            y: 37.3
        } ],
        "5star": [ {
            x: 50,
            y: 0
        }, {
            x: 60.9,
            y: 35
        }, {
            x: 100,
            y: 35
        }, {
            x: 67.6,
            y: 60
        }, {
            x: 79.4,
            y: 100
        }, {
            x: 50,
            y: 72
        }, {
            x: 20.6,
            y: 100
        }, {
            x: 32.4,
            y: 60
        }, {
            x: 0,
            y: 35
        }, {
            x: 39.1,
            y: 35
        } ],
        "6star": [ {
            x: 50,
            y: 100
        }, {
            x: 35,
            y: 76
        }, {
            x: 0,
            y: 75
        }, {
            x: 20,
            y: 50
        }, {
            x: 0,
            y: 25
        }, {
            x: 35,
            y: 24
        }, {
            x: 50,
            y: 0
        }, {
            x: 65,
            y: 24
        }, {
            x: 100,
            y: 25
        }, {
            x: 80,
            y: 50
        }, {
            x: 100,
            y: 75
        }, {
            x: 65,
            y: 76
        } ],
        "7star": [ {
            x: 100,
            y: 59.8
        }, {
            x: 74,
            y: 68
        }, {
            x: 72.9,
            y: 100
        }, {
            x: 50.8,
            y: 80
        }, {
            x: 29.6,
            y: 100
        }, {
            x: 27.1,
            y: 69.4
        }, {
            x: 0,
            y: 62.5
        }, {
            x: 20.6,
            y: 44.1
        }, {
            x: 10,
            y: 19.9
        }, {
            x: 36.2,
            y: 23.3
        }, {
            x: 48.6,
            y: 0
        }, {
            x: 62.3,
            y: 22.6
        }, {
            x: 88.2,
            y: 17.7
        }, {
            x: 79,
            y: 42.5
        } ],
        "8star": [ {
            x: 100,
            y: 50
        }, {
            x: 82.3,
            y: 63.4
        }, {
            x: 85.4,
            y: 85.4
        }, {
            x: 63.4,
            y: 82.3
        }, {
            x: 50,
            y: 100
        }, {
            x: 36.6,
            y: 82.3
        }, {
            x: 14.6,
            y: 85.4
        }, {
            x: 17.7,
            y: 63.4
        }, {
            x: 0,
            y: 50
        }, {
            x: 17.7,
            y: 36.6
        }, {
            x: 14.6,
            y: 14.6
        }, {
            x: 36.6,
            y: 17.7
        }, {
            x: 50,
            y: 0
        }, {
            x: 63.4,
            y: 17.7
        }, {
            x: 85.4,
            y: 14.6
        }, {
            x: 82.3,
            y: 36.6
        } ],
        "9star": [ {
            x: 100,
            y: 40.2
        }, {
            x: 84.6,
            y: 55.3
        }, {
            x: 93.8,
            y: 74
        }, {
            x: 73.1,
            y: 76.3
        }, {
            x: 68.1,
            y: 100
        }, {
            x: 50.8,
            y: 85
        }, {
            x: 33.9,
            y: 100
        }, {
            x: 28.1,
            y: 77.3
        }, {
            x: 7.3,
            y: 75.9
        }, {
            x: 15.7,
            y: 56.8
        }, {
            x: 0,
            y: 42.4
        }, {
            x: 19.3,
            y: 33.2
        }, {
            x: 17,
            y: 12.4
        }, {
            x: 37.3,
            y: 17.4
        }, {
            x: 48.9,
            y: 0
        }, {
            x: 61.3,
            y: 16.9
        }, {
            x: 81.3,
            y: 11
        }, {
            x: 79.9,
            y: 31.8
        } ],
        "10star": [ {
            x: 100,
            y: 65.5
        }, {
            x: 78.3,
            y: 70.6
        }, {
            x: 79.4,
            y: 90.5
        }, {
            x: 60.8,
            y: 83.3
        }, {
            x: 50,
            y: 100
        }, {
            x: 39.2,
            y: 83.3
        }, {
            x: 20.6,
            y: 90.5
        }, {
            x: 21.7,
            y: 70.6
        }, {
            x: 0,
            y: 65.5
        }, {
            x: 15,
            y: 50
        }, {
            x: 0,
            y: 34.5
        }, {
            x: 21.7,
            y: 29.4
        }, {
            x: 20.6,
            y: 9.5
        }, {
            x: 39.2,
            y: 16.7
        }, {
            x: 50,
            y: 0
        }, {
            x: 60.8,
            y: 16.7
        }, {
            x: 79.4,
            y: 9.5
        }, {
            x: 78.3,
            y: 29.4
        }, {
            x: 100,
            y: 34.5
        }, {
            x: 85,
            y: 50
        } ],
        "3polygon": [ {
            x: 50,
            y: 0
        }, {
            x: 100,
            y: 100
        }, {
            x: 0,
            y: 100
        } ],
        "4polygon": [ {
            x: 50,
            y: 0
        }, {
            x: 100,
            y: 50
        }, {
            x: 50,
            y: 100
        }, {
            x: 0,
            y: 50
        } ],
        "5polygon": [ {
            x: 50,
            y: 0
        }, {
            x: 100,
            y: 34.5
        }, {
            x: 79.4,
            y: 100
        }, {
            x: 20.6,
            y: 100
        }, {
            x: 0,
            y: 34.5
        } ],
        "6polygon": [ {
            x: 100,
            y: 50
        }, {
            x: 75,
            y: 100
        }, {
            x: 25,
            y: 100
        }, {
            x: 0,
            y: 50
        }, {
            x: 25,
            y: 0
        }, {
            x: 75,
            y: 0
        } ],
        "7polygon": [ {
            x: 50,
            y: 0
        }, {
            x: 89.1,
            y: 18.8
        }, {
            x: 100,
            y: 61.1
        }, {
            x: 71.7,
            y: 100
        }, {
            x: 28.3,
            y: 100
        }, {
            x: 0,
            y: 61.1
        }, {
            x: 10.9,
            y: 18.8
        } ],
        "8polygon": [ {
            x: 100,
            y: 69.1
        }, {
            x: 69.1,
            y: 100
        }, {
            x: 30.9,
            y: 100
        }, {
            x: 0,
            y: 69.1
        }, {
            x: 0,
            y: 30.9
        }, {
            x: 30.9,
            y: 0
        }, {
            x: 69.1,
            y: 0
        }, {
            x: 100,
            y: 30.9
        } ],
        "9polygon": [ {
            x: 50,
            y: 0
        }, {
            x: 82.1,
            y: 11.7
        }, {
            x: 100,
            y: 41.3
        }, {
            x: 93.3,
            y: 75
        }, {
            x: 67.1,
            y: 100
        }, {
            x: 32.9,
            y: 100
        }, {
            x: 6.7,
            y: 75
        }, {
            x: 0,
            y: 41.3
        }, {
            x: 17.9,
            y: 11.7
        } ],
        "10polygon": [ {
            x: 100,
            y: 50
        }, {
            x: 90.5,
            y: 79.4
        }, {
            x: 65.5,
            y: 100
        }, {
            x: 34.5,
            y: 100
        }, {
            x: 9.5,
            y: 79.4
        }, {
            x: 0,
            y: 50
        }, {
            x: 9.5,
            y: 20.6
        }, {
            x: 34.5,
            y: 0
        }, {
            x: 65.5,
            y: 0
        }, {
            x: 90.5,
            y: 20.6
        } ],
        trapezium: [ {
            x: 25,
            y: 0
        }, {
            x: 75,
            y: 0
        }, {
            x: 100,
            y: 100
        }, {
            x: 0,
            y: 100
        } ]
    }
});

PluginManager.registerPlugin("shape", ShapePlugin);

var AudioPlugin = Plugin.extend({
    _type: "audio",
    _isContainer: !1,
    _id: void 0,
    _state: "stop",
    _render: !1,
    initPlugin: function(data) {
        this._id = data.asset;
    },
    play: function(action) {
        AudioManager.play(action);
    },
    togglePlay: function(action) {
        AudioManager.togglePlay(action);
    },
    pause: function(action) {
        AudioManager.pause(action);
    },
    stop: function(action) {
        !0 === action.sound ? AudioManager.stopAll(action) : AudioManager.stop(action);
    },
    stopAll: function(action) {
        AudioManager.stopAll(action);
    }
});

PluginManager.registerPlugin("audio", AudioPlugin);

var ContainerPlugin = Plugin.extend({
    _type: "g",
    _isContainer: !0,
    _render: !0,
    initPlugin: function(data) {
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        if (this._self.x = dims.x, this._self.y = dims.y, data.hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h), this._self.hitArea = hit;
        }
        data.rotate && this.rotation(data), this.invokeChildren(data, this, this._stage, this._theme);
    },
    refresh: function() {
        if (_.isArray(this._childIds)) for (var i = 0; i < this._childIds.length; i++) {
            var childPlugin = PluginManager.getPluginObject(this._childIds[i]);
            childPlugin && childPlugin.refresh();
        }
    }
});

PluginManager.registerPlugin("g", ContainerPlugin);

var DivPlugin = HTMLPlugin.extend({
    _type: "div",
    initPlugin: function(data) {
        this._input = void 0;
        var dims = this.relativeDims(), div = document.getElementById(data.id);
        div && jQuery("#" + data.id).remove(), div = document.createElement("div"), data.style && div.setAttribute("style", data.style), 
        div.id = data.id, div.style.width = dims.w + "px", div.style.height = dims.h + "px", 
        div.style.position = "absolute";
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);
        var textStr = "";
        data.$t || data.__text ? textStr = data.$t || data.__text : data.model ? textStr = this._stage.getModelValue(data.model) || "" : data.param && (textStr = this.getParam(data.param.trim()) || "");
        data.__cdata;
        jQuery("#" + data.id).append(data.__cdata), this._div = div, this._self = new createjs.DOMElement(div), 
        this._self.x = dims.x, this._self.y = dims.y, this.registerEvents(data.id);
    },
    registerEvents: function(id) {
        var instance = this;
        jQuery("#" + id).children().each(function() {
            var data = jQuery(this).data();
            data && data.event && jQuery(this).click(function(event) {
                event.preventDefault(), instance._triggerEvent(data.event), console.info("Triggered event ", data.event);
            });
        });
    },
    _triggerEvent: function(event) {
        var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
        event = new createjs.Event(event), plugin && plugin.dispatchEvent(event);
    }
});

PluginManager.registerPlugin("div", DivPlugin);

var EmbedPlugin = Plugin.extend({
    _type: "embed",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        if (data.template || data["template-name"]) {
            var templateId = data["template-name"] ? data["template-name"] : this._stage.getTemplate(data.template), template = this._theme._templateMap[templateId];
            if (template) {
                for (var k in data) if ("template" !== k && "template-name" !== k) if ("var-" == k.substring(0, 4)) this._stage._templateVars[k.substring(4)] = data[k]; else if ("ev-" == k.substring(0, 3)) {
                    var expr = this.replaceExpressions(data[k]);
                    this._stage._templateVars[k.substring(3)] = expr;
                } else this._stage._templateVars[k] = data[k];
                this._self = new createjs.Container(), data.w = data.w || 100, data.h = data.h || 100;
                var dims = this.relativeDims();
                this._self.x = dims.x, this._self.y = dims.y, this.invokeChildren(template, this, this._stage, this._theme);
            }
        }
    },
    refresh: function() {
        if (_.isArray(this._childIds)) for (var i = 0; i < this._childIds.length; i++) {
            var childPlugin = PluginManager.getPluginObject(this._childIds[i]);
            childPlugin && childPlugin.refresh();
        }
    },
    replaceExpressions: function(model) {
        for (var arr = [], idx = 0, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1); -1 != nextIdx && -1 != endIdx; ) {
            var expr = model.substring(nextIdx, endIdx + 1);
            arr.push(expr), idx = endIdx, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1);
        }
        if (arr.length > 0) for (var i = 0; i < arr.length; i++) {
            var val = this.evaluateExpr(arr[i]);
            model = model.replace(arr[i], val);
        }
        return model;
    }
});

PluginManager.registerPlugin("embed", EmbedPlugin);

var GridlayoutPlugin = LayoutPlugin.extend({
    _type: "grid",
    generateLayout: function() {
        var tableProps = this.getTableProperties(), marginX = 0;
        _.isFinite(this._data.marginX) && (marginX = this._data.marginX);
        var marginY = 0;
        _.isFinite(this._data.marginY) && (marginY = this._data.marginY);
        for (var cw = (100 - (tableProps.cols - 1) * marginX) / tableProps.cols, ch = (100 - (tableProps.rows - 1) * marginY) / tableProps.rows, r = 0; r < tableProps.rows; r++) for (var c = 0; c < tableProps.cols; c++) if (this._cells.length < this._cellsCount) {
            var data = {};
            data.x = c * (cw + marginX), data.y = r * (ch + marginY), data.w = cw, data.h = ch, 
            this._cells.push(data);
        }
    },
    getTableProperties: function() {
        var cols = void 0, rows = void 0, count = this._cellsCount;
        return this._data.rows && this._data.cols ? (cols = this._data.cols, rows = Math.ceil(count / cols)) : (this._data.rows && (rows = this._data.rows), 
        this._data.cols && (cols = this._data.cols), this._data.rows ? cols = Math.ceil(count / rows) : rows = Math.ceil(count / cols)), 
        {
            cols: cols,
            rows: rows
        };
    }
});

PluginManager.registerPlugin("grid", GridlayoutPlugin);

var HighlightTextPlugin = HTMLPlugin.extend({
    _type: "htext",
    _wordIds: [],
    _timings: [],
    _isPlaying: !1,
    _isPaused: !1,
    _wordClass: "gc-ht-word",
    _listener: void 0,
    _audioInstance: void 0,
    _position: {
        previous: 0,
        current: 0,
        pause: 0
    },
    _time: 0,
    initPlugin: function(data) {
        this._cleanupHighlight();
        var font, dims = this.relativeDims();
        data.id || (data.id = this._data.id = _.uniqueId("plugin")), data.highlight || (data.highlight = this._data.highlight = "#DDDDDD");
        var div = document.createElement("div");
        div.id = data.id, div.style.width = dims.w + "px", div.style.height = dims.h + "px", 
        div.style.top = "-1000px", div.style.position = "relative";
        var fontsize = "1.2em";
        if (data.fontsize && (fontsize = data.fontsize), isFinite(fontsize) && data.w) {
            var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100), cw = this._parent.dimensions().w, width = parseFloat(cw * data.w / 100), scale = parseFloat(width / exp);
            fontsize = parseFloat(fontsize * scale), fontsize += "px";
        }
        var h_offset = data.offsetX ? data.offsetX : 0, v_offset = data.offsetY ? data.offsetY : 0, Blur = data.blur ? data.blur : 1, shadow_color = data.shadow ? data.shadow : "#ccc", shadow = h_offset + "px " + v_offset + "px " + Blur + "px " + shadow_color;
        1 == /\d/.test(data.font) ? (font = data.font, div.style.font = data.font) : (font = fontsize + " " + data.font, 
        div.style["font-family"] = data.font, div.style["font-size"] = fontsize), data.weight && (div.style.font = data.weight + " " + font), 
        div.style.outline = data.outline ? data.outline : 0, div.style["line-height"] = data.lineHeight ? data.lineHeight : "1.2em", 
        div.style["text-align"] = data.align ? data.align : "left", div.style["vertical-align"] = data.valign ? data.valign : "top", 
        div.style.color = data.color ? data.color : "black", div.style.textShadow = shadow;
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]), data.timings && (this._timings = _.map(data.timings.split(","), function(time) {
            return Number(Number(time).toFixed(0));
        }));
        var text = this._getText(), htmlText = this._tokenize(text);
        jQuery("#" + data.id).append(htmlText), this._div = div, this._self = new createjs.DOMElement(div), 
        this._self.x = dims.x, this._self.y = dims.y + 1e3, this._registerEvents(data.id);
    },
    getWordId: function(index) {
        return this._stage._data.id + "-text-" + this._data.id + "-word-" + index;
    },
    play: function(action) {
        var instance = this, audio = action.audio || this._data.audio;
        if (this._timings.length > 0) if (this._isPaused) instance._resume(action); else {
            this._isPlaying = !0;
            if (audio) {
                var soundInstance = this._playAudio(audio);
                soundInstance.on("complete", function() {
                    instance._cleanupHighlight(), void 0 !== action.cb && action.cb({
                        status: "success"
                    });
                }), this._listener = function() {
                    if ((_.isUndefined(instance._audioInstance) || _.isUndefined(instance._audioInstance.object)) && instance._listener) return void createjs.Ticker.removeEventListener("tick", instance._listener);
                    instance._position.current = Number(instance._audioInstance.object.position.toFixed(0)), 
                    instance._highlight(), instance._position.previous = instance._position.current;
                };
            } else this._time = Date.now(), this._listener = function() {
                instance._isPaused || (instance._position.current = Date.now() - instance._time + instance._position.pause, 
                instance._highlight(), instance._position.previous > instance._timings[instance._timings.length - 1] + 500 && (instance._cleanupHighlight(), 
                void 0 !== action.cb && action.cb({
                    status: "success"
                })), instance._position.previous = instance._position.current);
            };
            createjs.Ticker.addEventListener("tick", instance._listener);
        } else console.info("No timing data to play highlight text:", this._id);
    },
    pause: function(action) {
        if (this._isPlaying) {
            var instance = this, audio = action.audio || this._data.audio;
            this._timings.length > 0 ? (instance._isPaused = !0, audio ? AudioManager.pause({
                asset: audio
            }, instance._audioInstance) : instance._position.pause = instance._position.current) : console.info("No timing data:", this._id);
        } else console.info("highlight is not playing to pause:", this._id);
    },
    togglePlay: function(action) {
        this._isPlaying && !this._isPaused ? (this.pause(action), void 0 !== action.cb && action.cb({
            status: "success"
        })) : this.play(action);
    },
    _resume: function(action) {
        var instance = this, audio = action.audio || this._data.audio;
        this._timings.length > 0 ? (instance._isPaused = !1, audio ? AudioManager.play({
            asset: audio,
            stageId: instance._stage._id
        }, instance._audioInstance) : instance._time = Date.now()) : console.info("No timing data:", this._id);
    },
    stop: function(action) {
        var instance = this, audio = action.audio || this._data.audio;
        this._timings.length > 0 ? (audio && AudioManager.stop({
            asset: audio,
            stageId: instance._stage._id
        }), instance._cleanupHighlight()) : console.info("No timing data:", this._id);
    },
    _playAudio: function(audio) {
        var instance = this;
        return instance._data.audio = audio, instance._audioInstance = AudioManager.play({
            asset: audio,
            stageId: this._stage._id
        }), instance._audioInstance.object;
    },
    _highlight: function() {
        var instance = this;
        if (instance._position.current && instance._isPlaying) {
            var matches = _.filter(instance._timings, function(time) {
                return time >= instance._position.previous && time < instance._position.current;
            });
            matches.length > 0 && _.each(matches, function(match) {
                var index = instance._timings.indexOf(match), wordId = instance.getWordId(index);
                instance._removeHighlight(), instance._addHighlight(wordId);
            });
        }
    },
    _cleanupHighlight: function() {
        this._isPlaying = !1, this._removeHighlight(), this._listener && createjs.Ticker.removeEventListener("tick", this._listener), 
        this._audioInstance && (this._audioInstance = void 0), this._time = 0, this._position = {
            previous: 0,
            current: 0,
            pause: 0
        };
    },
    _removeHighlight: function() {
        jQuery("." + this._wordClass).css({
            "background-color": "none",
            padding: "0px"
        });
    },
    _addHighlight: function(id) {
        jQuery("#" + id).css({
            background: this._data.highlight
        });
    },
    _tokenize: function(text) {
        var htmlText = "";
        Replaced_text = text.replace(/(\r\n|\n|\r)/gm, " </br> ");
        var words = Replaced_text.split(" ");
        this._wordIds = [];
        var index = 0;
        for (i = 0; i < words.length; i++) if ("" === words[i]) htmlText += '<span class="gc-ht-word">&nbsp;</span> '; else if ("</br>" === words[i]) htmlText += '<span class="gc-ht-word"></br></span> '; else {
            var wordId = this.getWordId(index);
            this._wordIds.push(wordId), htmlText += '<span id="' + wordId + '" class="gc-ht-word">' + words[i] + "</span> ", 
            index++;
        }
        return htmlText;
    },
    _getText: function() {
        var textStr = "";
        return this._data.$t || this._data.__text ? textStr = this._data.$t || this._data.__text : this._data.model ? textStr = this._stage.getModelValue(this._data.model) || "" : this._data.param && (textStr = this.getParam(this._data.param.trim()) || ""), 
        textStr;
    },
    _registerEvents: function(id) {
        var instance = this;
        jQuery("#" + id).children().each(function() {
            var data = jQuery(this).data();
            data && data.event && jQuery(this).click(function(event) {
                event.preventDefault(), instance._triggerEvent(data.event), console.info("Triggered event ", data.event);
            });
        });
    },
    _triggerEvent: function(event) {
        var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
        event = new createjs.Event(event), plugin.dispatchEvent(event);
    }
});

PluginManager.registerPlugin("htext", HighlightTextPlugin);

var HotspotPlugin = ShapePlugin.extend({
    _type: "hotspot",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        data.fill = void 0, data.hitArea = !0, this._super(data);
    }
});

PluginManager.registerPlugin("hotspot", HotspotPlugin);

var ImagePlugin = Plugin.extend({
    _type: "image",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        var instance = this, asset = "";
        if (data.asset ? ("validate" !== data.asset && "next" !== data.asset && "previous" !== data.asset || (data.visible = !1), 
        asset = data.asset) : data.model ? asset = this._stage.getModelValue(data.model) : data.param && (asset = this.getParam(data.param)), 
        _.isEmpty(asset)) this._render = !1, console.warn("ImagePlugin: Asset not found", data); else {
            var img, assetSrc = this._theme.getAsset(asset);
            _.isString(assetSrc) ? (img = new Image(), img.crossOrigin = "Anonymous", img.src = assetSrc) : img = assetSrc;
            var s = new createjs.Bitmap(img);
            this._self = s;
            var dims = this.relativeDims();
            if (_.isString(assetSrc)) this._self.visible = !1, AssetManager.strategy.loadAsset(this._stage._data.id, asset, assetSrc, function() {
                Renderer.update = !0, setTimeout(function() {
                    s.getBounds() && instance.setScale(), dims = instance.alignDims(), s.x = dims.x, 
                    s.y = dims.y, instance._self.visible = !!_.isUndefined(instance._data.visible) || instance._data.visible, 
                    Renderer.update = !0;
                }, 100);
            }); else {
                s.getBounds() && this.setScale();
            }
            dims = this.alignDims(), s.x = dims.x, s.y = dims.y, Renderer.update = !0;
        }
    },
    alignDims: function() {
        var parentDims = this._parent.dimensions(), dims = this._dimensions, align = this._data.align ? this._data.align.toLowerCase() : "", valign = this._data.valign ? this._data.valign.toLowerCase() : "";
        return "left" == align ? dims.x = 0 : "right" == align ? dims.x = parentDims.w - dims.w : "center" == align && (dims.x = (parentDims.w - dims.w) / 2), 
        "top" == valign ? dims.y = 0 : "bottom" == valign ? dims.y = parentDims.h - dims.h : "middle" == valign && (dims.y = (parentDims.h - dims.h) / 2), 
        this._dimensions;
    },
    refresh: function() {
        var asset = "";
        if ((asset = this._data.model ? this._stage.getModelValue(this._data.model) : this._data.param ? this.getParam(this._data.param) : this._data.asset) && this._theme && this._self) {
            var image = this._theme.getAsset(asset);
            this._self.image = image, Renderer.update = !0;
        }
    }
});

PluginManager.registerPlugin("image", ImagePlugin);

var InputPlugin = HTMLPlugin.extend({
    _type: "input",
    _input: void 0,
    initPlugin: function(data) {
        this._input = void 0;
        var controller = this._stage._stageController;
        _.isUndefined(controller) ? console.warn("there is no FTB item") : (plugindata = this.getState(controller._model[controller._index].type), 
        _.isUndefined(plugindata) || (controller._model[controller._index].model = _.isEmpty(plugindata) ? controller._model[controller._index].model : plugindata));
        var fontsize = data.fontsize || "1.6em", fontweight = data.weight || "normal", color = data.color || "#000000", background = data.fill || "white", font = data.font || "Arial", border = data.stroke || "#000000";
        data.stroke = "";
        var dims = this.relativeDims(), input = document.getElementById(data.id);
        input && jQuery("#" + data.id).remove(), input = document.createElement("input"), 
        input.id = data.id, input.type = data.type, input.style.top = "-1000px", input.style.width = dims.w + "px", 
        input.style.height = dims.h + "px", input.style.minWidth = dims.w + "px", input.style.minHeight = dims.h + "px", 
        input.style.setProperty("font-size", fontsize, "important"), input.style.setProperty("font-weight", fontweight, "important"), 
        input.style.setProperty("font-family", font, "important"), input.style.setProperty("color", color, "important"), 
        input.style.setProperty("background-color", background, "important"), input.style.setProperty("border-color", border, "important"), 
        input.className = data.class, input.style.display = "none";
        var val, instance = this;
        if (data.model) {
            var model = data.model;
            val = this._stage.getModelValue(model);
        } else data.param && (val = this._stage.params[data.param.trim()]);
        input.value = val || "";
        var div = document.getElementById("gameArea");
        div.insertBefore(input, div.childNodes[0]), this._input = input, this._self = new createjs.DOMElement(input), 
        this._self.x = dims.x, this._self.y = dims.y + 1e3, this._theme.inputs.push(data.id), 
        this._stage._inputs.push(this);
        var instance = this;
        $("input").on("change", function() {
            instance.updateState(!0);
        }), instance.updateState(!1);
    },
    setModelValue: function() {
        if (this._data.model) {
            var model = this._data.model;
            this._stage.setModelValue(model, this._input.value);
        }
    },
    updateState: function(isStateChanged) {
        this.setModelValue();
        var controller = this._stage._stageController;
        if (_.isUndefined(controller)) console.warn("There is no ctrl in this stage"), this.setState(this._data.id, this._input.value, isStateChanged); else {
            var cModel = controller._model[controller._index];
            this.setState(cModel.type, cModel.model, isStateChanged);
        }
    }
});

PluginManager.registerPlugin("input", InputPlugin), PluginManager.registerPlugin("launcher", Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener("renderer:launcher:initLauncher", this.initLauncher, this);
    },
    initLauncher: function(evt, content) {
        console.info("launcher init is calling..");
        var dispatcher = [ {
            mimeType: "application/vnd.ekstep.html-archive",
            event: "renderer:html:launch",
            id: "org.ekstep.htmlrenderer",
            ver: 1,
            type: "plugin"
        }, {
            mimeType: "application/vnd.ekstep.ecml-archive",
            event: "renderer:ecml:launch",
            id: "org.ekstep.ecmlrenderer",
            ver: 1,
            type: "plugin"
        } ], contentTypePlugin = _.findWhere(dispatcher, {
            mimeType: content.mimeType
        });
        PluginManager.init("renderer"), _.isUndefined(contentTypePlugin) || this.loadPlugin(contentTypePlugin, content);
    },
    loadPlugin: function(plugin, content) {
        PluginManager.loadPlugins(plugin, [], function() {
            EkstepRendererAPI.dispatchEvent(plugin.event, void 0, content);
        });
    }
}));

var MCQPlugin = Plugin.extend({
    _type: "mcq",
    _isContainer: !0,
    _render: !0,
    _multi_select: !1,
    _options: [],
    _controller: void 0,
    _shadow: "#0470D8",
    _blur: 30,
    _offsetX: 0,
    _offsetY: 0,
    _highlight: "#E89241",
    initPlugin: function(data) {
        this._multi_select = !1, this._options = [], this._shadow = "#0470D8", this._blur = 30, 
        this._offsetX = 0, this._offsetY = 0;
        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model), plugindata = this.getState(this._type);
            if (_.isUndefined(plugindata) || (controller._model[controller._index].options = _.isEmpty(plugindata) ? controller._model[controller._index].options : plugindata), 
            controller) {
                this.updateState(controller, !1), this._controller = controller, this._multi_select = data.multi_select, 
                void 0 !== this._multi_select && null != this._multi_select || (this._multi_select = !1), 
                this._data.x = this._parent._data.x, this._data.y = this._parent._data.y, this._data.w = this._parent._data.w, 
                this._data.h = this._parent._data.h, this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x, this._self.y = dims.y, data.shadow && (this._shadow = data.shadow, 
                data.shadow = void 0), data.highlight && (this._highlight = data.highlight), _.isFinite(data.blur) && (this._blur = data.blur), 
                _.isFinite(data.offsetX) && (this._offsetX = data.offsetX), _.isFinite(data.offsetY) && (this._offsetY = data.offsetY), 
                this._multi_select = this.isMultiSelect(), this.invokeChildren(data, this, this._stage, this._theme);
            }
        }
    },
    isMultiSelect: function() {
        var ansLength = 0, options = this._controller ? this._controller.getModelValue("options") : void 0;
        return options && (ansLength = _.filter(options, function(option) {
            return 1 == option.answer;
        }).length), ansLength > 1;
    },
    selectOption: function(option) {
        var controller = this._controller;
        this._multi_select || this._options.forEach(function(o) {
            o._index != option._index && o.hasShadow() && (o.removeShadow(), controller.setModelValue(o._model, !1, "selected"));
        });
        var val = void 0;
        return option && (val = option.toggleShadow(), controller.setModelValue(option._model, val, "selected")), 
        this.updateState(controller, !0), Renderer.update = !0, val;
    },
    updateState: function(controller, isStateChanged) {
        if (!_.isUndefined(controller._model)) {
            var model = controller._model[controller._index];
            this.setState(model.type, model.options, isStateChanged);
        }
    }
});

PluginManager.registerPlugin("mcq", MCQPlugin);

var MTFPlugin = Plugin.extend({
    _type: "mtf",
    _isContainer: !0,
    _render: !0,
    _lhs_options: [],
    _rhs_options: [],
    _force: !1,
    _controller: void 0,
    initPlugin: function(data) {
        this._lhs_options = [], this._rhs_options = [], this._force = !1;
        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model), plugindata = this.getState(this._type);
            if (_.isUndefined(plugindata) || (controller._model[controller._index].rhs_options = _.isEmpty(plugindata) ? controller._model[controller._index].rhs_options : plugindata), 
            controller) {
                this.updateState(controller, !1), this._controller = controller, this._force = data.force, 
                void 0 !== this._force && null != this._force || (this._force = !1), this._data.x = this._parent._data.x, 
                this._data.y = this._parent._data.y, this._data.w = this._parent._data.w, this._data.h = this._parent._data.h, 
                this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x, this._self.y = dims.y, this.invokeChildren(data, this, this._stage, this._theme);
            }
        }
    },
    getLhsOption: function(index) {
        var option;
        return this._lhs_options.forEach(function(opt) {
            opt._index == index && (option = opt);
        }), option;
    },
    setAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, "selected");
    },
    setAnswerMapping: function(rhsOption, lhsOption) {
        _.isUndefined(lhsOption) ? (delete rhsOption._value.mapped, this._controller.setModelValue(rhsOption._model, void 0, "selected")) : (rhsOption._value.mapped = lhsOption._value.resvalue, 
        this._controller.setModelValue(rhsOption._model, lhsOption._index, "selected")), 
        this.updateState(this._controller, !0);
    },
    removeAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, "");
    },
    updateState: function(controller, isStateChanged) {
        if (!_.isUndefined(controller._model)) {
            var model = controller._model[controller._index];
            this.setState(model.type, model.rhs_options, isStateChanged);
        }
    }
});

PluginManager.registerPlugin("mtf", MTFPlugin);

var OptionPlugin = Plugin.extend({
    _type: "option",
    _isContainer: !1,
    _render: !1,
    _index: -1,
    _model: void 0,
    _value: void 0,
    _answer: void 0,
    _multiple: !1,
    _mapedTo: void 0,
    _uniqueId: void 0,
    _modelValue: void 0,
    initPlugin: function(data) {
        this._model = void 0, this._value = void 0, this._answer = void 0, this._index = -1, 
        this._uniqueId = _.uniqueId("opt_");
        var model = data.option, value = void 0;
        if (data.multiple && (this._multiple = data.multiple), this._parent._controller && model) {
            this._model = model;
            value = this._parent._controller.getModelValue(model), this._index = parseInt(model.substring(model.indexOf("[") + 1, model.length - 1));
            var varName = this._data.var ? this._data.var : "option";
            this._stage._templateVars[varName] = this._parent._data.model + "." + model, this._modelValue = this._stage.getModelValue(this._parent._data.model + "." + model);
        }
        if (value && _.isFinite(this._index) && this._index > -1) {
            this._self = new createjs.Container();
            var dims = this.relativeDims();
            this._self.x = dims.x, this._self.y = dims.y, this._self.origX = dims.x, this._self.origY = dims.y, 
            this._self.width = dims.w, this._self.height = dims.h;
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h), this._self.hitArea = hit, 
            this._value = value.value, this.setOptionIndex(data), this.initShadow(data);
            var innerECML = this.getInnerECML();
            _.isEmpty(innerECML) ? "image" == value.value.type ? this.renderImage(value.value) : "text" == value.value.type && this.renderText(value.value) : this.renderInnerECML(), 
            "mcq" == this._parent._type ? this.renderMCQOption() : "mtf" == this._parent._type && this.renderMTFOption(value), 
            this.resolveModelValue(this._data), this._render = !0;
        }
    },
    renderMCQOption: function() {
        var controller = this._parent._controller, itemId = controller.getModelValue("identifier");
        this._parent._options.push(this), this._self.cursor = "pointer";
        var instance = this;
        !0 === this._modelValue.selected && this.addShadow(), this._self.on("click", function(event) {
            var val = instance._parent.selectOption(instance);
            OverlayManager.handleSubmit();
            var data = {
                type: event.type,
                x: event.stageX,
                y: event.stageY,
                choice_id: instance._value.resindex,
                itemId: itemId,
                res: [ {
                    option: instance._value.resvalue
                } ],
                state: val ? "SELECTED" : "UNSELECTED",
                optionTag: "MCQ"
            };
            EventBus.dispatch("optionSelected", instance._value), EventManager.processAppTelemetry({}, "CHOOSE", instance, data);
        });
    },
    renderMTFOption: function(value) {
        var enableDrag = !1, dragPos = {}, dragItem = {}, controller = this._parent._controller, instance = this, itemId = controller.getModelValue("identifier");
        if (_.isFinite(value.index) ? (this._index = value.index, this._parent._lhs_options.push(this)) : (this._parent._rhs_options.push(this), 
        enableDrag = !0), void 0 != value.selected) {
            var snapTo;
            snapTo = instance._parent._lhs_options;
            var plugin = snapTo[value.selected], dims = plugin._dimensions;
            _.isUndefined(plugin._data.snapX) || (this._self.x = dims.x + dims.w * plugin._data.snapX / 100), 
            _.isUndefined(plugin._data.snapY) || (this._self.y = dims.y + dims.h * (plugin._data.snapY / 100));
        }
        if (enableDrag) {
            var instance = this, asset = this._self;
            asset.cursor = "pointer", asset.on("mousedown", function(evt) {
                this.parent.addChild(this), this.offset = {
                    x: this.x - evt.stageX,
                    y: this.y - evt.stageY
                }, dragItem = instance._value.resvalue, dragPos = {
                    x: evt.stageX,
                    y: evt.stageY
                };
                var data = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    drag_id: instance._value.resvalue,
                    itemId: itemId
                };
                EventBus.dispatch("optionDrag", instance._value), EventManager.processAppTelemetry({}, "DRAG", instance, data);
            }), asset.on("pressmove", function(evt) {
                this.x = evt.stageX + this.offset.x, this.y = evt.stageY + this.offset.y, instance.addShadow(), 
                Renderer.update = !0;
            }), asset.on("pressup", function(evt) {
                var snapTo;
                snapTo = !0 === instance._parent._force ? instance._parent.getLhsOption(value.answer) : instance._parent._lhs_options;
                var plugin, dims, snapSuccess = !1;
                if (_.isArray(snapTo)) for (var i = 0; i < snapTo.length && !snapSuccess; i++) {
                    plugin = snapTo[i], dims = plugin._dimensions;
                    var xFactor = parseFloat(.5 * this.width), yFactor = parseFloat(.5 * this.height), x = dims.x - xFactor, y = dims.y - yFactor, maxX = dims.x + dims.w + xFactor, maxY = dims.y + dims.h + yFactor;
                    this.x >= x && this.x + this.width <= maxX && this.y >= y && this.y + this.height <= maxY && (this._mapedTo = snapTo[i], 
                    snapSuccess = !0);
                } else if (snapTo) {
                    plugin = snapTo, dims = plugin._dimensions;
                    var xFactor = parseFloat(.5 * this.width), yFactor = parseFloat(.5 * this.height), x = dims.x - xFactor, y = dims.y - yFactor, maxX = dims.x + dims.w + xFactor, maxY = dims.y + dims.h + yFactor;
                    this.x >= x && this.x + this.width <= maxX && this.y >= y && this.y + this.height <= maxY && (snapSuccess = !0);
                }
                var drop_id = snapSuccess ? plugin._id : "", drop_idx = snapSuccess ? plugin._index : "", drop_rsv = snapSuccess ? plugin._value.resvalue : "", drag_rsv = instance._value.resvalue;
                if (snapSuccess) {
                    var flag = !0;
                    if (plugin._multiple && (flag = !1), plugin._answer && flag) {
                        var existing = plugin._answer;
                        existing._parent.setAnswerMapping(existing, void 0), existing._self.x = existing._self.origX, 
                        existing._self.y = existing._self.origY;
                    }
                    if (_.isUndefined(plugin._data.snapX) || (this.x = dims.x + dims.w * plugin._data.snapX / 100), 
                    _.isUndefined(plugin._data.snapY) || (this.y = dims.y + dims.h * (plugin._data.snapY / 100)), 
                    instance._parent.setAnswerMapping(instance, plugin), _.isArray(snapTo)) for (var i = 0; i < snapTo.length; i++) {
                        var rhsOption = snapTo[i];
                        rhsOption._answer == instance && (rhsOption._answer = void 0);
                    } else snapTo && snapTo._answer == instance && (snapTo._answer = void 0);
                    plugin._answer = instance;
                } else if (this.x = this.origX, this.y = this.origY, _.isArray(snapTo)) for (var i = 0; i < snapTo.length; i++) {
                    var lhsQues = snapTo[i];
                    if (lhsQues._answer && lhsQues._answer._uniqueId == instance._uniqueId) {
                        lhsQues._answer = void 0, instance._parent.setAnswerMapping(instance, void 0);
                        break;
                    }
                }
                OverlayManager.handleSubmit(), void 0 !== drop_idx && "" !== drop_idx || instance._parent.setAnswerMapping(instance, void 0), 
                instance.removeShadow();
                var data = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    choice_id: instance._value.resindex,
                    itemId: itemId,
                    drop_id: drop_id,
                    drop_idx: drop_idx,
                    pos: [ {
                        x: evt.stageX,
                        y: evt.stageY
                    }, dragPos ],
                    res: [ {
                        rhs: drag_rsv
                    }, {
                        lhs: drop_rsv
                    } ],
                    state: void 0 !== drop_idx && "" !== drop_idx ? "SELECTED" : "UNSELECTED",
                    optionTag: "MTF"
                };
                EventBus.dispatch("optionDrop", instance._value), EventManager.processAppTelemetry({}, "DROP", instance, data), 
                Renderer.update = !0;
            });
        }
    },
    renderImage: function(value) {
        var data = {};
        data.asset = value.asset;
        var padx = this._data.padX || 0, pady = this._data.padY || 0;
        data.x = padx, data.y = pady, data.w = 100 - 2 * padx, data.h = 100 - 2 * pady, 
        value.count ? (data.count = value.count, data.type = "gridLayout", PluginManager.invoke("placeholder", data, this, this._stage, this._theme)) : PluginManager.invoke("image", data, this, this._stage, this._theme), 
        this._data.asset = value.asset;
    },
    renderText: function(data) {
        data.$t = data.asset;
        var padx = this._data.padX || 0, pady = this._data.padY || 0;
        data.x = padx, data.y = pady, data.w = 100 - 2 * padx, data.h = 100 - 2 * pady, 
        data.fontsize = data.fontsize ? data.fontsize : 200;
        var align = this._data.align ? this._data.align.toLowerCase() : "center", valign = this._data.valign ? this._data.valign.toLowerCase() : "middle";
        data.align = align, data.valign = valign, PluginManager.invoke("text", data, this, this._stage, this._theme), 
        this._data.asset = data.asset;
    },
    initShadow: function(data) {
        var highlightColor = this._data.highlight || "#E89241", shadowColor = this._data.shadowColor || "#cccccc", shadowData = {
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            type: "roundrect",
            fill: highlightColor,
            visible: !1,
            opacity: this._data.opacity || 1
        };
        this._self.shadow = PluginManager.invoke("shape", shadowData, this, this._stage, this._theme);
        var offsetX = this._data.offsetX || 0, offsetY = this._data.offsetY || 0, blur = this._data.blur || 2;
        this._self.shadow._self.shadow = new createjs.Shadow(shadowColor, offsetX, offsetY, blur);
    },
    setOptionIndex: function(data) {
        data = JSON.stringify(data), data = data.replace(new RegExp("\\$current", "g"), this._index), 
        data = JSON.parse(data), this._data = data;
    },
    renderInnerECML: function() {
        var innerECML = this.getInnerECML();
        if (!_.isEmpty(innerECML)) {
            var data = {}, padx = this._data.padX || 0, pady = this._data.padY || 0;
            data.x = padx, data.y = pady, data.w = 100 - 2 * padx, data.h = 100 - 2 * pady, 
            Object.assign(data, innerECML), PluginManager.invoke("g", data, this, this._stage, this._theme);
        }
    },
    resolveModelValue: function(data) {
        var instance = this, updateAction = function(action) {
            if (action.asset_model) {
                var model = action.asset_model, val = instance._stage.getModelValue(model);
                action.asset = val, delete action.asset_model;
            }
        }, updateEvent = function(evt) {
            _.isArray(evt.action) ? evt.action.forEach(function(action) {
                updateAction(action);
            }) : evt.action && updateAction(evt.action);
        }, events = void 0;
        data.events ? _.isArray(data.events) ? (events = [], data.events.forEach(function(e) {
            events.push.apply(events, e.event);
        })) : events = data.events.event : events = data.event, _.isArray(events) ? events.forEach(function(e) {
            updateEvent(e);
        }) : events && updateEvent(events);
    }
});

PluginManager.registerPlugin("option", OptionPlugin);

var OptionsPlugin = Plugin.extend({
    _type: "options",
    _isContainer: !1,
    _render: !1,
    initPlugin: function(data) {
        var model = data.options, value = void 0;
        this._parent._controller && model && (value = this._parent._controller.getModelValue(model));
        var layout = data.layout;
        value && _.isArray(value) && value.length > 0 && "table" === layout && (_.isFinite(data.cols) || _.isFinite(data.rows)) && this.renderTableLayout(value);
    },
    renderTableLayout: function(value) {
        var cols = void 0, rows = void 0, count = value.length;
        this._data.cols ? (cols = Math.min(count, this._data.cols), rows = Math.ceil(count / cols)) : this._data.rows ? (rows = Math.min(count, this._data.rows), 
        cols = Math.ceil(count / rows)) : (rows = 1, cols = Math.min(count, this._data.cols));
        var instance = this, marginX = 0;
        _.isFinite(this._data.marginX) && (marginX = this._data.marginX);
        var marginY = 0;
        _.isFinite(this._data.marginY) && (marginY = this._data.marginY);
        for (var padX = this._data.padX || 0, padY = this._data.padY || 0, cw = (this._data.w - (cols - 1) * marginX) / cols, ch = (this._data.h - (rows - 1) * marginY) / rows, index = 0, r = 0; r < rows; r++) for (var c = 0; c < cols; c++) if (c * r < count) {
            var data = {};
            data.x = instance._data.x + c * (cw + marginX), data.y = instance._data.y + r * (ch + marginY), 
            data.w = cw, data.h = ch, data.padX = padX, data.padY = padY, data.snapX = instance._data.snapX, 
            data.snapY = instance._data.snapY, data.stroke = instance._data.stroke, data["stroke-width"] = instance._data["stroke-width"], 
            data.events = instance._data.events, data.event = instance._data.event, this._parent._shadow && (data.shadowColor = this._parent._shadow), 
            this._parent._highlight && (data.highlight = this._parent._highlight), _.isFinite(this._parent._blur) && (data.blur = this._parent._blur), 
            _.isFinite(this._parent._offsetX) && (data.offsetX = this._parent._offsetX), _.isFinite(this._parent._offsetY) && (data.offsetY = this._parent.offsetY), 
            this._data.multiple && (data.multiple = !0), this._data.opacity && (data.opacity = this._data.opacity), 
            data.option = instance._data.options + "[" + index + "]";
            var innerECML = this.getInnerECML();
            _.isEmpty(innerECML) || ("function" != typeof Object.assign && objectAssign(), Object.assign(data, innerECML)), 
            index += 1, PluginManager.invoke("option", data, instance._parent, instance._stage, instance._theme);
        }
    }
});

PluginManager.registerPlugin("options", OptionsPlugin);

var PlaceHolderPlugin = Plugin.extend({
    _type: "placeholder",
    _isContainer: !0,
    _render: !0,
    initPlugin: function(data) {
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x, this._self.y = dims.y;
        var instance = this;
        this.renderPlaceHolder(instance);
    },
    renderPlaceHolder: function(instance) {
        var data = instance._data;
        if (data.model) instance.param = instance._stage.getModelValue(data.model); else if (data.param) instance.param = instance._stage.params[data.param.trim()]; else {
            var type = data.type;
            void 0 === type && (data["param-type"] ? type = instance.evaluateExpr(data["param-type"].trim()) : data["model-type"] && (type = instance._stage.getModelValue(data["model-type"].trim())));
            var count = data.count;
            void 0 === count && (data["param-count"] ? count = instance.evaluateExpr(data["param-count"].trim()) : data["model-count"] && (count = instance._stage.getModelValue(data["model-count"].trim()))), 
            void 0 !== count && "" !== count || (count = 1);
            var asset = data.asset;
            void 0 === asset && (data["param-asset"] ? asset = instance.evaluateExpr(data["param-asset"].trim()) : data["model-asset"] && (asset = instance._stage.getModelValue(data["model-asset"].trim()))), 
            instance.param = {
                type: type,
                asset: asset,
                count: count
            };
        }
        instance.param && instance.param.asset && ("gridLayout" == instance.param.type ? instance.renderGridLayout(instance, instance, data) : "image" == instance.param.type ? instance.renderImage(instance) : "text" == instance.param.type && instance.renderText(instance));
    },
    renderText: function(instance) {
        var param = instance.param, data = instance._data;
        data.$t = param.asset, PluginManager.invoke("text", data, instance._parent, instance._stage, instance._theme);
    },
    renderImage: function(instance) {
        var param = instance.param, data = instance._data;
        data.asset = param.asset, PluginManager.invoke("image", data, instance._parent, instance._stage, instance._theme);
    },
    getAssetBound: function(img, pad) {
        var imgBounds = img.getBounds(), imgW = imgBounds.width, imgH = imgBounds.height;
        img.x = parseFloat(pad / 2), img.y = parseFloat(pad / 2);
        var imgCont = new createjs.Container();
        return imgCont.addChild(img), imgCont.cache(0, 0, imgW + pad, imgH + pad), imgCont;
    },
    computePixel: function(area, repeat) {
        return Math.floor(Math.sqrt(parseFloat(area / repeat)));
    },
    renderGridLayout: function(parent, instance, data) {
        var assetId = instance.param.asset, assetSrc = instance._theme.getAsset(assetId), img = new createjs.Bitmap(assetSrc), getImage = function(cb) {
            if (_.isUndefined(assetSrc)) return void console.error('"' + assetId + '" Asset not found. Please check index.ecml.');
            AssetManager.strategy.loadAsset(instance._stage._data.id, assetId, assetSrc, function() {
                assetSrc = instance._theme.getAsset(assetId), img = new createjs.Bitmap(assetSrc), 
                _.isNull(img.getBounds()) ? console.warn("Unable to find the Bounds value for " + assetId + ",  Source - " + assetSrc) : cb();
            });
        }, enableDrag = function(asset, snapTo) {
            asset.cursor = "pointer", asset.on("mousedown", function(evt) {
                this.parent.addChild(this), this.offset = {
                    x: this.x - evt.stageX,
                    y: this.y - evt.stageY
                };
            }), asset.on("pressmove", function(evt) {
                this.x = evt.stageX + this.offset.x, this.y = evt.stageY + this.offset.y, Renderer.update = !0;
            }), snapTo && asset.on("pressup", function(evt) {
                var plugin = PluginManager.getPluginObject(data.snapTo), dims = plugin._dimensions, x = dims.x, y = dims.y, maxX = dims.x + dims.w, maxY = dims.y + dims.h, snapSuccess = !1;
                this.x >= x && this.x <= maxX && this.y >= y && this.y <= maxY && (snapSuccess = !0), 
                snapSuccess || (this.x = this.origX, this.y = this.origY);
            });
        }, renderGridImages = function() {
            var x = 0, y = 0, area = instance.dimensions().w * instance.dimensions().h, pad = instance.dimensions().pad || 0, repeat = instance.param.count, pixelPerImg = instance.computePixel(area, repeat) - parseFloat(pad / 1.5), param = instance.param, paddedImg = instance.getAssetBound(img, pad), assetBounds = paddedImg.getBounds(), assetW = assetBounds.width, assetH = assetBounds.height;
            paddedImg.scaleY = parseFloat(pixelPerImg / assetH), paddedImg.scaleX = parseFloat(pixelPerImg / assetW), 
            paddedImg.x = x + pad, paddedImg.y = y + pad;
            for (var instanceBoundary = 0 + instance.dimensions().w, i = 0; i < param.count; i++) {
                var clonedAsset = paddedImg.clone(!0);
                x + pixelPerImg > instanceBoundary && (x = 0, y += pixelPerImg + pad), clonedAsset.x = x + pad, 
                clonedAsset.y = y + pad, clonedAsset.origX = x + pad, clonedAsset.origY = y + pad, 
                x += pixelPerImg, instance._data.enabledrag && enableDrag(clonedAsset, data.snapTo), 
                Renderer.update = !0, parent.addChild(clonedAsset);
            }
        };
        _.isNull(img.getBounds()) ? getImage(renderGridImages) : renderGridImages();
    },
    refresh: function() {
        this._self.removeAllChildren(), this._currIndex = 0, this.renderPlaceHolder(this), 
        Renderer.update = !0;
    }
});

PluginManager.registerPlugin("placeholder", PlaceHolderPlugin);

var RepoPlugin = Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener("repo:intialize", this.initializeRepo, this);
    },
    initializeRepo: function() {
        var instance = this, contextObj = EkstepRendererAPI.getPreviewData();
        contextObj.config.repos && (_.isObject(contextObj.config.repos) ? _.each(contextObj.config.repos, function(repoPath, index) {
            instance.createRepoInstance(repoPath, index);
        }) : instance.createRepoInstance(contextObj.config.repos));
    },
    initPlugin: function() {
        console.info("Repo plugin init");
    },
    createRepoInstance: function(repoPath, index) {
        var repoInstance = new (org.ekstep.pluginframework.iRepo.extend({
            id: "ekstepPluginRepo_" + index,
            basePath: repoPath,
            discoverManifest: function(pluginId, pluginVer, callback, publishedTime) {
                var instance = this;
                org.ekstep.pluginframework.resourceManager.loadResource(this.resolveResource(pluginId, pluginVer, "manifest.json"), "json", function(err, response) {
                    callback(void 0, {
                        manifest: response,
                        repo: instance
                    });
                }, publishedTime);
            },
            resolveResource: function(pluginId, pluginVer, resource) {
                return this.basePath + "/" + pluginId + "-" + pluginVer + "/" + resource;
            }
        }))();
        this.addRepoInstance(repoInstance, repoPath);
    },
    addRepoInstance: function(repoInstance, repoPath) {
        org.ekstep.pluginframework.resourceManager.addRepo(repoInstance);
    }
});

PluginManager.registerPlugin("RepoPlugin", RepoPlugin);

var ScribblePlugin = Plugin.extend({
    _type: "scribble",
    _render: !0,
    _isContainer: !0,
    _data: void 0,
    _oldPt: void 0,
    _oldMidPt: void 0,
    _startPoint: void 0,
    _endPoint: void 0,
    initPlugin: function(data) {
        this._data = data;
        var dims = (data.color, data.fill, this.relativeDims());
        this._self = new createjs.Container(), this._self.x = dims.x, this._self.y = dims.y, 
        this._self.on("mousedown", this.handleMouseDown.bind(this), !0), createjs.Ticker.setFPS(50);
        var shapeData = {
            shape: {
                type: "rect",
                x: 0,
                y: 0,
                w: 100,
                h: 100
            }
        };
        data.fill && (shapeData.shape.fill = data.fill), data.stroke && (shapeData.shape.stroke = data.stroke), 
        _.isUndefined(data.opacity) || (shapeData.shape.opacity = data.opacity), data["stroke-width"] && (shapeData.shape["stroke-width"] = data["stroke-width"]), 
        data.rotate && (shapeData.shape.rotate = data.rotate), this.invokeChildren(shapeData, this, this._stage, this._theme), 
        this.paintBrush = new createjs.Shape(), this.paintBrush.x = 0, this.paintBrush.y = 0, 
        this._self.addChild(this.paintBrush);
    },
    setBounderies: function() {
        if (!this._startPoint || !this._endPoint) {
            var dims = this.relativeDims(), startPoint = this._self.localToGlobal(0, 0);
            this._startPoint = new createjs.Point(startPoint.x + 5, startPoint.y + 5);
            var x = startPoint.x + dims.w - 5, y = startPoint.y + dims.h - 5;
            this._endPoint = new createjs.Point(x, y);
        }
    },
    handleMouseDown: function(event) {
        this.setBounderies();
        var mousePoint = {
            x: event.stageX,
            y: event.stageY
        };
        mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y), this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y), 
        this._self.on("pressmove", this.handleMouseMove.bind(this), !0), this._self.on("pressup", this.handleMouseUp.bind(this), !0);
    },
    handleMouseMove: function(event) {
        var mousePoint = {
            x: event.stageX,
            y: event.stageY
        }, thickness = this.isInt(this._data.thickness) ? this._data.thickness : 3;
        mousePoint.x > this._startPoint.x && mousePoint.x < this._endPoint.x && mousePoint.y > this._startPoint.y && mousePoint.y < this._endPoint.y && (mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y), 
        this.paintBrush.graphics.setStrokeStyle(thickness, "round").beginStroke(this._data.color || "#000"), 
        this.paintBrush.graphics.mt(this._oldPt.x, this._oldPt.y).lineTo(mousePoint.x, mousePoint.y), 
        this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y), Renderer.update = !0);
    },
    handleMouseUp: function(event) {
        this._self.off("pressmove", this.handleMouseMove), this._self.off("pressup", this.handleMouseUp);
    },
    clear: function(action) {
        this.paintBrush.graphics.clear(), Renderer.update = !0;
    },
    isInt: function(value) {
        var x = parseFloat(value);
        return !isNaN(value) && (0 | x) === x;
    },
    drawBorder: function() {}
});

PluginManager.registerPlugin("scribble", ScribblePlugin);

var SetPlugin = Plugin.extend({
    _type: "set",
    _isContainer: !1,
    _modelName: void 0,
    _model: void 0,
    _index: 0,
    _render: !1,
    initPlugin: function(data) {
        this._modelName = void 0, this._model = void 0, this._index = 0;
        var value = data.value;
        if (data["ev-value"]) this._modelName = data.param, this._model = this.evaluateExpr(data["ev-value"]), 
        value = _.isArray(this._model) ? this._model[0] : this._model; else if (data.model) this._stage && (value = this._stage.getModelValue(data.model)); else if (data["ev-model"] && this._stage) {
            var model = this.replaceExpressions(data["ev-model"]);
            this._modelName = data.param, this._model = this._stage.getModelValue(model), value = _.isArray(this._model) ? this._model[0] : this._model;
        }
        this.setParam(data.param, value, void 0, data.scope);
    },
    replaceExpressions: function(model) {
        for (var arr = [], idx = 0, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1); -1 != nextIdx && -1 != endIdx; ) {
            var expr = model.substring(nextIdx, endIdx + 1);
            arr.push(expr), idx = endIdx, nextIdx = model.indexOf("${", idx), endIdx = model.indexOf("}", idx + 1);
        }
        if (arr.length > 0) for (var i = 0; i < arr.length; i++) {
            var val = this.evaluateExpr(arr[i]);
            model = model.replace(arr[i], val);
        }
        return model;
    },
    setParamValue: function(action) {
        var val, scope = action.scope, param = action.param, paramIdx = action["param-index"], paramKey = action["param-key"], paramExpr = action["ev-value"], paramModel = action["ev-model"];
        if (paramIdx) "previous" == paramIdx ? _.isArray(this._model) && this._model.length > 0 ? (this._index > 0 ? this._index = this._index - 1 : this._index = this._model.length - 1, 
        val = this._model[this._index]) : val = this._model : _.isArray(this._model) ? (this._index < this._model.length - 1 ? this._index = this._index + 1 : this._index = 0, 
        val = this._model[this._index]) : val = this._model; else if (paramKey) val = _.isObject(this._model) && this.model[paramKey] ? this.model[paramKey] : ""; else if (paramExpr) this._model = this.evaluateExpr(paramExpr), 
        val = _.isArray(this._model) ? this._model[0] : this._model; else if (paramModel) {
            if (this._stage) {
                var model = this.replaceExpressions(paramModel);
                this._model = this._stage.getModelValue(model), val = _.isArray(this._model) ? this._model[0] : this._model;
            }
        } else val = action["param-value"];
        var max = void 0;
        action["param-max"] && (max = this.evaluateExpr(action["param-max"]), val >= max && (val = action["param-incr"] = 0)), 
        this.setParam(param, val, action["param-incr"], scope, max);
    },
    setParam: function(param, value, incr, scope, max) {
        scope && "app" == scope.toLowerCase() ? GlobalContext.setParam(param, value, incr, max) : scope && "stage" == scope.toLowerCase() ? this._stage.setParam(param, value, incr, max) : scope && "parent" == scope.toLowerCase() ? this._parent.setPluginParam(param, value, incr, max) : this._theme && this._theme.setParam(param, value, incr, max);
    },
    getParam: function(param) {
        var value = GlobalContext.getParam(param);
        return value || _.isUndefined(this._theme) || (value = this._theme.getParam(param)), 
        value || (value = this._stage.getParam(param)), value || _.isUndefined(this._theme) || (value = this._parent.getPluginParam(param)), 
        value;
    }
});

PluginManager.registerPlugin("set", SetPlugin);

var SpritePlugin = Plugin.extend({
    _type: "sprite",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        var dims = this.relativeDims(), spriteJSON = this._theme.getAsset(data.asset), spriteImage = this._theme.getAsset(data.asset + "_image");
        if (spriteJSON && spriteImage) {
            spriteJSON.images.push(spriteImage);
            var spritesheet = new createjs.SpriteSheet(spriteJSON), grant = new createjs.Sprite(spritesheet);
            data.start && grant.gotoAndPlay(data.start), grant.x = dims.x, grant.y = dims.y, 
            this._self = grant, this._self.scaleX = dims.w / spriteJSON.frames.width, this._self.scaleY = dims.h / spriteJSON.frames.height, 
            grant.addEventListener("change", function() {
                Renderer.update = !0;
            });
        } else console.error("Sprite sheet definition or image not found.");
    },
    play: function(action) {
        this._self.visible || (this._self.visible = !0), this._self.gotoAndPlay(action.animation);
    },
    togglePlay: function(action) {
        this._self.paused ? this._self.gotoAndPlay(action.animation) : this._self.paused = !0;
    },
    pause: function() {
        this._self.paused = !0;
    },
    stop: function() {
        this._self.stop();
    }
});

PluginManager.registerPlugin("sprite", SpritePlugin);

var StagePlugin = Plugin.extend({
    _type: "stage",
    _isContainer: !0,
    _render: !0,
    params: {},
    _stageParams: {},
    _stageController: void 0,
    _stageControllerName: void 0,
    _templateVars: {},
    _controllerMap: {},
    _inputs: [],
    _startDrag: void 0,
    _doDrag: void 0,
    _stageInstanceId: void 0,
    _currentState: {},
    isStageStateChanged: void 0,
    maxTimeToLoad: 5e3,
    timeInstance: {},
    initPlugin: function(data) {
        var instance = this;
        this.destroyTimeInstance(data), this._inputs = [], this.params = {}, this._self = new creatine.Scene();
        var dims = this.relativeDims();
        if (this._self.x = dims.x, this._self.y = dims.y, this._stageInstanceId = this._theme._currentStage + "__" + Math.random().toString(36).substr(2, 9), 
        data.iterate && data.var) {
            var controllerName = data.var.trim(), stageController = this._theme._controllerMap[data.iterate.trim()];
            stageController && (this._stageControllerName = controllerName, this._stageController = stageController, 
            this._stageController.next());
        }
        for (k in data) if ("param" === k) if (_.isArray(data[k])) {
            var instance = this;
            data[k].forEach(function(param) {
                instance.setParamValue(param);
            });
        } else this.setParamValue(data[k]); else "controller" === k && (_.isArray(data[k]) ? data[k].forEach(function(p) {
            this.addController(p);
        }) : this.addController(data[k]));
        this._startDrag = this.startDrag.bind(this), this._doDrag = this.doDrag.bind(this), 
        window.addEventListener("native.keyboardshow", this.keyboardShowHandler.bind(this), !0), 
        window.addEventListener("native.keyboardhide", this.keyboardHideHandler.bind(this), !0);
        var stageKey = this.getStagestateKey();
        "function" == typeof this._theme.getParam && (this._currentState = this._theme.getParam(stageKey), 
        _.isUndefined(this._currentState) && this.setParam(this._type, {
            id: Renderer.theme._currentStage,
            stateId: stageKey
        }));
        var isStageLoaded;
        if (_.isUndefined(AssetManager.strategy) || (isStageLoaded = AssetManager.strategy.isStageAssetsLoaded(data.id)), 
        0 == isStageLoaded) {
            var timeInst;
            return EventBus.addEventListener(data.id + "_assetsLoaded", instance.invokeRenderElements, this), 
            timeInst = setTimeout(function() {
                (isStageLoaded = AssetManager.strategy.isStageAssetsLoaded(data.id)) || instance._theme._currentStage != data.id || (instance.showHideLoader("block"), 
                timeInst = setTimeout(function() {
                    "block" == jQuery("#loaderArea").css("display") && instance._theme._currentStage == instance._data.id && instance.invokeRenderElements();
                }, instance.maxTimeToLoad), instance.timeInstance[data.id] = timeInst);
            }, 500), void (this.timeInstance[data.id] = timeInst);
        }
        this.invokeChildren(data, this, this, this._theme);
    },
    destroyTimeInstance: function(data) {
        if (Renderer.theme && Renderer.theme.getStagesToPreLoad) {
            var stages = Renderer.theme.getStagesToPreLoad(data);
            !_.isUndefined(stages.next) && this.timeInstance[stages.next] && (clearTimeout(this.timeInstance[stages.next]), 
            delete this.timeInstance[stages.next]), !_.isUndefined(stages.prev) && this.timeInstance[stages.prev] && (clearTimeout(this.timeInstance[stages.prev]), 
            delete this.timeInstance[stages.prev]);
        }
    },
    invokeRenderElements: function() {
        this.invokeChildren(this._data, this, this, this._theme), Renderer.update = !0, 
        this.showHideLoader("none"), _.isUndefined(Renderer.theme) || _.isUndefined(Renderer.theme._currentScene) || Renderer.theme._currentScene.dispatchEvent("enter"), 
        EventBus.removeEventListener(this._data.id + "_assetsLoaded", this.invokeRenderElements, this);
    },
    keyboardShowHandler: function(e) {
        if (this._self.y = -e.keyboardHeight, !this._self.hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawRect(0, 0, this._self.width, this._self.height), 
            this._self.hitArea = hit, console.info("HitArea added to the stage.");
        }
        Renderer.update = !0, this.keyboardH = e.keyboardHeight, this._self.addEventListener("mousedown", this._startDrag), 
        this.offset = new createjs.Point();
    },
    startDrag: function() {
        this.offset.x = Renderer.theme._self.mouseX - this._self.x, this.offset.y = Renderer.theme._self.mouseY - this._self.y, 
        this._self.addEventListener("pressmove", this._doDrag);
    },
    doDrag: function(event) {
        (this._self.y >= this.keyboardH || this._self.y >= -this.keyboardH) && (this._self.y = event.stageY - this.offset.y, 
        this._self.y < -this.keyboardH && (this._self.y = 1 - this.keyboardH), this._self.y > 0 && (this._self.y = 0), 
        Renderer.update = !0);
    },
    keyboardHideHandler: function(e) {
        this._self.y = 0, this._self.removeEventListener("mousedown", this._startDrag), 
        this._self.removeEventListener("pressmove", this._doDrag), Renderer.update = !0;
    },
    setParamValue: function(p) {
        p.value ? this.params[p.name] = p.value : p.model && (this.params[p.name] = this.getModelValue(p.model));
    },
    addController: function(p) {
        var add = !0;
        if (p["ev-if"]) {
            var expr = p["ev-if"].trim();
            "${" != expr.substring(0, 2) && (expr = "${" + expr), "}" != expr.substring(expr.length - 1, expr.length) && (expr += "}"), 
            add = this.evaluateExpr(expr);
        }
        if (add) {
            var controller = ControllerManager.get(p, this._theme.baseDir);
            controller && (this._controllerMap[p.name] = controller);
        }
    },
    getController: function(name) {
        var c;
        return this._templateVars[name] && (name = this._templateVars[name]), this._stageControllerName === name ? c = this._stageController : this._controllerMap[name] ? c = this._controllerMap[name] : this._theme._controllerMap[name] && (c = this._theme._controllerMap[name]), 
        c;
    },
    getTemplate: function(controller) {
        var t, c = this.getController(controller);
        return c && (t = c.getTemplate()), t;
    },
    getModelValue: function(param) {
        var val;
        if (param) {
            var tokens = param.split(".");
            if (tokens.length >= 2) {
                var name = tokens[0].trim(), idx = param.indexOf("."), paramName = param.substring(idx + 1);
                this._templateVars[name] && (name = this._templateVars[name], name.indexOf(".") > 0 && (paramName = name.substring(name.indexOf(".") + 1) + "." + paramName, 
                name = name.substring(0, name.indexOf("."))));
                var controller = this.getController(name);
                controller && (val = controller.getModelValue(paramName));
            } else {
                var controller = this.getController(param);
                controller && (val = controller.getModelValue());
            }
        }
        return val;
    },
    setModelValue: function(param, val) {
        if (param) {
            var tokens = param.split(".");
            if (tokens.length >= 2) {
                var name = tokens[0].trim(), idx = param.indexOf("."), paramName = param.substring(idx + 1), controller = this.getController(name);
                controller && (val = controller.setModelValue(paramName, val));
            }
        }
    },
    isStageStateChanged: function(isChanged) {
        this._isStageStateChanged = isChanged, isChanged && (this._currentState.isEvaluated = !1);
    },
    evaluate: function(action) {
        var isEvaluated = !_.isUndefined(this._currentState) && this._currentState.isEvaluated;
        if (!1 !== this._isStageStateChanged || !isEvaluated) {
            var valid = !1, showImmediateFeedback = !0;
            if (this._stageController) {
                _.isUndefined(this._stageController._data.showImmediateFeedback) || (showImmediateFeedback = this._stageController._data.showImmediateFeedback), 
                this._inputs.forEach(function(input) {
                    input.setModelValue();
                });
                var result = this._stageController.evalItem();
                if (result && (valid = result.pass), this._currentState.isEvaluated = !0, EventBus.dispatch("evaluated", result), 
                showImmediateFeedback) {
                    if (1 == valid) {
                        OverlayManager.showFeeback(valid) || this.dispatchEvent(action.success);
                    } else {
                        OverlayManager.showFeeback(valid) || this.dispatchEvent(action.failure);
                    }
                    return;
                }
            }
        }
        OverlayManager.skipAndNavigateNext();
    },
    reload: function(action) {
        this._stageController && this._stageController.decrIndex(1), this._theme.replaceStage(this._data.id, action);
    },
    getStagestateKey: function() {
        return _.isUndefined(this._stageController) ? Renderer.theme._currentStage : Renderer.theme._currentStage + "_" + this._stageController._id + "_" + this._stageController._index;
    },
    setParam: function(param, value, incr, max) {
        var instance = this, fval = instance.params[param];
        incr ? (fval || (fval = 0), fval += incr) : fval = value, 0 > fval && (fval = 0), 
        void 0 !== max && fval >= max && (fval = 0), instance.params[param] = fval, this.stateConfig && (instance._currentState = $.extend({}, instance._currentState, instance.params), 
        instance._currentState = JSON.parse(JSON.stringify(instance._currentState)));
    },
    stateConfig: function() {
        return !!_.isUndefined(this._stageController) || (void 0 == this._stageController._data.saveState || 1 == this._stageController._data.saveState);
    },
    getParam: function(param) {
        var instance = this, params = instance.params, expr = "params." + param;
        return eval(expr);
    },
    isItemScene: function() {
        var stageCtrl = this._stageController;
        return !_.isUndefined(stageCtrl) && !_.isUndefined(stageCtrl._model) && "items" == stageCtrl._type;
    },
    isReadyToEvaluate: function() {
        var enableEval = !1, stageCtrl = this._stageController;
        if (!_.isUndefined(stageCtrl) && "items" == stageCtrl._type && !_.isUndefined(stageCtrl._model)) {
            var modelItem = stageCtrl._model[stageCtrl._index];
            modelItem && "ftb" == modelItem.type.toLowerCase() ? enableEval = !0 : _.isUndefined(this._currentState) || _.isUndefined(this._currentState.isEvaluated) || (enableEval = !this._currentState.isEvaluated);
        }
        return enableEval;
    },
    showHideLoader: function(val) {
        var elem = document.getElementById("loaderArea");
        _.isNull(elem) || (elem.style.display = val);
    }
});

PluginManager.registerPlugin("stage", StagePlugin);

var SummaryPlugin = Plugin.extend({
    _type: "summary",
    _isContainer: !1,
    _render: !1,
    initPlugin: function(data) {
        if (data.controller) {
            var message, controller = data.controller;
            this._theme._controllerMap[controller] ? message = this._theme._controllerMap[controller].feedback() : this._stage._stageControllerName === controller ? message = this._stage._stageController.feedback() : this._stage._controllerMap[controller] && (message = this._stage._controllerMap[controller].feedback()), 
            message && "text" == message.type && this.renderTextSummary(message.asset, data);
        }
    },
    renderTextSummary: function(text, data) {
        data.$t = text, PluginManager.invoke("text", data, this._parent, this._stage, this._theme);
    }
});

PluginManager.registerPlugin("summary", SummaryPlugin);

var TelemetryPlugin = Plugin.extend({
    _type: "telemetry",
    _isContainer: !1,
    _render: !0,
    _teleData: [],
    _maxTeleInstance: 10,
    _requiredFields: {},
    initPlugin: function(data) {
        console.log("Telemetry plugin init done !!!");
    },
    initialize: function() {
        EkstepRendererAPI.addEventListener("telemetryPlugin:intialize", this.initializeTelemetryPlugin, this);
    },
    initializeTelemetryPlugin: function() {
        if ("undefined" == typeof cordova) {
            this.listenTelementryEvent();
            var did = detectClient();
            this._requiredFields = {};
            var extConfig = EkstepRendererAPI.getPreviewData();
            this._requiredFields.uid = extConfig.context.uid || "anonymous", this._requiredFields.sid = extConfig.context.sid || CryptoJS.MD5(Math.random().toString()).toString(), 
            this._requiredFields.did = extConfig.context.did || CryptoJS.MD5(JSON.stringify(did)).toString();
        }
    },
    listenTelementryEvent: function() {
        var instance = this;
        EventBus.addEventListener("telemetryEvent", function(data) {
            data = JSON.parse(data.target), data = instance.appendRequiredFields(data), instance.addToQueue(data);
        });
    },
    appendRequiredFields: function(data) {
        return _.extend(data, this._requiredFields), data.mid = "OE_" + CryptoJS.MD5(JSON.stringify(data)).toString(), 
        data;
    },
    sendTelemetry: function(telemetryData) {
        var currentTimeStamp = new Date().getTime(), teleObj = {
            id: "ekstep.telemetry",
            ver: "2.0",
            ets: currentTimeStamp,
            events: telemetryData
        }, configuration = EkstepRendererAPI.getPreviewData(), headers = {};
        _.isUndefined(configuration.context.authToken) || (headers.Authorization = "Bearer " + configuration.context.authToken), 
        genieservice.sendTelemetry(teleObj, headers).then(function(data) {
            console.log("Telemetry API success", data);
        });
    },
    addToQueue: function(data) {
        if (this._teleData.push(data), "OE_END" == data.eid.toUpperCase() || this._teleData.length >= this._maxTeleInstance) {
            var telemetryData = _.clone(this._teleData);
            this._teleData = [], this.sendTelemetry(telemetryData);
        }
    }
});

PluginManager.registerPlugin("telemetry", TelemetryPlugin);

var TestcasePlugin = Plugin.extend({
    _type: "testcase",
    _render: !0,
    _isContainer: !0,
    _header: {
        g: {
            id: "hint",
            visible: "true",
            shape: {
                w: "100",
                h: "100",
                x: "0",
                y: "0",
                hitArea: !0,
                type: "rect"
            },
            text: [ {
                id: "yes",
                font: "Georgia",
                fontsize: "80",
                h: "100",
                w: "10",
                weight: "bold",
                x: "80",
                y: "10",
                __text: "Yes",
                valign: "middle"
            }, {
                id: "no",
                font: "Georgia",
                fontsize: "80",
                h: "100",
                w: "10",
                weight: "bold",
                x: "90",
                y: "10",
                __text: "No",
                valign: "middle"
            } ]
        }
    },
    initPlugin: function(data) {
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x, this._self.y = dims.y;
        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h), this._self.hitArea = hit, 
        this.createHeader(data), this.invokeChildren(data, this, this._stage, this._theme);
    },
    createHeader: function(data) {
        var uniqueId = _.uniqueId("testcase");
        this._header.g.x = data.x, this._header.g.y = data.y, this._header.g.w = data.w, 
        this._header.g.h = this._getHeaderHeight(data.h), this._header.g.text[0].id += uniqueId, 
        this._header.g.text[1].id += uniqueId, data.stroke && (this._header.g.shape.fill = data.stroke), 
        this.invokeChildren(this._header, this._stage, this._stage, this._theme);
        var pass = PluginManager.getPluginObject(this._header.g.text[0].id), fail = PluginManager.getPluginObject(this._header.g.text[1].id);
        this.registerTestActions(pass), this.registerTestActions(fail);
    },
    registerTestActions: function(plugin) {
        var instance = this;
        if (plugin._self) {
            var element = plugin._self;
            element.cursor = "pointer", element.addEventListener("click", function(event) {
                var pass = "Yes" == plugin._data.__text;
                TelemetryService.assess(instance._id, "TESTCASE", "MEDIUM").start().end(pass);
            });
        }
    },
    _getHeaderHeight: function(h) {
        return h / 10;
    }
});

PluginManager.registerPlugin("testcase", TestcasePlugin);

var TextPlugin = Plugin.extend({
    _type: "text",
    _isContainer: !1,
    _render: !0,
    initPlugin: function(data) {
        var fontsize = data.fontsize || 20, dims = this.relativeDims(), lineHeight = data.lineHeight ? data.lineHeight : 0, outline = data.outline ? data.outline : 0;
        if (_.isFinite(fontsize) && data.w) {
            var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100), cw = this._parent.dimensions().w, width = parseFloat(cw * data.w / 100), scale = parseFloat(width / exp);
            fontsize = parseFloat(fontsize * scale), fontsize += "px";
        }
        var font = fontsize + " " + data.font;
        data.weight && (font = data.weight + " " + font);
        var textStr = "";
        data.$t || data.__text ? textStr = data.$t || data.__text : data.model ? textStr = this._stage.getModelValue(data.model) || "" : data.param && (textStr = this.getParam(data.param.trim()) || "");
        var text = new createjs.Text(textStr, font, data.color || "#000000");
        text.lineWidth = dims.w, text.x = dims.x, text.y = dims.y, text.lineHeight = lineHeight * text.getMeasuredLineHeight(), 
        text.outline = outline;
        var align = data.align ? data.align.toLowerCase() : "left", valign = data.valign ? data.valign.toLowerCase() : "top";
        "left" == align ? text.x = dims.x : "right" == align ? text.regX = -dims.w : "center" == align && (text.x = dims.x, 
        text.regX = -dims.w / 2), "top" == valign ? (text.y = dims.y, text.textBaseline = "hanging") : "bottom" == valign ? (text.y = dims.y + dims.h - text.getMeasuredHeight(), 
        text.textBaseline = "hanging") : "middle" == valign && (text.y = dims.y + dims.h / 2 - text.getMeasuredHeight() / 2, 
        data.textBaseline ? text.textBaseline = "top" : text.textBaseline = "hanging"), 
        data.textBaseline && (text.textBaseline = data.textBaseline), text.textAlign = align, 
        text.valign = valign, this._self = text;
    },
    refresh: function() {
        var instance = this, textStr = "";
        instance._data.$t || instance._data.__text ? textStr = instance._data.$t || instance._data.__text : instance._data.model ? textStr = this._stage.getModelValue(instance._data.model) || "" : instance._data.param && (textStr = this.getParam(instance._data.param.trim()) || ""), 
        textStr && "" != textStr && (this._self.text = textStr, Renderer.update = !0);
    }
});

PluginManager.registerPlugin("text", TextPlugin);

var ThemePlugin = Plugin.extend({
    _type: "theme",
    _render: !1,
    update: !1,
    baseDir: "",
    loader: void 0,
    _director: !1,
    _currentScene: void 0,
    _currentStage: void 0,
    _previousStage: void 0,
    _canvasId: void 0,
    inputs: [],
    htmlElements: [],
    _animationEffect: {
        effect: "moveOut"
    },
    _themeData: void 0,
    _controllerMap: {},
    _isContainer: !1,
    _templateMap: {},
    _contentParams: {},
    _isSceneChanging: !1,
    _saveState: !0,
    _basePath: void 0,
    initPlugin: function(data) {
        this.addLoaderElement(), this._controllerMap = {}, this._canvasId = data.canvasId, 
        this._self = new createjs.Stage(data.canvasId), this._director = new creatine.Director(this._self), 
        this._dimensions = {
            x: 0,
            y: 0,
            w: this._self.canvas.width,
            h: this._self.canvas.height
        }, createjs.Touch.enable(this._self), this._self.enableMouseOver(10), this._self.mouseMoveOutside = !0, 
        this._contentParams = {}, _.isUndefined(data.saveState) || (this._saveState = data.saveState);
    },
    mousePoint: function() {
        return {
            x: this._self.mouseX,
            y: this._self.mouseY
        };
    },
    updateCanvas: function(w, h) {
        this._self.canvas.width = w, this._self.canvas.height = h, this._dimensions = {
            x: 0,
            y: 0,
            w: this._self.canvas.width,
            h: this._self.canvas.height
        };
    },
    start: function(basePath) {
        try {
            var instance = this;
            if (instance._basePath = basePath, RecorderManager.init(), _.isArray(this._data.stage)) var startStage = _.find(this._data.stage, function(stage) {
                return stage.id == instance._data.startStage;
            }); else if (this._data.stage.id == instance._data.startStage) var startStage = this._data.stage.id;
            if (_.isUndefined(startStage)) {
                var firstStage = _.find(this._data.stage, function(stage) {
                    if (stage.param && _.isUndefined(firstStage)) return stage;
                });
                _.isUndefined(firstStage) ? checkStage("showAlert") : (_.isUndefined(this._data.startStage) ? console.warn("No start stage is defined, loading first stage") : console.warn("Startstage is not available, loading first stage"), 
                this._data.startStage = firstStage.id);
            }
            AssetManager.init(this._data, basePath), AssetManager.initStage(this._data.startStage, null, null, function() {
                instance.render();
            });
        } catch (e) {
            showToaster("error", "Content fails to start"), EkstepRendererAPI.logErrorEvent(e, {
                severity: "fatal",
                type: "content",
                action: "play"
            }), console.warn("Theme start is failed due to", e);
        }
    },
    render: function() {
        var instance = this;
        ControllerManager.reset(), OverlayManager.reset(), this._data.controller && (_.isArray(this._data.controller) ? this._data.controller.forEach(function(p) {
            instance.addController(p);
        }) : instance.addController(this._data.controller)), this._data.template && (_.isArray(this._data.template) ? this._data.template.forEach(function(t) {
            instance._templateMap[t.id] = t;
        }) : instance._templateMap[this._data.template.id] = this._data.template), _.isArray(this._data.stage) || (this._data.stage = [ this._data.stage ]), 
        this._data.stage && (this._data.stage.forEach(function(s) {
            instance.initStageControllers(s);
        }), this.invokeStage(this._data.startStage)), this.update(), jQuery("#progressBar").width(100), 
        jQuery("#loading").hide(), jQuery("#overlay").show();
    },
    addController: function(p) {
        var controller = ControllerManager.get(p, this.baseDir);
        controller && (this._controllerMap[p.name] = controller);
    },
    initStageControllers: function(stage) {
        stage.controller && (_.isArray(stage.controller) ? stage.controller.forEach(function(p) {
            ControllerManager.get(p, this.baseDir);
        }) : ControllerManager.get(stage.controller, this.baseDir));
    },
    reRender: function() {
        var controller;
        for (k in this._controllerMap) controller = this._controllerMap[k], controller.reset();
        this._contentParams = {}, this._self.clear(), this._self.removeAllChildren(), this.render();
    },
    update: function() {
        this._self.update();
    },
    tick: function() {
        this._self.tick();
    },
    restart: function() {
        var gameId = TelemetryService.getGameId(), version = TelemetryService.getGameVer(), instance = this;
        TelemetryService.end(), AssetManager.initStage(this._data.startStage, null, null, function() {
            gameId && version && TelemetryService.start(gameId, version), instance.render();
        });
    },
    getAsset: function(aid) {
        return AssetManager.getAsset(this._currentStage, aid);
    },
    getMedia: function(aid) {
        return _.find(this._data.manifest.media, function(item) {
            return item.id == aid;
        });
    },
    addChild: function(child, childPlugin) {
        var instance = this;
        child.on("sceneenter", function() {
            instance.enableInputs(), instance._isSceneChanging = !1, instance.preloadStages(), 
            childPlugin.uncache(), _.isUndefined(Renderer.theme._previousStage) || Renderer.theme._previousStage == Renderer.theme._currentStage || TelemetryService.navigate(Renderer.theme._previousStage, Renderer.theme._currentStage), 
            OverlayManager.init(), Renderer.update = !0;
        });
        var nextIdx = this._currIndex++;
        this._currentScene ? (this._currentScene.dispatchEvent("exit"), this._currentScene = childPlugin, 
        this._director.replace(child, this.getTransitionEffect(this._animationEffect))) : (this._currentScene = childPlugin, 
        this._director.replace(child)), childPlugin.setIndex(nextIdx);
    },
    replaceStage: function(stageId, effect) {
        AudioManager.stopAll(), RecorderManager.stopRecording(), this.disableInputs(), this.inputs = [], 
        this.removeHtmlElements(), this.htmlElements = [], this._animationEffect = effect, 
        TimerManager.destroy(), _.isUndefined(this._currentScene) || EventBus.removeEventListener(this._currentScene._id + "_assetsLoaded", this._currentScene.invokeRenderElements, this), 
        stageId ? this.invokeStage(stageId) : OverlayManager.moveToEndPage();
    },
    invokeStage: function(stageId) {
        var stage = _.clone(_.findWhere(this._data.stage, {
            id: stageId
        }));
        stage && stage.extends && (baseStage = _.findWhere(this._data.stage, {
            id: stage.extends
        }), stage = this.mergeStages(stage, baseStage)), this._previousStage = this._currentStage, 
        this._currentStage = stageId, PluginManager.invoke("stage", stage, this, null, this);
    },
    preloadStages: function() {
        var stagesToLoad = this.getStagesToPreLoad(this._currentScene._data), instance = this;
        AssetManager.initStage(stagesToLoad.stage, stagesToLoad.next, stagesToLoad.prev, function() {
            instance._currentScene.dispatchEvent("enter");
        });
    },
    mergeStages: function(stage1, stage2) {
        for (k in stage2) if ("id" !== k) {
            var attr = stage2[k];
            stage1[k] ? (_.isArray(stage1[k]) || (stage1[k] = [ stage1[k] ]), _.isArray(attr) ? stage1[k].push.apply(stage1[k], attr) : stage1[k].push(attr)) : stage1[k] = attr;
        }
        return stage1;
    },
    isStageChanging: function() {
        return this._isSceneChanging;
    },
    transitionTo: function(action) {
        if (!this._isSceneChanging) {
            var stage = this._currentScene;
            this.setParam(stage.getStagestateKey(), stage._currentState), RecorderManager.stopRecording(), 
            AudioManager.stopAll(), TimerManager.stopAll(this._currentStage), action.transitionType || (action.transitionType = action.param), 
            "previous" === action.transitionType ? (this._isSceneChanging = !0, stage._stageController && stage._stageController.hasPrevious() ? (stage._stageController.decrIndex(2), 
            this.replaceStage(stage._data.id, action)) : (stage._stageController && (stage._stageController.setIndex(-1), 
            1 == action.reset && stage._stageController.reset()), this.replaceStage(action.value, action))) : "skip" === action.transitionType ? (stage._stageController && 1 == action.reset && stage._stageController.reset(), 
            this.replaceStage(action.value, action)) : (this._isSceneChanging = !0, stage._stageController && stage._stageController.hasNext() ? this.replaceStage(stage._data.id, action) : (stage._stageController && 1 == action.reset && stage._stageController.reset(), 
            this.replaceStage(action.value, action)));
        }
    },
    removeHtmlElements: function() {
        var gameAreaEle = jQuery("#" + Renderer.divIds.gameArea), chilElemtns = gameAreaEle.children();
        jQuery(chilElemtns).each(function() {
            "overlay" !== this.id && "gameCanvas" !== this.id && jQuery(this).remove();
        });
    },
    disableInputs: function() {
        this.inputs.forEach(function(inputId) {
            var element = document.getElementById(inputId);
            _.isNull(element) || (element.style.display = "none");
        });
    },
    enableInputs: function() {
        this.inputs.forEach(function(inputId) {
            var element = document.getElementById(inputId);
            _.isNull(element) || (element.style.display = "block");
        });
    },
    getTransitionEffect: function(animation) {
        var d = this.getDirection(animation.direction), e = this.getEase(animation.ease), t = animation.duration;
        animation.effect = animation.effect || "scroll";
        var effect;
        switch (animation.effect.toUpperCase()) {
          case "SCALEIN":
            effect = new creatine.transitions.ScaleIn(e, t);
            break;

          case "SCALEOUT":
            effect = new creatine.transitions.ScaleOut(e, t);
            break;

          case "SCALEINOUT":
            effect = new creatine.transitions.ScaleInOut(e, t);
            break;

          case "MOVEIN":
            effect = new creatine.transitions.MoveIn(d, e, t);
            break;

          case "SCROLL":
            effect = new creatine.transitions.Scroll(d, e, t);
            break;

          case "FADEIN":
            effect = new creatine.transitions.FadeIn(e, t);
            break;

          case "FADEOUT":
            effect = new creatine.transitions.FadeOut(e, t);
            break;

          case "FADEINOUT":
            effect = new creatine.transitions.FadeInOut(e, t);
            break;

          default:
            effect = new creatine.transitions.MoveOut(d, e, t);
        }
        return effect;
    },
    getDirection: function(d) {
        return void 0 === d ? d : eval("creatine." + d.toUpperCase());
    },
    getEase: function(e) {
        return void 0 === e ? e : eval("createjs.Ease." + e);
    },
    getStagesToPreLoad: function(stageData) {
        var params = stageData.param;
        params || (params = []), _.isArray(params) || (params = [ params ]);
        var next = _.findWhere(params, {
            name: "next"
        }), prev = _.findWhere(params, {
            name: "previous"
        }), nextStageId = void 0, prevStageId = void 0;
        return next && (nextStageId = next.value), prev && (prevStageId = prev.value), {
            stage: stageData.id,
            next: nextStageId,
            prev: prevStageId
        };
    },
    cleanUp: function() {
        createjs.Touch.disable(this._self);
    },
    pause: function() {
        this._currentStage && AssetManager.stopStageAudio(this._currentStage), TelemetryService.interrupt("BACKGROUND", this._currentStage);
    },
    resume: function() {
        TelemetryService.interrupt("RESUME", this._currentStage);
    },
    setParam: function(param, value, incr, max) {
        var instance = this, fval = instance._contentParams[param];
        incr ? (void 0 === fval && (fval = 0), fval += incr) : fval = value, 0 > fval && (fval = 0), 
        void 0 !== max && fval >= max && (fval = 0), instance._contentParams[param] = fval;
    },
    getParam: function(param) {
        var instance = this, params;
        if (instance._saveState) return instance._contentParams[param];
        var params = instance._contentParams, expr = "params." + param;
        return eval(expr);
    },
    addLoaderElement: function() {
        var gameArea = document.getElementById(Renderer.divIds.gameArea), loaderArea = document.createElement("div");
        loaderArea.id = "loaderArea", loaderArea.innerHTML = '<div class="preloader-wrapper"><div class="spinner-layer"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>', 
        gameArea.parentElement.appendChild(loaderArea);
    },
    getStageDataById: function(stageId) {
        var stageData = void 0;
        return this._data.stage.forEach(function(element, index) {
            element.id === stageId && (stageData = element);
        }), stageData;
    }
});

PluginManager.registerPlugin("theme", ThemePlugin);

var TweenPlugin = AnimationPlugin.extend({
    _animateFn: void 0,
    initPlugin: function(data, plugin) {
        var to = data.to, loop = data.loop;
        _.isArray(to) || (to = [ to ]);
        var loopStr = "";
        loop && (loopStr = ", loop:true");
        var fn = "(function() {return function(plugin, cb){";
        fn += "createjs.Tween.get(plugin, {override:true " + loopStr + "})", to.forEach(function(to) {
            var data = _.isString(to.__cdata) ? JSON.parse(to.__cdata) : to.__cdata, relDims = plugin.getRelativeDims(data);
            data.x = relDims.x, data.y = relDims.y, data.width = relDims.w, data.height = relDims.h, 
            data.scaleX = plugin._self.scaleX * data.scaleX, data.scaleY = plugin._self.scaleY * data.scaleY, 
            fn += ".to(" + JSON.stringify(data) + "," + to.duration + ", createjs.Ease." + to.ease + ")";
        }), fn += '.call(function() {cb({status: "success"})})', fn += '.addEventListener("change", function(event) {Renderer.update = true;', 
        data.widthChangeEvent && (fn += "AnimationManager.widthHandler(event, plugin);"), 
        fn += "})}})()", this._animateFn = fn;
    },
    animate: function(plugin, cb) {
        cb || (cb = function(resp) {
            console.info("Tween execution completed.");
        });
        var fn = this._animateFn.replace("COMPLETE_CALLBACK", cb.toString()), animationFn = eval(fn);
        animationFn.apply(null, [ plugin._self, cb ]);
    }
});

AnimationManager.registerPlugin("tween", TweenPlugin);

var VideoPlugin = Plugin.extend({
    _type: "video",
    _render: !0,
    _data: void 0,
    _instance: void 0,
    _defaultStart: 50,
    initPlugin: function(data) {
        this._data = data, this._data && (_.isUndefined(this._data.autoplay) && (this._data.autoplay = !0), 
        _.isUndefined(this._data.controls) && (this._data.controls = !1), _.isUndefined(this._data.muted) && (this._data.muted = !1)), 
        this.loadVideo(data), _instance = this;
    },
    loadVideo: function(data) {
        if (!data.asset) return !1;
        var lItem = this.createVideoElement();
        this.getVideo(data).load(), this.registerEvents(), this._self = new createjs.Bitmap(lItem), 
        1 == data.autoplay && this.play();
    },
    registerEvents: function() {
        var videoEle = this.getVideo(this._data);
        jQuery(videoEle).bind("play", this.handleTelemetryLog), jQuery(videoEle).bind("pause", this.handleTelemetryLog), 
        jQuery(videoEle).bind("error", this.logConsole), jQuery(videoEle).bind("abort", this.logConsole), 
        jQuery(videoEle).bind("loadeddata", this.onLoadData);
    },
    handleTelemetryLog: function(event) {
        var action = {}, videoEle = event.target;
        action.asset = videoEle.id, action.stageId = Renderer.theme._currentStage, "pause" === event.type && (event.type = videoEle.currentTime > 0 ? "pause" : "stop", 
        videoEle.ended || _instance.sendTelemeteryData(action, event.type)), "play" === event.type && (videoEle.autoplay || _instance.sendTelemeteryData(action, event.type), 
        videoEle.autoplay = void 0);
    },
    onLoadData: function() {
        1 == _instance.autoplay && _instance.play();
    },
    logConsole: function(e) {
        console.warn("This video has", e.type);
    },
    sendTelemeteryData: function(action, subType) {
        action && EventManager.processAppTelemetry(action, "OTHER", this._instance, {
            subtype: subType.toUpperCase()
        });
    },
    play: function(action) {
        var videoEle = this.getVideo(action);
        videoEle.paused && videoEle.readyState > 2 ? this.start(videoEle) : console.warn("Video is not ready to play", videoEle.readyState);
    },
    pause: function(action) {
        var videoEle = this.getVideo(action);
        _.isUndefined(videoEle) ? console.info("video pause failed") : videoEle.pause();
    },
    stop: function(action) {
        var videoEle = this.getVideo(action);
        videoEle.pause(), videoEle.currentTime = 0;
    },
    replay: function() {
        this.getVideo(this._data).currentTime = 0, this.play();
    },
    start: function(videoEle) {
        var delay = _.isUndefined(this._data.delay) ? this._defaultStart : this._data.delay;
        this._data.delay = this._defaultStart, setTimeout(function() {
            videoEle.play();
        }, delay);
    },
    getVideo: function(action) {
        return _.isUndefined(action) ? (console.info("Video started without any ECML action"), 
        document.getElementById(this._data.asset)) : document.getElementById(action.asset);
    },
    setVideoStyle: function(jqVideoEle) {
        var dims = this.relativeDims();
        jQuery(jqVideoEle).attr("id", this._data.asset).prop({
            autoplay: this._data.autoplay,
            muted: this._data.muted,
            controls: this._data.controls,
            width: dims.w,
            height: dims.h
        }).css({
            position: "absolute",
            left: dims.x + "px",
            top: dims.y + "px",
            display: "block"
        });
    },
    addVideoElement: function(jqVideoEle) {
        this._theme.htmlElements.push(jQuery(jqVideoEle).attr("id"));
        var videoEle = this.getVideo(this._data), div = document.getElementById("gameArea");
        div.insertBefore(videoEle, div.childNodes[0]);
    },
    createVideoElement: function() {
        var videoAsset;
        if ((videoAsset = this._theme.getAsset(this._data.asset)) instanceof HTMLElement == 0) {
            var src = videoAsset;
            videoAsset = document.createElement("video"), videoAsset.src = src;
        }
        var jqVideoEle = jQuery(videoAsset).insertBefore("#gameArea");
        _.isUndefined(this._data.type) ? console.warn("Video type is not defined") : jQuery(jqVideoEle).attr("type", this._data.type), 
        this.setVideoStyle(jqVideoEle), this.addVideoElement(jqVideoEle);
        var videoEle = this.getVideo(this._data);
        return new createjs.Bitmap(videoEle);
    }
});

PluginManager.registerPlugin("video", VideoPlugin);
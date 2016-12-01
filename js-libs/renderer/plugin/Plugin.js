var Plugin = Class.extend({
	_isContainer: false,
    _defaultFont: undefined,
	_render: true,
	_theme: undefined,
	_parent: undefined,
	_stage: undefined,
	_data: undefined,
	_currIndex: 0,
	_index: 0,
	_self: undefined,
	_dimensions: undefined,
	_id: undefined,
    _childIds: [],
    _enableEvents: true,
	events: [],
	appEvents: [],
	_myflag:false,
    _pluginParams: {},
	init: function(data, parent, stage, theme) {
		this.events = [];
		this.appEvents = [];
        this._childIds = [];
        this._pluginParams = {};
		this._theme = theme;
		this._stage = stage;
		this._parent = parent;
	    this._data = data;
		this.initPlugin(data);
		var dims = this.relativeDims();
		if (dims && this._self) {
			this._self.origX = dims.x;
        	this._self.origY = dims.y;
        	this._self.width = dims.w;
        	this._self.height = dims.h;
		}
        if (data.enableDrag) {
            this.enableDrag(this._self, data.snapTo);
        }
        var instance = this;
		if(data.appEvents) {
			this.appEvents.push.apply(this.appEvents, data.appEvents.list.split(/[\s,]+/));
		}

        // Allow child classes to disable event registration (e.g. when they use event as a template)
        if (this._enableEvents) {
            EventManager.registerEvents(this, this._data);
        }

        this._id = this._data.id || this._data.asset || _.uniqueId('plugin');
		PluginManager.registerPluginObject(this);
		if (this._self && data.visible === false) {
	    	this._self.visible = false;
		}

		// Conditional evaluation for rendering
		if (data['ev-if']) {
			var expr = data['ev-if'].trim();
            var modelExpr = expr = this.replaceExpressions(expr);
            if (!(expr.substring(0,2) == "${")) expr = "${" + expr;
            if (!(expr.substring(expr.length-1, expr.length) == "}")) expr = expr + "}";
            var exprVal = this.evaluateExpr(expr);
            if (typeof exprVal == "undefined" && this._stage) {
                exprVal = this._stage.getModelValue(modelExpr);
            }
			if (typeof exprVal != "undefined") {
				if (this._self) {
					this._self.visible = (this._self.visible && exprVal);
				}
			}
		}

		// Draw border and shadow only if the object is visible
		if ((this._self) && (this._self.visible)) {
			// Draw border if needed
			this.drawBorder(data, dims);

			// Draw shadow if needed
			if (data.shadow) {
	            this.addShadow();
	        }
	    }

		// Render the plugin component
		if(this._render) {
			if(this._isContainer && this._type == 'stage') {
				this.cache();
			}
			this.render();
		}
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
	setDimensions: function(){
		var dims = this.relativeDims();
		this._self.x = dims.x ? dims.x : 0;
		this._self.y = dims.y ? dims.y : 0;
		this._self.width = dims.w ? dims.w : 1;	//default width = 1
		this._self.height = dims.h ? dims.h : 1; //default height = 1
	},
	addChild: function(child, childPlugin) {
		var nextIdx = this._currIndex++;
		this._self.addChildAt(child, nextIdx);
		if (childPlugin) {
			childPlugin.setIndex(nextIdx);
            if (childPlugin._id) {
                this._childIds.push(childPlugin._id);
            }
		}
	},
	removeChildAt: function(idx) {
		this._self.removeChildAt(idx);
	},
	removeChild: function(child) {
		this._self.removeChild(child);
	},
	render: function() {
        if (this._self) {
            this._parent.addChild(this._self, this);
        } else {
            console.warn("Skipped rendering the plugin object: ", this._id);
        }
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
	            x: parseFloat(parentDims.w * (this._data.x || 0)/100),
	            y: parseFloat(parentDims.h * (this._data.y || 0)/100),
	            w: parseFloat(parentDims.w * (this._data.w || 0)/100),
	            h: parseFloat(parentDims.h * (this._data.h || 0)/100),
                stretch: ((typeof(this._data.stretch) != "undefined") ? this._data.stretch : true)
	        }
		}
        return this._dimensions;
	},
	getRelativeDims: function(data) {
		var parentDims = this._parent.dimensions();
		var relDimensions = {
            x: parseFloat(parentDims.w * (data.x || 0)/100),
            y: parseFloat(parentDims.h * (data.y || 0)/100),
            w: parseFloat(parentDims.w * (data.w || 0)/100),
            h: parseFloat(parentDims.h * (data.h || 0)/100),
            stretch: ((typeof(data.stretch) != "undefined") ? data.stretch : true)
        }
        return relDimensions;
	},
	setScale: function() {
		var sb = this._self.getBounds();
        var dims = this.relativeDims();
        var parentDims = this._parent.dimensions();

        // To maintain aspect ratio when both h and w are specified
        if (!dims.stretch) {
            if ((dims.h != 0) && (dims.w != 0)) {
                // If h > w, then constrain on w (equivalent to setting h = 0) and vice versa
                if (sb.height > sb.width)  dims.h = 0;
                else dims.w = 0;
            }
        }

        // Compute constrained dimensions (e.g. if w is specified but not height)
        if(dims.h == 0) {
            dims.h = dims.w * sb.height / sb.width;
            if (parentDims.h < dims.h) {
                dims.h = parentDims.h;
                dims.w = dims.h * sb.width / sb.height;
            }
        }
        if(dims.w == 0) {
            dims.w = dims.h * sb.width / sb.height;
            if (parentDims.w < dims.w) {
                dims.w = parentDims.w;
                dims.h = dims.w * sb.height / sb.width;
            }
        }

        // Remember the computed dimensions
        this._dimensions.h = dims.h;
        this._dimensions.w = dims.w;

        // Scale the object based on above computations
        if (this._self ) {
            this._self.scaleY = dims.h / sb.height;
            this._self.scaleX = dims.w / sb.width;
        }
	},
	initPlugin: function(data) {
		PluginManager.addError('Subclasses of plugin should implement this function');
		throw "Subclasses of plugin should implement this function";
	},
	play: function() {
		PluginManager.addError('Subclasses of plugin should implement play()');
	},
	pause: function() {
		PluginManager.addError('Subclasses of plugin should implement pause()');
	},
	stop: function() {
		PluginManager.addError('Subclasses of plugin should implement stop()');
	},
	togglePlay: function() {
		PluginManager.addError('Subclasses of plugin should implement togglePlay()');
	},
    refresh: function() {
        PluginManager.addError('Subclasses of plugin should implement refresh()');
    },
	show: function(action) {
		if(_.contains(this.events, 'show')) {
			EventManager.dispatchEvent(this._data.id, 'show');
		} else if(!this._self.visible) {
			this._self.visible = true;
			EventManager.processAppTelemetry(action, 'SHOW', this);
		}
		Renderer.update = true;
	},
	hide: function(action) {
		if(_.contains(this.events, 'hide')) {
			EventManager.dispatchEvent(this._data.id, 'hide');
		} else if(this._self && this._self.visible) {
			this._self.visible = false;
			EventManager.processAppTelemetry(action, 'HIDE', this);
		}
		Renderer.update = true;
	},
	toggleShow: function(action) {
		if(_.contains(this.events, 'toggleShow')) {
			EventManager.dispatchEvent(this._data.id, 'toggleShow');
		} else {
			this._self.visible = !this._self.visible;
			EventManager.processAppTelemetry(action, this._self.visible ? 'SHOW': 'HIDE', this);
		}
		Renderer.update = true;
	},
	toggleShadow: function(action) {
		var isVisible = false;

        if (this.hasShadow()) {
            this.removeShadow();
            isVisible = false;
        } else {
            this.addShadow();
            isVisible = true;
        }
        Renderer.update = true;
        return isVisible;
    },
    addShadow: function() {
    	var shadowObj = this._self.shadow;

    	// If the shadow is a plugin, set the visibility to true
        if ((shadowObj) && (shadowObj._self) && ('visible' in shadowObj._self)) {
            shadowObj._self.visible = true;
        }
        else {
        	// Not a plugin, render a normal shadow
            var shadowColor = this._data.shadowColor || '#cccccc';
            shadowColor = this._data.shadow || shadowColor;
            var offsetX = this._data.offsetX || 0;
            var offsetY = this._data.offsetY || 0;
            var blur = this._data.blur || 5;
            this._self.shadow = new createjs.Shadow(shadowColor, offsetX, offsetY, blur);
        }
    },
    removeShadow: function() {
    	var shadowObj = this._self.shadow;

    	// If the shadow is a plugin, set the visibility to false
        if ((shadowObj) && (shadowObj._self) && ('visible' in shadowObj._self)) {
            shadowObj._self.visible = false;
        }
        else {
        	// Not a plugin (normal shadow), unset the object
            this._self.shadow = undefined;
        }
    },
    hasShadow: function() {
    	var visibleShadow = false;
    	var shadowObj = this._self.shadow;

    	// If the shadow is a plugin, then check the visible property
    	if ((shadowObj) && (shadowObj._self) && ('visible' in shadowObj._self)) {
    		visibleShadow = shadowObj._self.visible;
    	}
    	else {
    		// It is not a plugin, check if the shadow object is created
    		if (this._self.shadow) {
    			visibleShadow = true;
    		}
    	}

    	return visibleShadow;
    },
    drawBorder: function(data, dims) {
    	if (data.stroke) {
			var strokeWidth = (data['stroke-width'] || 1);
			var border = new createjs.Shape();
			var graphics = border.graphics;
			graphics.beginStroke(data.stroke);
			graphics.setStrokeStyle(strokeWidth);
			graphics.dr(dims.x, dims.y, dims.w, dims.h);
			this._stage.addChild(border);
		}
    },
    enableDrag: function(asset, snapTo) {
        asset.cursor = "pointer";
        asset.on("mousedown", function(evt) {
            this.parent.addChild(this);
            this.offset = {
                x: this.x - evt.stageX,
                y: this.y - evt.stageY
            };
        });
        asset.on("pressmove", function(evt) {
            this.x = evt.stageX + this.offset.x;
            this.y = evt.stageY + this.offset.y;
            Renderer.update = true;
        });
        if (snapTo) {
            asset.on("pressup", function(evt) {
                var plugin = PluginManager.getPluginObject(snapTo);
                var dims = plugin._dimensions;
                var xFactor = parseFloat(this.width * (50/100));
                var yFactor = parseFloat(this.height * (50/100));
                var x = dims.x - xFactor,
                    y = dims.y - yFactor,
                    maxX = dims.x + dims.w + xFactor,
                    maxY = dims.y + dims.h + yFactor;
                var snapSuccess = false;
                if (this.x >= x && (this.x + this.width) <= maxX) {
                    if (this.y >= y && (this.y + this.height) <= maxY) {
                        snapSuccess = true;
                    }
                }
                if (!snapSuccess) {
                    this.x = this.origX;
                    this.y = this.origY;
                } else {
                    if (plugin._data.snapX) {
                        this.x = dims.x + (dims.w * plugin._data.snapX / 100);
                    }
                    if (plugin._data.snapY) {
                        this.y = dims.y + (dims.h * plugin._data.snapY / 100);
                    }
                }
                Renderer.update = true;
            });
        }
    },
    evaluateExpr: function(expr) {
        if (!expr) return "";
        var app = GlobalContext._params;
        var stage = {};
        if (this._stage) {
            stage = this._stage.params;
        } else if (this._type == 'stage') {
            stage = this.params;
        }
        var content = {};
        if (this._theme) {
            content = this._theme._contentParams;
        }
        var value = undefined;
        try {
            expr = expr.trim();
            if((expr.substring(0,2) == "${") && (expr.substring(expr.length-1, expr.length) == "}")) {
                expr = expr.substring(2,expr.length);
                expr = expr.substring(0,expr.length-1);
                value = eval(expr);
            } else {
                value = eval(expr);
            }
        } catch (err) {
            console.warn('expr: '+ expr + ' evaluation faild:', err.message);
        }
        return value;
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
    getParam: function(param) {
        var value;
        var tokens = param.split('.');
        if (tokens.length >= 2) {
            var scope = tokens[0];
            var idx = param.indexOf('.');
            var paramName = param.substring(idx+1);
            if (scope && scope.toLowerCase() == 'app') {
                value = GlobalContext.getParam(paramName);
            } else if (scope && scope.toLowerCase() == 'stage') {
                value = this._stage.getParam(paramName);
            } else {
                value = this._theme.getParam(paramName);
            }
        } else if (this._stage) {
            value = this._stage.getParam(param);
        }
        return value;
    },
    getDefaultFont: function() {
        this._defaultFont = 'NotoSansGujarati, NotoSansOriya, NotoSansMalayalam';
        return this._defaultFont;
    },
	transitionTo: function() {
		PluginManager.addError('Subclasses of plugin should implement transitionTo()');
	},
	evaluate: function() {
		PluginManager.addError('Subclasses of plugin should implement evaluate()');
	},
	reload: function() {
		PluginManager.addError('Subclasses of plugin should implement reload()');
	},
	restart: function() {
		PluginManager.addError('Subclasses of plugin should implement reload()');
	},
    blur: function(action) {
        var instance = this;
        var obj = instance._self;
        var blurFilter = new createjs.BlurFilter(25, 25, 1);
        obj.filters = [blurFilter];
        var bounds = instance.relativeDims();
        obj.cache(bounds.x,bounds.y, bounds.w, bounds.h);
        Renderer.update = true;
    },
    unblur: function(action) {
        var instance = this;
        instance._self.filters = [];
        instance._self.uncache();
        Renderer.update = true;
    },
	invokeChildren: function(data, parent, stage, theme) {
		var children = [];
        for (k in data) {
            if (PluginManager.isPlugin(k)) {
                if(_.isArray(data[k])) {
                    _.each(data[k], function(item) {
                        item.pluginType = k;
                        if(!item['z-index']) item['z-index'] = -1;
                        children.push(item);
                    });
                } else {
                    data[k].pluginType = k;
                    if(!data[k]['z-index']) data[k]['z-index'] = -1;
                    children.push(data[k]);
                }
            }
        }
        children = _.sortBy(children, 'z-index');
        for(k in children) {
            var item = children[k];
            PluginManager.invoke(item.pluginType, item, parent, stage, theme);
        }
	},
    getPluginParam: function(param) {
        var instance = this;
        var params = instance._pluginParams;
        var expr = 'params.' + param;
        return eval(expr);
    },
    setPluginParam: function(param, value, incr, max) {
        var instance = this;
        var fval = instance._pluginParams[param];
        if (incr) {
            if (!fval)
                fval = 0;
            fval = (fval + incr);
        } else {
            fval = value;
        }
        if (0 > fval) fval = 0;
        if ("undefined" != typeof max && fval >= max) fval = 0;
        instance._pluginParams[param] = fval;
    },
    setPluginParamValue: function(action) {
        var scope = action.scope;
        var param = action.param;
        var paramExpr = action['ev-value'];
        var paramModel = action['ev-model'];
        var val;
        if (paramExpr) {
            val = this.getPluginParam(paramExpr);
        } else if (paramModel) {
            if (this._stage) {
                var model = this.replaceExpressions(paramModel);
                val = this._stage.getModelValue(model);
            }
        } else {
            val = action['param-value'];
        }
        var incr = action['param-incr'];
        if (scope && scope.toLowerCase() == 'app') {
            GlobalContext.setParam(param, val, incr);
        } else if (scope && scope.toLowerCase() == 'stage') {
            this._stage.setParam(param, val, incr);
        } else if (scope && scope.toLowerCase() == 'content') {
            this._theme.setParam(param, val, incr);
        } else {
            this.setPluginParam(param, val, incr);
        }
    },
    getInnerECML: function(data) {
        var children = {};
        data = ("undefined" == typeof data) ? this._data : data;
        for (k in data) {
            if (PluginManager.isPlugin(k) && _.isObject(data[k]) && !_.isEmpty(data[k])) {
                children[k] = data[k];
            }
        }
        return children;
    },
    setState: function(param, value, isStateChanged) {
			if (!_.isUndefined(isStateChanged)) {
                this._stage.isStageStateChanged(isStateChanged);
            }
        this._stage.setParam(param.toLowerCase(), value);
    },
    getState: function(param) {
        if(!_.isUndefined(this._stage._currentState)){
             return this._stage._currentState[param];
        }

    }
   });

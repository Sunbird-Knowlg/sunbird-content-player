/***
 * The base plugin class that all renderer plugins inherit from. It provides the common support contract for all plugins.
 * Plugins can override specific methods to change the behavior. The most common scenario would be to override the
 * implementation of createJS callback methods to detect interactivity on the canvas.
 *
 * @class EkstepRenderer.Plugin
 * @author Vinu Kumar V.S <vinu.kumar@tarento.com>
 */
var Plugin = Class.extend({
	_isContainer: false,
	_defaultFont: undefined,
	_render: true,
	/**
     * @description A variable which holds _theme instance where this plugin is added.
     * @memberOf EkstepRenderer.Plugin
     */
	_theme: undefined,
	_parent: undefined,
	/**
     * A variable which holds _stage instance where this plugin is added. This is an instance of creatine scene object.
     * @memberOf EkstepRenderer.Plugin
     */
	_stage: undefined,
	/**
     * A variable which holds the data of plugin defined in ECML/JSON.
     * @memberOf EkstepRenderer.Plugin
     */
	_data: undefined,
	_currIndex: 0,
	_index: 0,
	/**
     * A variable _self is a createJS element. Actual instance of createJS element which will render on the stage.
     * @memberOf EkstepRenderer.Plugin
     */
	_self: undefined,
	_dimensions: undefined,
	/**
     * A variable _id is a unique+ idenfier of the plugin
     * @memberOf EkstepRenderer.Plugin
     */
	_id: undefined,
	_childIds: [],
	_enableEvents: true,
	events: [],
	appEvents: [],
	borderShape: undefined,
	_pluginParams: {},
	_manifest: {},
	_unSupportedFonts: ["notosans", "verdana", "notosans oriya"],
	/**
     * Initializes the plugin with the given data and parent object
     * @param data {object} Init parameters for the plugin
     * @param parent {object} Parent plugin instance where this plugin renders
     * @param stage {object} stage intance where this plugin has to renderer
     * @param theme {object} theme/canvas instance of the content
     * @memberof EkstepRenderer.Plugin
     * @instance
     */
	init: function (data, parent, stage, theme) {
		if (arguments.length === 1) {
			if (_.isUndefined(data)) {
				// To initialize chore & custom plugin global
				this.initialize(data)
				return
			} else {
				if (!data.canvasId) {
					// Only plugin manifest is getting(calling by plugin framework)
					this._manifest = data
					this.initialize(data)
					return
				}
			}
		}
		try {
			this.events = []
			this.appEvents = []
			this._childIds = []
			this._pluginParams = {}
			this._theme = theme
			this._stage = stage
			this._parent = parent
			this._data = data
			this.handleFont(data)
			this.initPlugin(data)
			var dims = this.relativeDims()
			if (dims && this._self) {
				this._self.origX = dims.x
				this._self.origY = dims.y
				this._self.width = dims.w
				this._self.height = dims.h
			}
			if (data.enableDrag) {
				this.enableDrag(this._self, data.snapTo)
			}
			var instance = this
			if (!_.isUndefined(data.appEvents)) {
				// In New AT the App events are comming as Array of objects
				if (_.isArray(data.appEvents)) {
					_.each(data.appEvents, function (value, key) {
						instance.appEvents.push.apply(instance.appEvents, data.appEvents[key].list.split(/[\s,]+/))
					})
				} else {
					this.appEvents.push.apply(this.appEvents, data.appEvents.list.split(/[\s,]+/))
				}
			}
			// Allow child classes to disable event registration (e.g. when they use event as a template)
			if (this._enableEvents) {
				EventManager.registerEvents(this, this._data)
			}
			this._id = this.id = this._data.id || this._data.asset || _.uniqueId("plugin")
			PluginManager.registerPluginObject(this)
			if (this._self && data.visible === false) {
				this._self.visible = false
			}

			// Conditional evaluation for rendering
			if (data["ev-if"]) {
				var expr = data["ev-if"].trim()
				var modelExpr = expr = this.replaceExpressions(expr)
				if (!(expr.substring(0, 2) === "${")) expr = "${" + expr
				if (!(expr.substring(expr.length - 1, expr.length) === "}")) expr = expr + "}"
				var exprVal = this.evaluateExpr(expr)
				if (typeof exprVal === "undefined" && this._stage) {
					exprVal = this._stage.getModelValue(modelExpr)
				}
				if (typeof exprVal !== "undefined") {
					if (this._self) {
						this._self.visible = (this._self.visible && exprVal)
					}
				}
			}

			if (this._self) {
				this._self.id = this.id
				this._self.type = this._type
				this._self["z-index"] = data["z-index"]
			}

			// Render the plugin component
			if (this._render) {
				if (this._isContainer && this._type === "stage") {
					this.cache()
				}
				this.render()
			}
			// Draw border and shadow only if the object is visible
			if ((this._self) && (this._self.visible)) {
				// Draw border if needed
				this.drawBorder(data, dims)

				// Draw shadow if needed
				if (data.shadow) {
					this.addShadow()
				}

				// this is to ratate the plugin with border
			}
			if (this._self) {
				this.rotation(data)
			}
		} catch (e) {
			var pluginName
			if (!_.isUndefined(data)) {
				pluginName = data.pluginType ? data.pluginType : "Custom"
			}
			EkstepRendererAPI.logErrorEvent(e, {"type": "plugin", "objectType": data.pluginType, "action": data.event ? (data.event.action ? data.event.action.command : data.event.type) : "transistion", "objectId": data.id || data._id})
			showToaster("error", pluginName + ":Plugin failed")
			console.warn("Plugin init is failed due to", e)
		}
	},
	handleFont: function (data) {
		if (data.font) {
			data.font = data.font.trim()
		}
		if (_.isEmpty(data.font) || (!_.isUndefined(data.font) && (_.includes(this._unSupportedFonts, data.font) || _.includes(this._unSupportedFonts, data.font.toLowerCase())))) {
			// This is fallback support for fonts & we are ignoring NotoSans, NotoSans Oriya, Verdana
			data.font = this.getDefaultFont()
		}
	},
	cache: function () {
		this._self.cache(this._dimensions.x, this._dimensions.y, this._dimensions.w, this._dimensions.h)
	},
	uncache: function () {
		this._self.uncache()
	},
	setIndex: function (idx) {
		this._index = idx
	},
	setDimensions: function () {
		var dims = this.relativeDims()
		this._self.x = dims.x ? dims.x : 0
		this._self.y = dims.y ? dims.y : 0
		this._self.width = dims.w ? dims.w : 1 // default width = 1
		this._self.height = dims.h ? dims.h : 1 // default height = 1
	},

	/**
     * Adds a child to this plugin intance. This can be useful for composite scenarios.
     * @param pluginId {string} plugin id inside which child had to be added
     * @param child {object} child element which has to be added inside plugin
     * @memberof EkstepRenderer.Plugin
     */
	addChild: function (child, childPlugin) {
		var nextIdx = this._currIndex++
		this._self.addChildAt(child, this._self.children.length)
		if (childPlugin) {
			childPlugin.setIndex(nextIdx)
			if (childPlugin._id) {
				this._childIds.push(childPlugin._id)
			}
		}
	},

	/**
     * Removes a child from this plugin by child index. Use this to dynamically manage composite children.
     * @param id {string} index of createjs element object
     * @memberof EkstepRenderer.Plugin
     */
	removeChildAt: function (idx) {
		this._self.removeChildAt(idx)
	},

	/**
     * Removes a child from this plugin by child instance. Use this to dynamically manage composite children.
     * @param child {object} createjs element to be removed
     * @memberof EkstepRenderer.Plugin
     */
	removeChild: function (child) {
		this._self.removeChild(child)
	},

	render: function () {
		if (this._self) {
			this._parent.addChild(this._self, this)
		} else {
			console.warn("Skipped rendering the plugin object: ", this._id)
		}
	},

	update: function () {
		this._theme.update()
	},

	/**
     * To get plugin dimensions specified in ECML/JSON
     * @memberof EkstepRenderer.Plugin
     */
	dimensions: function () {
		return this._dimensions
	},

	/**
     * To get plugin dimensions relative to Canvas/device width & height also with respect to it's parents
     * @memberof EkstepRenderer.Plugin
     */
	relativeDims: function () {
		if (this._parent) {
			var parentDims = this._parent.dimensions()
			this._dimensions = {
				x: parseFloat(parentDims.w * (this._data.x || 0) / 100),
				y: parseFloat(parentDims.h * (this._data.y || 0) / 100),
				w: parseFloat(parentDims.w * (this._data.w || 0) / 100),
				h: parseFloat(parentDims.h * (this._data.h || 0) / 100),
				stretch: ((typeof (this._data.stretch) !== "undefined") ? this._data.stretch : true)
			}
		}
		return this._dimensions
	},
	getRelativeDims: function (data) {
		var parentDims = this._parent.dimensions()
		var relDimensions = {
			x: parseFloat(parentDims.w * (data.x || 0) / 100),
			y: parseFloat(parentDims.h * (data.y || 0) / 100),
			w: parseFloat(parentDims.w * (data.w || 0) / 100),
			h: parseFloat(parentDims.h * (data.h || 0) / 100),
			stretch: ((typeof (data.stretch) !== "undefined") ? data.stretch : true)
		}
		return relDimensions
	},
	setScale: function () {
		var sb = this._self.getBounds()
		var dims = this.relativeDims()
		var parentDims = this._parent.dimensions()

		// To maintain aspect ratio when both h and w are specified
		if (!dims.stretch) {
			if ((dims.h !== 0) && (dims.w !== 0)) {
				// If h > w, then constrain on w (equivalent to setting h = 0) and vice versa
				if (sb.height > sb.width) dims.h = 0
				else dims.w = 0
			}
		}

		// Compute constrained dimensions (e.g. if w is specified but not height)
		if (dims.h === 0) {
			dims.h = dims.w * sb.height / sb.width
			if (parentDims.h < dims.h) {
				dims.h = parentDims.h
				dims.w = dims.h * sb.width / sb.height
			}
		}
		if (dims.w === 0) {
			dims.w = dims.h * sb.width / sb.height
			if (parentDims.w < dims.w) {
				dims.w = parentDims.w
				dims.h = dims.w * sb.height / sb.width
			}
		}

		// Remember the computed dimensions
		this._dimensions.h = dims.h
		this._dimensions.w = dims.w

		// Scale the object based on above computations
		if (this._self) {
			this._self.scaleY = dims.h / sb.height
			this._self.scaleX = dims.w / sb.width
		}
	},
	initialize: function (data) {
		// console.info("Base plugin intialization..");
	},
	/**
     * Initializes the plugin by reading from ECML.
     * @private
     * @memberof EkstepRenderer.Plugin
     */
	initPlugin: function (data) {
		PluginManager.addError("Subclasses of plugin should implement this function")
		// eslint-disable-next-line
		throw "Subclasses of plugin should implement this function"
	},
	play: function () {
		PluginManager.addError("Subclasses of plugin should implement play()")
	},
	pause: function () {
		PluginManager.addError("Subclasses of plugin should implement pause()")
	},
	stop: function () {
		PluginManager.addError("Subclasses of plugin should implement stop()")
	},
	togglePlay: function () {
		PluginManager.addError("Subclasses of plugin should implement togglePlay()")
	},
	refresh: function () {
		PluginManager.addError("Subclasses of plugin should implement refresh()")
	},

	/**
     * property of the plugin to show it's visiblity on stage
     * @param action {object} action command to show createjs element
     * @memberof EkstepRenderer.Plugin
     * @property show
     */
	show: function (action) {
		if (_.contains(this.events, "show")) {
			EventManager.dispatchEvent(this._data.id, "show")
		} else if (!this._self.visible) {
			this._self.visible = true
			EventManager.processAppTelemetry(action, "SHOW", this)
		}
		Renderer.update = true
	},

	/**
     * Property of the plugin to hide it's visiblity on stage
     * @param action {object} action command to hide createjs element
     * @memberof EkstepRenderer.Plugin
     * @property hide
     */
	hide: function (action) {
		if (_.contains(this.events, "hide")) {
			EventManager.dispatchEvent(this._data.id, "hide")
		} else if (this._self && this._self.visible) {
			this._self.visible = false
			EventManager.processAppTelemetry(action, "HIDE", this)
		}
		Renderer.update = true
	},

	/**
     * property of the plugin to toggle it's visiblity on stage
     * @param action {object} action command to toggle show/hide of createjs element
     * @memberof EkstepRenderer.Plugin
     * @property toggleShow
     */
	toggleShow: function (action) {
		if (_.contains(this.events, "toggleShow")) {
			EventManager.dispatchEvent(this._data.id, "toggleShow")
		} else {
			this._self.visible = !this._self.visible
			EventManager.processAppTelemetry(action, this._self.visible ? "SHOW" : "HIDE", this)
		}
		Renderer.update = true
	},

	/**
     * property of the plugin to toggle it's shadow
     * @param action {object} action command to toggle Shadow of createjs element(optional)
     * @memberof EkstepRenderer.Plugin
     * @property toggleShadow
     */
	toggleShadow: function (action) {
		var isVisible = false

		if (this.hasShadow()) {
			this.removeShadow()
			isVisible = false
		} else {
			this.addShadow()
			isVisible = true
		}
		Renderer.update = true
		return isVisible
	},

	/**
     * property of the plugin to add shadow using createJS shadow property
     * @memberof EkstepRenderer.Plugin
     * @property addShadow
     */
	addShadow: function () {
		var shadowObj = this._self.shadow

		// If the shadow is a plugin, set the visibility to true
		if ((shadowObj) && (shadowObj._self) && ("visible" in shadowObj._self)) {
			shadowObj._self.visible = true
		} else {
			// Not a plugin, render a normal shadow
			var shadowColor = this._data.shadowColor || "#cccccc"
			shadowColor = this._data.shadow || shadowColor
			var offsetX = this._data.offsetX || 0
			var offsetY = this._data.offsetY || 0
			var blur = this._data.blur || 5
			this._self.shadow = new createjs.Shadow(shadowColor, offsetX, offsetY, blur)
		}
	},

	/**
     * property of the plugin to remove it's shadow
     * @memberof EkstepRenderer.Plugin
     * @property removeShadow
     */
	removeShadow: function () {
		var shadowObj = this._self.shadow

		// If the shadow is a plugin, set the visibility to false
		if ((shadowObj) && (shadowObj._self) && ("visible" in shadowObj._self)) {
			shadowObj._self.visible = false
		} else {
			// Not a plugin (normal shadow), unset the object
			this._self.shadow = undefined
		}
	},

	/**
     * Returns the boolean which show if element has shawdow or not.
     * @memberof EkstepRenderer.Plugin
     */
	hasShadow: function () {
		var visibleShadow = false
		var shadowObj = this._self.shadow

		// If the shadow is a plugin, then check the visible property
		if ((shadowObj) && (shadowObj._self) && ("visible" in shadowObj._self)) {
			visibleShadow = shadowObj._self.visible
		} else {
			// It is not a plugin, check if the shadow object is created
			if (this._self.shadow) {
				visibleShadow = true
			}
		}

		return visibleShadow
	},

	/**
     * Draw a border on element
     * @param data {object} element outside which border should be drawed
     * @param dims {object} dimension of border to be drawed
     * @memberof EkstepRenderer.Plugin
     */
	drawBorder: function (data, dims) {
		if (data.stroke) {
			var strokeWidth = (data["stroke-width"] || 1)
			// var borderShape;
			var graphics = this._self.graphics
			if (!this._self.graphics) {
				this.borderShape = new createjs.Shape()
				this.borderShape.x = this._self.x
				this.borderShape.y = this._self.y
				graphics = this.borderShape.graphics
			}
			graphics.beginStroke(data.stroke)
			this.borderShape.alpha = (data["stroke-opacity"] || 1)
			graphics.setStrokeStyle(strokeWidth)
			// graphics.setStrokeDash([10,10],0);

			// dims.x += strokeWidth/2;
			// dims.y += strokeWidth/2;
			// // dims.w += strokeWidth/2;
			// // dims.h += strokeWidth/2;
			// this._self.x += strokeWidth;
			// this._self.y += strokeWidth;

			graphics.dr(0, 0, dims.w, dims.h)
			// graphics.dr(dims.x + strokeWidth/2, dims.y + strokeWidth/2, dims.w - strokeWidth, dims.h - strokeWidth);
			if (!this._self.graphics) {
				this._parent.addChild(this.borderShape)
			}
			Renderer.update = true
		}
	},

	/**
     * Rotate an element
     * @param data {object} plugin object
     * @memberof EkstepRenderer.Plugin
     */
	rotation: function (data) {
		var degreeRotation = 0
		if (data.rotate) {
			degreeRotation = data.rotate
		} else if (_.isNumber(data)) {
			degreeRotation = data
		}
		if (!_.isUndefined(this.borderShape)) {
			this.borderShape.rotation = degreeRotation
		}
		this._self.rotation = degreeRotation
	},

	enableDrag: function (asset, snapTo) {
		asset.cursor = "pointer"
		asset.on("mousedown", function (evt) {
			this.parent.addChild(this)
			this.offset = {
				x: this.x - evt.stageX,
				y: this.y - evt.stageY
			}
		})
		asset.on("pressmove", function (evt) {
			this.x = evt.stageX + this.offset.x
			this.y = evt.stageY + this.offset.y
			Renderer.update = true
		})
		if (snapTo) {
			asset.on("pressup", function (evt) {
				var plugin = PluginManager.getPluginObject(snapTo)
				var dims = plugin._dimensions
				var xFactor = parseFloat(this.width * (50 / 100))
				var yFactor = parseFloat(this.height * (50 / 100))
				var x = dims.x - xFactor

				var y = dims.y - yFactor

				var maxX = dims.x + dims.w + xFactor

				var maxY = dims.y + dims.h + yFactor
				var snapSuccess = false
				if (this.x >= x && (this.x + this.width) <= maxX) {
					if (this.y >= y && (this.y + this.height) <= maxY) {
						snapSuccess = true
					}
				}
				if (!snapSuccess) {
					this.x = this.origX
					this.y = this.origY
				} else {
					if (plugin._data.snapX) {
						this.x = dims.x + (dims.w * plugin._data.snapX / 100)
					}
					if (plugin._data.snapY) {
						this.y = dims.y + (dims.h * plugin._data.snapY / 100)
					}
				}
				Renderer.update = true
			})
		}
	},
	evaluateExpr: function (expr) {
		if (!expr) return ""
		// eslint-disable-next-line
		var app = GlobalContext._params
		// eslint-disable-next-line
		var stage = {}
		if (this._stage) {
			stage = this._stage.params
		} else if (this._type === "stage") {
			stage = this.params
		}
		// eslint-disable-next-line
		var content = {}
		if (this._theme) {
			content = this._theme._contentParams
		}
		// eslint-disable-next-line
		var value = undefined
		try {
			expr = expr.trim()
			if ((expr.substring(0, 2) === "${") && (expr.substring(expr.length - 1, expr.length) === "}")) {
				expr = expr.substring(2, expr.length)
				expr = expr.substring(0, expr.length - 1)
				// eslint-disable-next-line
				value = eval(expr)
			} else {
				// eslint-disable-next-line
				value = eval(expr)
			}
		} catch (err) {
			console.warn("expr: " + expr + " evaluation failed:", err.message)
		}
		return value
	},
	replaceExpressions: function (model) {
		var arr = []
		var idx = 0
		var nextIdx = model.indexOf("${", idx)
		var endIdx = model.indexOf("}", idx + 1)
		while (nextIdx !== -1 && endIdx !== -1) {
			var expr = model.substring(nextIdx, endIdx + 1)
			arr.push(expr)
			idx = endIdx
			nextIdx = model.indexOf("${", idx)
			endIdx = model.indexOf("}", idx + 1)
		}
		if (arr.length > 0) {
			for (var i = 0; i < arr.length; i++) {
				var val = this.evaluateExpr(arr[i])
				model = model.replace(arr[i], val)
			}
		}
		return model
	},
	getParam: function (param) {
		var value
		var tokens = param.split(".")
		if (tokens.length >= 2) {
			var scope = tokens[0]
			var idx = param.indexOf(".")
			var paramName = param.substring(idx + 1)
			if (scope && scope.toLowerCase() === "app") {
				value = GlobalContext.getParam(paramName)
			} else if (scope && scope.toLowerCase() === "stage") {
				value = this._stage.getParam(paramName)
			} else {
				value = this._theme.getParam(paramName)
			}
		} else if (this._stage) {
			value = this._stage.getParam(param)
		}
		return value
	},
	getDefaultFont: function () {
		this._defaultFont = "NotoSans, NotoSansGujarati, NotoSansOriya, NotoSansMalayalam, NotoNastaliqUrdu"
		return this._defaultFont
	},
	transitionTo: function () {
		PluginManager.addError("Subclasses of plugin should implement transitionTo()")
	},
	evaluate: function () {
		PluginManager.addError("Subclasses of plugin should implement evaluate()")
	},
	reload: function () {
		PluginManager.addError("Subclasses of plugin should implement reload()")
	},
	restart: function () {
		PluginManager.addError("Subclasses of plugin should implement reload()")
	},

	/**
     * Blur the current element
     * @memberof EkstepRenderer.Plugin
     */
	blur: function (action) {
		var instance = this
		var obj = instance._self
		var blurFilter = new createjs.BlurFilter(25, 25, 1)
		obj.filters = [blurFilter]
		var bounds = instance.relativeDims()
		obj.cache(bounds.x, bounds.y, bounds.w, bounds.h)
		Renderer.update = true
	},

	/**
     * Unblur the current element
     * @memberof EkstepRenderer.Plugin
     */
	unblur: function (action) {
		var instance = this
		instance._self.filters = []
		instance._self.uncache()
		Renderer.update = true
	},

	/**
     * Invoke childrens again to reflect changes
     * @param data {object} Data which need to be updated
     * @param parent {object} parent of data element
     * @param stage {object} Stage inside which element resides
     * @param theme {object} Theme object
     * @memberof EkstepRenderer.Plugin
     */
	invokeChildren: function (data, parent, stage, theme) {
		var children = []
		for (k in data) {
			if (PluginManager.isPlugin(k)) {
				if (_.isArray(data[k])) {
					_.each(data[k], function (item) {
						item.pluginType = k
						if (!item["z-index"]) item["z-index"] = -1
						children.push(item)
					})
				} else {
					data[k].pluginType = k
					if (!data[k]["z-index"]) data[k]["z-index"] = -1
					children.push(data[k])
				}
			}
		}
		// children = _.sortBy(children, 'z-index'); // Now this is no longer required as the elements are sorted by z-index at the end
		for (k in children) {
			var item = children[k]
			if (item.pluginType) PluginManager.invoke(item.pluginType, item, parent, stage, theme)
		}
		if (parent._self) {
			parent._self.sortChildren(function (obj1, obj2, options) {
				if (_.isUndefined(obj2["z-index"])) obj2["z-index"] = -1
				if (_.isUndefined(obj1["z-index"])) obj1["z-index"] = -1
				if (obj1["z-index"] > obj2["z-index"]) {
					return 1
				}
				if (obj1["z-index"] < obj2["z-index"]) {
					return -1
				}
				return 0
			})
		}
	},
	getPluginParam: function (param) {
		var instance = this
		// eslint-disable-next-line
		var params = instance._pluginParams
		var expr = "params." + param
		// eslint-disable-next-line
		return eval(expr)
	},
	setPluginParam: function (param, value, incr, max) {
		var instance = this
		var fval = instance._pluginParams[param]
		if (incr) {
			if (!fval) { fval = 0 }
			fval = (fval + incr)
		} else {
			fval = value
		}
		if (fval < 0) fval = 0
		if (typeof max !== "undefined" && fval >= max) fval = 0
		instance._pluginParams[param] = fval
	},
	destroy: function () {
		var pluginName = this._type
		delete org.ekstep.pluginframework.pluginManager.plugins[pluginName]
		console.log(pluginName, " Plugin instance got destroyed")
	},
	setPluginParamValue: function (action) {
		var scope = action.scope
		var param = action.param
		var paramExpr = action["ev-value"]
		var paramModel = action["ev-model"]
		var val
		if (paramExpr) {
			val = this.getPluginParam(paramExpr)
		} else if (paramModel) {
			if (this._stage) {
				var model = this.replaceExpressions(paramModel)
				val = this._stage.getModelValue(model)
			}
		} else {
			val = action["param-value"]
		}
		var incr = action["param-incr"]
		if (scope && scope.toLowerCase() === "app") {
			GlobalContext.setParam(param, val, incr)
		} else if (scope && scope.toLowerCase() === "stage") {
			this._stage.setParam(param, val, incr)
		} else if (scope && scope.toLowerCase() === "content") {
			this._theme.setParam(param, val, incr)
		} else {
			this.setPluginParam(param, val, incr)
		}
	},

	/**
     * Return all children of data
     * @param data {object}
     * @memberof EkstepRenderer.Plugin
     */
	getInnerECML: function (data) {
		var children = {}
		data = (typeof data === "undefined") ? this._data : data
		for (k in data) {
			if (PluginManager.isPlugin(k) && _.isObject(data[k]) && !_.isEmpty(data[k])) {
				children[k] = data[k]
			}
		}
		return children
	},

	/**
     * It takes the value and the param to set its state
     * @param param {string} Param is a string defining the type of question (mcq/mtf/ftb)
     * @param value {object/array} value for mcq and mtf type is an array and for ftb type is an object
     * @param isStateChanged {boolean} state true or false if pluginState is changed
     * @memberof EkstepRenderer.Plugin
     */
	setState: function (param, value, isStateChanged) {
		if (!_.isUndefined(isStateChanged)) {
			this._stage.isStageStateChanged(isStateChanged)
		}
		this._stage.setParam(param.toLowerCase(), value)
	},

	/**
     * Returns state of the param.
     * Undefined if the param is not present is the currentState.
     * @param paramName {string} name of the param.
     * @memberof EkstepRenderer.Plugin
     */
	getState: function (param) {
		if (!_.isUndefined(this._stage._currentState)) {
			return this._stage._currentState[param]
		}
	}

})

window.Plugin = Plugin

/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
/**
 * Name space being fallowd
 * org.ekstep which is already defined in the pluginframework
 * reusing the same namespace
 */
var ContentRenderer = function () {}
ContentRenderer.prototype._ = window._
window.org.ekstep.contentrenderer = new ContentRenderer()
window.globalConfig = {
	"context": {},
	"config": {}
}
org.ekstep.contentrenderer.init = function () {
	window.initializePreview = org.ekstep.contentrenderer.initializePreview
	window.setContentData = org.ekstep.contentrenderer.setContent
}

/**
 * Loading of canvas default plguis which are defined in the globalconfig obj
 */
org.ekstep.contentrenderer.loadDefaultPlugins = function (cb) {
	org.ekstep.contentrenderer.initPlugins("", "coreplugins")
	var globalConfig = EkstepRendererAPI.getGlobalConfig()
	EkstepRendererAPI.dispatchEvent("renderer:content:progress", {"name": window.splashScreen.loadType.corePlugins, "files": globalConfig.defaultPlugins})
	// This is to load preview from CDN or proxy(relative path)
	var corePluginsPath = globalConfig.previewCdnUrl ? globalConfig.previewCdnUrl + "/coreplugins.js?" : "./coreplugins.js?"
	if (globalConfig.isCorePluginsPackaged) {
		org.ekstep.pluginframework.resourceManager.loadResource(corePluginsPath + globalConfig.version, "script", function () {
			org.ekstep.contentrenderer.loadPlugins(globalConfig.defaultPlugins, [], function () {
				if (cb) cb()
			})
		})
	} else {
		org.ekstep.contentrenderer.loadPlugins(globalConfig.defaultPlugins, [], function () {
			if (cb) cb()
		})
	}
	// globalConfig.isCorePluginsPackaged && jQuery("body").append($("<script type='text/javascript' src='./coreplugins.js?" + globalConfig.version + "'>"))
	// org.ekstep.contentrenderer.loadPlugins(globalConfig.defaultPlugins, [], function () {
	// 	if (cb) cb()
	// })
}

/**
 * Is the starting point of the game. Before launching the game it loads the canvas
 * default and external plugin and then initializes the player "renderer:player:init"
 * @param  {obj} appInfo [metadata]
 */
org.ekstep.contentrenderer.startGame = function (appInfo) {
	console.log("appInfo", appInfo);
	window.PLAYER_START_TIME = Date.now() / 1000
	globalConfig.basepath = (appInfo && appInfo.streamingUrl) ? (appInfo.streamingUrl) : (globalConfig.basepath || appInfo.baseDir)
	org.ekstep.contentrenderer.loadDefaultPlugins(function () {
		org.ekstep.contentrenderer.loadExternalPlugins(function () {
			var globalConfig = EkstepRendererAPI.getGlobalConfig()
			if (globalConfig.mimetypes.indexOf(appInfo.mimeType) > -1) {
				/**
				 * renderer:player:init event will get dispatch after loading default & external injected plugins
				 * @event 'renderer:player:init'
				 * @fires 'renderer:player:init'
				 * @memberof EkstepRendererEvents
				 */
				EkstepRendererAPI.dispatchEvent("renderer:player:init")
			} else {
				if (!isbrowserpreview) {
					// TODO : Need to clean
					org.ekstep.contentrenderer.loadPlugins({ "id": "org.ekstep.collection", "ver": "1.0", "type": "plugin" }, [], function () {
						EkstepRendererAPI.dispatchEvent("renderer:collection:show")
					})
				} else {
					console.log("SORRY COLLECTION PREVIEW IS NOT AVAILABLE")
				}
			}
		})
	})
}
/**
     * To create a multiple repo instance to load the plugins
     * If the repo path is undefined then framework is considering default paths
     */
org.ekstep.contentrenderer.addRepos = function () {
	var obj = EkstepRendererAPI.getGlobalConfig()
	if (_.isUndefined(obj.config.repos)) {
		obj.config.repos = isMobile ? obj.devicePluginspath : obj.previewPluginspath
	}
	var path = _.isArray(obj.config.repos) ? obj.config.repos : [obj.config.repos]
	/**
     * renderer:repo:create event will get dispatch to add a custom repo to load the plugins from the path.
     * @event 'renderer:repo:create'
     * @fires 'renderer:repo:create'
     * @memberof EkstepRendererEvents
     */
	EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, path)
}

/**
 * Loading of external plugins using plugin framework
 * Exteranal plguins can send through window confi obj
 */
org.ekstep.contentrenderer.loadExternalPlugins = function (cb) {
	var globalConfig = EkstepRendererAPI.getGlobalConfig()
	org.ekstep.contentrenderer.addRepos()
	if (globalConfig.config.plugins) {
		EkstepRendererAPI.dispatchEvent("renderer:content:progress", {"name": window.splashScreen.loadType.externalPlugins, "files": globalConfig.config.plugins})
		org.ekstep.contentrenderer.loadPlugins(globalConfig.config.plugins, [], function () {
			console.log("Load default plugins")
			EkstepRendererAPI.dispatchEvent("renderer:content:progress", {"name": window.splashScreen.loadType.contentPlugins, "files": globalConfig.contentLaunchers})
			console.info("External plugins are loaded")
			EkstepRendererAPI.dispatchEvent("renderer:launcher:loadRendererPlugins", cb)
			// if (cb) cb();
		})
	} else {
		EkstepRendererAPI.dispatchEvent("renderer:launcher:loadRendererPlugins", cb)
		// if (cb) cb();
	}
}

org.ekstep.contentrenderer.setContent = function (metadata, data, configuration) {
	if (_.isUndefined(metadata) || _.isNull(metadata)) {
		content.metadata = AppConfig.defaultMetadata
	} else {
		content.metadata = metadata
	}
	if (!_.isUndefined(data)) {
		content.body = data
	}
	_.map(configuration, function (val, key) {
		config[key] = val
	})
	if (!config.showHTMLPages) {
		config.showEndPage = false
	}
	if (data) {
		var object = {
			"config": configuration,
			"data": data,
			"metadata": metadata
		}
	}
	org.ekstep.contentrenderer.initializePreview(object)
}

org.ekstep.contentrenderer.initializePreview = function (configuration) {
	// Checking if renderer is running or not
	if (EkstepRendererAPI.isRendererRunning()) {
		EkstepRendererAPI.dispatchEvent("renderer:telemetry:end")
		// If renderer is running just call function to load aluncher
		var contentObj = configuration.metadata || globalConfig.defaultMetadata
		if (configuration.data) contentObj.body = configuration.data
		EkstepRendererAPI.renderContent(contentObj)
	} else {
		// If renderer is not running launch the framework from start
		if (configuration) { // Deep clone of configuration. To avoid object refrence issue.
			var configurationObj = JSON.parse(JSON.stringify(configuration))
		}
		if (_.isUndefined(configurationObj.context)) {
			configurationObj.context = {}
		}
		if (_.isUndefined(configurationObj.config)) {
			configurationObj.config = {}
		}
		if (_.isUndefined(configurationObj.context.contentId)) {
			configurationObj.context.contentId = getUrlParameter("id")
		}
		if (_.isUndefined(configurationObj.appContext)) {
			configurationObj.appContext = {}
		}
		setGlobalConfig(configurationObj)
		GlobalContext.game = { id: configurationObj.contentId || GlobalContext.game.id, ver: (configurationObj.metadata && configurationObj.metadata.pkgVersion) || "1.0" }
		GlobalContext.game.ver = GlobalContext.game.ver.toString()
		GlobalContext.user = { uid: configurationObj.uid }

		addWindowUnloadEvent()
		/**
             * renderer:player:init event will get dispatch after loading default & external injected plugins
             * @event 'renderer:player:init'
             * @fires 'renderer:player:init'
             * @memberof EkstepRendererEvents
             */
		EkstepRendererAPI.dispatchEvent("renderer.content.getMetadata")
	}
}

/**
 * initialize of the plugin framework
 * @param  {string} host             [name of the domain or host ]
 * @param  {string} repoRelativePath [replative path]
 */
org.ekstep.contentrenderer.initPlugins = function (host, repoRelativePath) {
	// @ plugin:error event is dispatching from the plugin-framework
	// If any of the plugin is failed to load OR invoke then plugin:error event will trigger
	if (!EkstepRendererAPI.hasEventListener("plugin:error")) {
		EkstepRendererAPI.addEventListener("plugin:error", org.ekstep.contentrenderer.pluginError, this)
	}
	host = _.isUndefined(host) ? "" : host
	var pluginRepo = host + repoRelativePath
	var globalConfig = EkstepRendererAPI.getGlobalConfig()
	var pfConfig = {
		env: "renderer",
		async: async,
		build_number: globalConfig.version,
		pluginRepo: pluginRepo,
		repos: [org.ekstep.pluginframework.publishedRepo]
	}
	org.ekstep.pluginframework.initialize(pfConfig)
}

/**
 * Added the plguin error event if any of the plugin is failed then
 * dispatching oE_ERROR event with data
 * @event plugin:error whihc is being dispatching from the plugin framework
 * @param  {obj} data  [data which is need to be log in the OE_ERROR Telemetry event]
 */
org.ekstep.contentrenderer.pluginError = function (event, data) {
	EkstepRendererAPI.logErrorEvent(data.err, {
		"type": "plugin",
		"action": data.action,
		"objectType": data.plugin,
		"objectId": data.objectid,
		"plugin": {"id": data.plugin, "ver": data.version}
	})
}

/**
 * Loading of the plguins
 * @param  {array}   pluginManifest [Pluginmanifest which is need to be loaded]
 * @param  {array}   manifestMedia  [Its optional if any other manifest media need to be load it behaves same as plguinManifest]
 * @param  {Function} cb             [After loading of the plguins callback will be invoked]
 */
org.ekstep.contentrenderer.loadPlugins = function (pluginManifest, manifestMedia, cb) {
	var pluginObj = []
	if (!Array.isArray(pluginManifest)) {
		pluginObj.push(pluginManifest)
		pluginManifest = pluginObj
	}
	_.each(pluginManifest, function (p) {
		p.ver = parseFloat(p.ver).toFixed(1)
	})
	org.ekstep.pluginframework.pluginManager.loadAllPlugins(pluginManifest, manifestMedia, function () {
		if (typeof PluginManager !== "undefined") {
			PluginManager.pluginMap = org.ekstep.pluginframework.pluginManager.plugins
		}
		if (cb) cb()
	})
}

/**
 * Registering of the plugin dynamically using createjs initialize without plguinframework
 * It will initializes the instance of the plugin
 * @param  {int} id     [Plugin identifier]
 * @param  {class} plugin [Plugin instance]
 */
org.ekstep.contentrenderer.registerPlguin = function (id, plugin) {
	org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin)
	if (typeof createjs !== "undefined") { createjs.EventDispatcher.initialize(plugin.prototype) }
}

/**
 * It will fetchs the content metaData
 * @param  {init}   id [Content Identifer]
 * @return {object}      [Content Metadata]
 */
org.ekstep.contentrenderer.getContentMetadata = function (id, cb) {
	org.ekstep.service.content.getContent(id)
		.then(function (data) {
			org.ekstep.contentrenderer.setContentMetadata(data, function () {
				if (!_.isUndefined(cb)) {
					cb(data)
				}
			})
		})
		.catch(function (err) {
			console.info("contentNotAvailable : ", err)
			contentNotAvailable(err)
		})
}

org.ekstep.contentrenderer.setContentMetadata = function (contentData, cb) {
	var data = _.clone(contentData)
	content["metadata"] = data
	GlobalContext.currentContentId = data.identifier
	GlobalContext.currentContentMimeType = data.mimeType
	// Since metadata is optional now, calling api to get metadata & setting on GlobalContext.game variable
	GlobalContext.game.id = data.identifier
	GlobalContext.game.ver = data.pkgVersion || "1"
	if (_.isUndefined(data.localData)) {
		data.localData = _.clone(data.contentData)
	}
	if (_.isUndefined(data.contentData)) {
		data.localData = _.clone(contentData)
	} else {
		data = data.localData
	}
	if (typeof cordova === "undefined") {
		org.ekstep.contentrenderer.getContentBody(content.metadata.identifier)
	}
	if (cb) cb()
}

/**
 * It will fetches the content body.
 * @param  {contentId} id [Content identifier]
 * @return {obj}    [Content body]
 */
org.ekstep.contentrenderer.getContentBody = function (id) {
	var configuration = EkstepRendererAPI.getGlobalConfig()
	var headers = org.ekstep.contentrenderer.urlparameter
	if (!_.isUndefined(configuration.context.authToken)) {
		headers["Authorization"] = "Bearer " + configuration.context.authToken
	}
	org.ekstep.service.content.getContentBody(id, headers).then(function (data) {
		content["body"] = data.body
		org.ekstep.contentrenderer.startGame(content.metadata)
	})
		.catch(function (err) {
			console.info("contentNotAvailable : ", err)
			contentNotAvailable(err)
		})
}
org.ekstep.contentrenderer.urlparameter = function () {
	var urlParams = decodeURIComponent(window.location.search.substring(1)).split("&")
	var i = urlParams.length
	// eslint-disable-next-line
	while (i--) {
		if ((urlParams[i].indexOf("webview") >= 0) || (urlParams[i].indexOf("id") >= 0)) {
			urlParams.splice(i, 1)
		} else {
			urlParams[i] = urlParams[i].split("=")
		}
	}
	return (_.object(urlParams))
}

org.ekstep.contentrenderer.web = function (id) {
	var configuration = EkstepRendererAPI.getGlobalConfig()
	var headers = org.ekstep.contentrenderer.urlparameter
	if (!_.isUndefined(configuration.context.authToken)) {
		headers["Authorization"] = "Bearer " + configuration.context.authToken
	}
	org.ekstep.service.content.getContentMetadata(id, headers)
		.then(function (data) {
			org.ekstep.contentrenderer.setContentMetadata(data)
		})
		.catch(function (err) {
			console.info("contentNotAvailable : ", err)
			contentNotAvailable(err)
		})
}

/*org.ekstep.contentrenderer.device = function () {
	var globalconfig = EkstepRendererAPI.getGlobalConfig()
	var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
	if (!isbrowserpreview && isMobile) {
		if (globalconfig.metadata) {
			org.ekstep.contentrenderer.setContentMetadata(globalconfig.metadata, function () {
				org.ekstep.contentrenderer.startGame(content.metadata)
			})
		} else {
			org.ekstep.contentrenderer.getContentMetadata(globalconfig.contentId, function () {
				org.ekstep.contentrenderer.startGame(content.metadata)
			})
		}
	} else {
		org.ekstep.contentrenderer.startGame(GlobalContext.config.appInfo)
	}
}*/

org.ekstep.contentrenderer.isStreamingContent = function () {
	var globalConfig = EkstepRendererAPI.getGlobalConfig()
	var regex = new RegExp("^(http|https)://", "i")
	return regex.test(globalConfig.basepath)
}
org.ekstep.contentrenderer.init()

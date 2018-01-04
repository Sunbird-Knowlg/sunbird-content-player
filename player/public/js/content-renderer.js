/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
/**
 * Name space being fallowd
 * org.ekstep which is already defined in the pluginframework
 * reusing the same namespace
 */
var content_renderer = function() {};
content_renderer.prototype._ = window._;
window.org.ekstep.contentrenderer = new content_renderer();
window.globalConfig = {
    'context': {},
    'config': {}
};
org.ekstep.contentrenderer.init = function() {
    /**
     * TODO: Need To handle Synchronus flow of org.ekstep.contentrenderer.getContent and setContent here
     * device and web rendrer should be handle here
     */
    window.initializePreview = org.ekstep.contentrenderer.initializePreview;
    window.setContentData = org.ekstep.contentrenderer.setContent;
};

/**
 * Loading of canvas default plguis which are defined in the globalconfig obj
 */
org.ekstep.contentrenderer.loadDefaultPlugins = function(cb){
    org.ekstep.contentrenderer.initPlugins('', 'coreplugins');
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    org.ekstep.contentrenderer.loadPlugins(globalConfig.defaultPlugins,[],function(){
        if(cb) cb()
    });
};

/**
 * Is the starting point of the game. Before launching the game it loads the canvas 
 * default and external plugin and then initializes the player "renderer:player:init"
 * @param  {obj} appInfo [metadata]
 */
org.ekstep.contentrenderer.startGame = function(appInfo) {
    org.ekstep.contentrenderer.loadDefaultPlugins(function() {
        org.ekstep.contentrenderer.loadExternalPlugins(function() {
            var globalConfig = EkstepRendererAPI.getGlobalConfig();
            if (globalConfig.mimetypes.indexOf(appInfo.mimeType) > -1) {
                /**
                 * renderer:player:init event will get dispatch after loading default & external injected plugins
                 * @event 'renderer:player:init'
                 * @fires 'renderer:player:init'
                 * @memberof EkstepRendererEvents
                 */
                EkstepRendererAPI.dispatchEvent('renderer:player:init');
            } else {
                if(!isbrowserpreview){
                    // TODO : Need to clean
                    org.ekstep.contentrenderer.loadPlugins({"id": "org.ekstep.collection", "ver": "1.0", "type": 'plugin'}, [], function(){
                         EkstepRendererAPI.dispatchEvent('renderer:collection:show');
                    });  
                }else{
                    console.log("SORRY COLLECTION PREVIEW IS NOT AVAILABEL");
                }
            }
        });
    });
};
/**
 * To create a multiple repo instance to load the plugins
 * If the repo path is undefined then framework is considering default paths
 */
org.ekstep.contentrenderer.addRepos = function() {
    var obj = EkstepRendererAPI.getGlobalConfig();
    if (_.isUndefined(obj.config.repos)) {
        obj.config.repos = isMobile ? obj.devicePluginspath : obj.previewPluginspath;
    }
    EkstepRendererAPI.dispatchEvent("renderer:repo:create", undefined, {
        path: obj.config.repos,
        position: 0
    });    
};

/**
 * Loading of external plugins using plugin framework
 * Exteranal plguins can send through window confi obj
 */
org.ekstep.contentrenderer.loadExternalPlugins = function(cb) {
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    org.ekstep.contentrenderer.addRepos();
    if (globalConfig.config.plugins) {
        org.ekstep.contentrenderer.loadPlugins(globalConfig.config.plugins, [], function() {
            console.info('External plugins are loaded');
            if (cb) cb();
        });
    }else{
        if(cb) cb();
    }
};

org.ekstep.contentrenderer.setContent = function(metadata, data, configuration) {
    if (_.isUndefined(metadata) || _.isNull(metadata)) {
        content.metadata = AppConfig.defaultMetadata
    } else {
        content.metadata = metadata;
    }
    if (!_.isUndefined(data)) {
        content.body = data;
    }
    _.map(configuration, function(val, key) {
        config[key] = val;
    });
    if (!config.showHTMLPages) {
        config.showEndPage = false;
    }
    localStorageGC.clear();
    if (data) {
        var object = {
            'config': configuration,
            'data': data,
            'metadata': metadata
        }
    }
    org.ekstep.contentrenderer.initializePreview(object);
};

org.ekstep.contentrenderer.initializePreview = function(configuration) {
    if (_.isUndefined(configuration.context)) {
        configuration.context = {};
    }
    if (_.isUndefined(configuration.config)) {
        configuration.config = {};
    }
    if (_.isUndefined(configuration.context.contentId)) {
        configuration.context.contentId = getUrlParameter("id");
    }
    localStorageGC.clear();
    _.extend(configuration, configuration.context);  // TelemetryEvent is using globalConfig.context.sid/did
    _.extend(configuration, configuration.config);
    setGlobalConfig(configuration);
    GlobalContext.game = {id: configuration.contentId || GlobalContext.game.id, ver: configuration.contentVer || '1.0'};
    GlobalContext.user = {uid: configuration.uid};

    addWindowUnloadEvent();
    /**
     * renderer:player:init event will get dispatch after loading default & external injected plugins
     * @event 'renderer:player:init'
     * @fires 'renderer:player:init'
     * @memberof EkstepRendererEvents
     */
    EkstepRendererAPI.dispatchEvent("renderer.content.getMetadata");
};

/**
 * initialize of the plugin framework
 * @param  {string} host             [name of the domain or host ]
 * @param  {string} repoRelativePath [replative path]
 */
org.ekstep.contentrenderer.initPlugins = function(host, repoRelativePath) {
    var pluginsPath = undefined;
    // @ plugin:error event is dispatching from the plugin-framework
    // If any of the plugin is failed to load OR invoke then plugin:error event will trigger
    if (!EkstepRendererAPI.hasEventListener('plugin:error')) {
        EkstepRendererAPI.addEventListener('plugin:error', org.ekstep.contentrenderer.pluginError, this);
    }
    host = _.isUndefined(host) ? '' : host;
    var pluginRepo = host + repoRelativePath;
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    var pfConfig = {env: "renderer", async: async,build_number:globalConfig.version, pluginRepo: pluginRepo, repos: [org.ekstep.pluginframework.publishedRepo]
    };
    org.ekstep.pluginframework.initialize(pfConfig);
};

/**
 * Added the plguin error event if any of the plugin is failed then 
 * dispatching oE_ERROR event with data
 * @event plugin:error whihc is being dispatching from the plugin framework
 * @param  {obj} data  [data which is need to be log in the OE_ERROR Telemetry event]
 */
org.ekstep.contentrenderer.pluginError = function(event, data) {
    EkstepRendererAPI.logErrorEvent(data.err, {
        'type': 'plugin',
        'action': data.action,
        'objectType': data.plugin,
        'objectId': data.objectid
    });
};

/**
 * Loading of the plguins
 * @param  {array}   pluginManifest [Pluginmanifest which is need to be loaded]
 * @param  {array}   manifestMedia  [Its optional if any other manifest media need to be load it behaves same as plguinManifest]
 * @param  {Function} cb             [After loading of the plguins callback will be invoked]
 */
org.ekstep.contentrenderer.loadPlugins = function(pluginManifest, manifestMedia, cb) {
    var pluginObj = []
    if (!Array.isArray(pluginManifest)) {
        pluginObj.push(pluginManifest);
        pluginManifest = pluginObj;
    }
    _.each(pluginManifest, function(p) {
        p.ver = parseFloat(p.ver).toFixed(1);
    });
    org.ekstep.pluginframework.pluginManager.loadAllPlugins(pluginManifest, manifestMedia, function() {
        if (typeof PluginManager != 'undefined') {
            PluginManager.pluginMap = org.ekstep.pluginframework.pluginManager.plugins;
        }
        if (cb) cb();
    });
};

/**
 * Registering of the plugin dynamically using createjs initialize without plguinframework
 * It will initializes the instance of the plugin
 * @param  {int} id     [Plugin identifier]
 * @param  {class} plugin [Plugin instance]
 */
org.ekstep.contentrenderer.registerPlguin = function(id, plugin) {
    org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin);
    if (typeof createjs !== "undefined")
        createjs.EventDispatcher.initialize(plugin.prototype);
};

/**
 * It will fetchs the content metaData
 * @param  {init}   id [Content Identifer]
 * @return {object}      [Content Metadata]
 */
org.ekstep.contentrenderer.getContentMetadata = function(id, cb) {
    org.ekstep.service.content.getContent(id)
        .then(function(data) {
            org.ekstep.contentrenderer.setContentMetadata(data, function() {
                if (!_.isUndefined(cb)) {
                    cb(data);
                }
            });
        })
        .catch(function(err) {
            console.info("contentNotAvailable : ", err);
            contentNotAvailable(err);
        });
};

org.ekstep.contentrenderer.setContentMetadata = function(contentData, cb) {
    var data = _.clone(contentData);
    content["metadata"] = data;
    GlobalContext.currentContentId = data.identifier;
    GlobalContext.currentContentMimeType = data.mimeType;
    if (_.isUndefined(data.localData)) {
        data.localData = _.clone(data.contentData);
    }
    if (_.isUndefined(data.contentData)) {
        data.localData = _.clone(contentData);
    } else {
        data = data.localData;
    }
    if ("undefined" == typeof cordova) {
        org.ekstep.contentrenderer.getContentBody(content.metadata.identifier);
    }
    if (cb) cb();
};

/**
 * It will fetches the content body.
 * @param  {contentId} id [Content identifier]
 * @return {obj}    [Content body]
 */
org.ekstep.contentrenderer.getContentBody = function(id) {
    var configuration = EkstepRendererAPI.getGlobalConfig();
    var headers = org.ekstep.contentrenderer.urlparameter;
    if (!_.isUndefined(configuration.context.authToken)) {
        headers["Authorization"] = 'Bearer ' + configuration.context.authToken;
    }
    org.ekstep.service.content.getContentBody(id, headers).then(function(data) {
            content["body"] = data.body;
            org.ekstep.contentrenderer.startGame(content.metadata);
        })
        .catch(function(err) {
            console.info("contentNotAvailable : ", err);
            contentNotAvailable(err);
        });
};
org.ekstep.contentrenderer.urlparameter = function() {
    var urlParams = decodeURIComponent(window.location.search.substring(1)).split('&');
    var i = urlParams.length;
    while (i--) {
        if ((urlParams[i].indexOf('webview') >= 0) || (urlParams[i].indexOf('id') >= 0)) {
            urlParams.splice(i, 1)
        } else {
            urlParams[i] = urlParams[i].split("=");
        }
    }
    return (_.object(urlParams))
};

org.ekstep.contentrenderer.web = function(id) {
    var configuration = EkstepRendererAPI.getGlobalConfig();
    var headers = org.ekstep.contentrenderer.urlparameter;
    if (!_.isUndefined(configuration.context.authToken)) {
        headers["Authorization"] = 'Bearer ' + configuration.context.authToken;
    }
    org.ekstep.service.content.getContentMetadata(id, headers)
        .then(function(data) {
            org.ekstep.contentrenderer.setContentMetadata(data);
        })
        .catch(function(err) {
            console.info("contentNotAvailable : ", err);
            contentNotAvailable(err);
        });
};

org.ekstep.contentrenderer.device = function() {
    if (isMobile) {
        org.ekstep.contentrenderer.getContentMetadata(GlobalContext.game.id, function() {
            org.ekstep.contentrenderer.startGame(content.metadata);
        });
    } else {
        org.ekstep.contentrenderer.startGame(GlobalContext.config.appInfo);
    }
};

org.ekstep.contentrenderer.init();

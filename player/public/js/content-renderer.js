/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var content_renderer = function() {};
content_renderer.prototype._ = window._;
window.org.ekstep.contentrenderer = new content_renderer();
window.previewData = {'context': {}, 'config': {} }; 
org.ekstep.contentrenderer.init = function() {
    /**
     * TODO: Need To handle Synchronus flow of org.ekstep.contentrenderer.setContent and getContent here
     * device and web rendrer should be handle here
     */ 
    window.initializePreview = org.ekstep.contentrenderer.initializePreview;
    window.setContentData = org.ekstep.contentrenderer.setContent;
    console.info('Content renderer start');
};
org.ekstep.contentrenderer.setContent = function(metadata, data, configuration){
    if (_.isUndefined(metadata) || _.isNull(metadata)) {
        content.metadata = AppConfig.DEFAULT_METADATA
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
        configuration.context.contentId = getUrlParameter("id")
    }
    localStorageGC.clear();
    AppConfig = _.extend(AppConfig, configuration.config)
    window.previewData = configuration;
    org.ekstep.service.renderer.api.setBaseUrl(AppConfig.host + AppConfig.apislug);
    configuration.config.repos && configuration.config.plugins && EkstepRendererAPI.dispatchEvent("repo:intialize");
    EkstepRendererAPI.dispatchEvent("telemetryPlugin:intialize");
    addWindowUnloadEvent();
    EkstepRendererAPI.dispatchEvent("event:loadContent");
};
org.ekstep.contentrenderer.initPlugins = function(gamePath) {
    var pluginsPath = undefined;
    // @ plugin:error event is dispatching from the plugin-framework 
    // If any of the plugin is failed to load OR invoke then plugin:error event will trigger
    if (!EkstepRendererAPI.hasEventListener('plugin:error')) {
        EkstepRendererAPI.addEventListener('plugin:error', org.ekstep.contentrenderer.pluginError, this);
    }
    pluginsPath = isCoreplugin ? AppConfig.CORE_PLUGINSPATH : (isbrowserpreview ? AppConfig.PREVIEW_PLUGINSPATH : AppConfig.DEVICE_PLUGINSPATH)
    var pluginRepo = gamePath + pluginsPath;
    var pfConfig = {env: "renderer", async: async, pluginRepo: pluginRepo, repos: [org.ekstep.pluginframework.publishedRepo] };
    org.ekstep.pluginframework.initialize(pfConfig);
};
org.ekstep.contentrenderer.pluginError = function(event, data){
    EkstepRendererAPI.logErrorEvent(data.err, {'type': 'plugin', 'action': data.action, 'objectType': data.plugin,'objectId':data.objectid});
};
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
        console.info("Framework Loaded the plugins");
        if (typeof PluginManager != 'undefined') {
            PluginManager.pluginMap = org.ekstep.pluginframework.pluginManager.plugins;
        }
        if (cb) cb();
    });
};
org.ekstep.contentrenderer.registerPlguin = function(id, plugin) {
    org.ekstep.pluginframework.pluginManager._registerPlugin(id, undefined, plugin);
    if (typeof createjs !== "undefined")
        createjs.EventDispatcher.initialize(plugin.prototype);
};
org.ekstep.contentrenderer.progressbar = function(switcher) {
    if (switcher) {
        jQuery("#progressBar").width(0);
        jQuery('#loading').show();
        var elem = document.getElementById("progressBar");
        var width = 40;
        var id = setInterval(function() {
            if (width >= 100) {
                clearInterval(id);
            } else {
                width++;
                if (elem && elem.style)
                    elem.style.width = width + '%';
                jQuery('#progressCount').text(width + '%');
            }
        }, 0.7);
    } else {
        jQuery('#loading').hide();
    }
};
org.ekstep.contentrenderer.getContentMetadata = function(id, cb) {
    org.ekstep.service.content.getContent(id)
        .then(function(data) {
            org.ekstep.contentrenderer.setContentMetadata(data);
            if (!_.isUndefined(cb)) {
                cb(data);
            }
        })
        .catch(function(err) {
            console.info("contentNotAvailable : ", err);
            contentNotAvailable(err);
        });
};
org.ekstep.contentrenderer.setContentMetadata = function(contentData) {
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
};
org.ekstep.contentrenderer.getContentBody = function() {
    var configuration = EkstepRendererAPI.getPreviewData();
    var headers = org.ekstep.contentrenderer.urlparameter;
    if (!_.isUndefined(configuration.context.authToken)) {
        headers["Authorization"] = 'Bearer ' + configuration.context.authToken;
    }
    org.ekstep.service.content.getContentBody(id, headers).then(function(data) {
            content["body"] = data.body;
            launchInitialPage(content.metadata);
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
org.ekstep.contentrenderer.web = function() {
    var configuration = EkstepRendererAPI.getPreviewData();
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
            window.location.hash = "/play/content/" + GlobalContext.currentContentId;
        });
    } else {
        launchInitialPage(GlobalContext.config.appInfo);
    }
};
org.ekstep.contentrenderer.init();
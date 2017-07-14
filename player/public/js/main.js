var packageName = "org.ekstep.quiz.app", version = AppConfig.version, packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices", currentUser = {}, userList = [],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    stack = new Array(), collectionChildrenIds = new Array(), collectionPath = new Array(), collectionPathMap = {},
    collectionChildren = true, content = {}, config = {showEndPage: true, showHTMLPages: true },
    isbrowserpreview = getUrlParameter("webview"), isCoreplugin = undefined, Renderer = undefined;

document.body.addEventListener("logError", telemetryError, false);

function telemetryError(e) {
    var $body = angular.element(document.body);
    var $rootScope = $body.scope().$root;
    document.body.removeEventListener("logError",e);
}
function removeRecordingFiles(path) {
    _.each(RecorderManager.mediaFiles, function(path) {
        $cordovaFile.removeFile(cordova.file.dataDirectory, path)
            .then(function(success) {
                console.log("success : ", success);
            }, function(error) {
                console.log("err : ", error);
            });
    })
}

function createCustomEvent(evtName, data) {
    var evt = new CustomEvent(evtName, data);
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function backbuttonPressed(stageId) {
    TelemetryService.interrupt("OTHER", stageId);
    TelemetryService.end(logContentProgress());
    try {
        TelemetryService.exit();
    } catch (err) {
        console.error('End telemetry error:', err.message);
    }
    localStorageGC.clear();
    localStorageGC = {};
    org.ekstep.service.renderer.endGenieCanvas();
}

// TODO: After integration with Genie, onclick of exit we should go to previous Activity of the Genie.
// So, change exitApp to do the same.
function exitApp(stageId) {
    if(!stageId){
        stageId = !_.isUndefined(Renderer) ? Renderer.theme._currentStage : " ";
    }
    try {
        TelemetryService.exit();
    } catch (err) {
        console.error('End telemetry error:', err.message);
    }
    localStorageGC.clear();
    localStorageGC = {};
    org.ekstep.service.renderer.endGenieCanvas();
}

function startApp(app) {
    if (!app) app = geniePackageName;
    if (!_.isUndefined(navigator) && !_.isUndefined(navigator.startApp)) {
        navigator.startApp.start(app, function(message) {
            exitApp();
            TelemetryService.exit(packageName, version)
        }, function(error) {
            if (app == geniePackageName)
                showToaster('error', "Unable to start Genie App.");
            else {
                var bool = confirm('App not found. Do you want to search on PlayStore?');
                if (bool) cordova.plugins.market.open(app);
            }
        });
    }
}

function contentNotAvailable(error) {
    EkstepRendererAPI.logErrorEvent(error,{'type':'content','action':'play','severity':'fatal'});
    showToaster('error', AppMessages.NO_CONTENT_FOUND);
    exitApp();
}

function checkStage(showalert) {
    if (GlobalContext.config.appInfo.mimeType == 'application/vnd.ekstep.content-collection') {
        if (showalert == "showAlert") {
            showToaster("error", "No stage found, redirecting to collection list page")
        }
        exitApp();
    } else {
        if (showalert == "showAlert") {
            showToaster("error", "No Stage found, existing canvas")
        }
        exitApp();
    }
    Renderer.running = false;
    return
}

function objectAssign() {
    Object.assign = function(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(target);
        _.each(arguments, function(argument) {
            if (argument !== undefined && argument !== null) {
                for (var nextKey in argument) {
                    if (argument.hasOwnProperty(nextKey)) {
                        output[nextKey] = argument[nextKey];
                    }
                }
            }
        })
        return output;
    }
}

/*TODO: Need to Remove the LocalStorage Logic
Now HTML Contetnts are opening inside iframe */
var localStorageGC = {
    name: 'canvasLS',
    isHtmlContent: false,
    isCollection: false,
    content: {},
    collection: {},
    telemetryService: {},
    setItem: function(param, data) {
        if (data) {
            this[param] = _.isString(data) ? data : JSON.stringify(data);
        }
    },
    getItem: function(param) {
        if (param) {
            var paramVal = this[param];
            paramVal = _.isEmpty(paramVal) ? {} : JSON.parse(paramVal);
            return paramVal;
        } else {
            return;
        }
    },
    removeItem: function(param) {
        this[param] = {};
        //localStorage.removeItem(canvasLS.param);
    },
    save: function() {
        // Storing into localStorage
        var thisData = {};
        thisData.content = this.content;
        thisData.collection = this.collection;
        thisData.telemetryService = this.telemetryService;
        thisData.isCollection = this.isCollection;
        thisData.isHtmlContent = this.isHtmlContent;

        localStorage.setItem(this.name, JSON.stringify(thisData));
    },
    clear: function() {
        localStorage.removeItem(this.name);
    },
    update: function() {
        //gettting from localstorage and updating all its values
        var lsData = localStorage.getItem(this.name);
        if (lsData) {
            lsData = JSON.parse(lsData);
            var lsKeys = _.keys(lsData);
            var instance = this;
            _.each(lsKeys, function(key) {
                instance.setItem(key, lsData[key]);
            })
        }
    }
}

function startTelemetry(id, ver, cb) {
    localStorageGC.removeItem("telemetryService");
    var correlationData = [];
    if (!_.isEmpty(GlobalContext.game.contentExtras) && !_.isUndefined(GlobalContext.game.contentExtras)) {
        GlobalContext.game.contentExtras = ("string" == typeof(GlobalContext.game.contentExtras)) ? JSON.parse(GlobalContext.game.contentExtras) : GlobalContext.game.contentExtras;
        // for (var parentTree = '', contentExtrasLength = GlobalContext.game.contentExtras.length - 1, i = 0; i < contentExtrasLength && (parentTree += GlobalContext.game.contentExtras[i].identifier, i != contentExtrasLength - 1); i += 1) parentTree += "/";
        // correlationData = [{
        //     "id": parentTree,
        //     "type": GlobalContext.game.contentExtras[0].contentType
        // }];
        correlationData.push(GlobalContext.game.contentExtras);
    }
    var otherData = GlobalContext.config.otherData;
    if (!_.isUndefined(otherData) && !_.isUndefined(otherData.cdata)) {
        _.each(otherData.cdata, function(cdata) {
            correlationData.push(cdata);
        })
        delete otherData.cdata;
    }
    correlationData.push({"id": CryptoJS.MD5(Math.random().toString()).toString(), "type": "ContentSession"});
    TelemetryService.init(GlobalContext.game, GlobalContext.user, correlationData, otherData).then(function(response) {
        var data = {};
        data.mode =  getPreviewMode();
        TelemetryService.start(id, ver, data);
        if (!_.isUndefined(TelemetryService.instance)) {
            var tsObj = _.clone(TelemetryService);
            tsObj._start = JSON.stringify(tsObj.instance._start);
            tsObj._end = JSON.stringify(tsObj.instance._end);
            localStorageGC.setItem("telemetryService", tsObj);
            localStorageGC.save();
        }
        if (!_.isUndefined(cb) && response == true) {
            cb();
        }
    }).catch(function(error) {
        EkstepRendererAPI.logErrorEvent(error, {'type':'system','action':'play','severity':'fatal'});
        showToaster('error', 'TelemetryService init failed.');
        exitApp();
    });
}

function getAsseturl(content) {
    var content_type = content.mimeType == 'application/vnd.ekstep.html-archive' ? "html/" : "ecml/";
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    var path = window.location.origin + globalConfig.s3ContentHost + content_type;
    path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
    return path;

}
//ref: http://www.jqueryscript.net/other/Highly-Customizable-jQuery-Toast-Message-Plugin-Toastr.html
function showToaster(toastType, message, customOptions) {
    var defaultOptions = {"positionClass": "toast-top-right", "preventDuplicates": true, "tapToDismiss": true, "hideDuration": "1000", "timeOut": "4000", };
    toastr.options = _.extend(defaultOptions, customOptions);
    if (toastType === 'warning') {
        toastr.warning(message);
    }
    if (toastType === 'error') {
        toastr.error(message);
    }
    if (toastType === 'info') {
        toastr.info(message);
    }
}

function addWindowUnloadEvent() {
    // TODO: Use Iframe unload event
    window.onbeforeunload = function(e) {
        e = e || window.event;
        var y = e.pageY || e.clientY;
        !y && EkstepRendererAPI.getTelemetryService().interrupt('OTHER', EkstepRendererAPI.getCurrentStageId()); EkstepRendererAPI.dispatchEvent("renderer:content:close");
    };
    if (EkstepRendererAPI.getGlobalConfig().context.mode === 'edit') {
        parent.document.getElementsByTagName('iframe')[0].contentWindow.onunload = function() {
            EkstepRendererAPI.getTelemetryService().interrupt('OTHER', EkstepRendererAPI.getCurrentStageId());
            EkstepRendererAPI.dispatchEvent("renderer:content:close");
        }
    }
}

function compareObject(obj1, obj2) {
    //Loop through properties in object 1
    for (var p in obj1) {
        //Check property exists on both objects
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

        switch (typeof (obj1[p])) {
            //Deep compare objects
            case 'object':
                if (!Object.compare(obj1[p], obj2[p])) return false;
                break;
            //Compare function code
            case 'function':
                if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                break;
            //Compare values
            default:
                if (obj1[p] != obj2[p]) return false;
        }
    }

    //Check object 2 for any extra properties
    for (var p in obj2) {
        if (typeof (obj1[p]) == 'undefined') return false;
    }
    return true;
}

function getPreviewMode() {
   var mode = 'preview';
    if ("undefined" != typeof cordova) {
        mode = !_.isUndefined(GlobalContext.config.mode) ? GlobalContext.config.mode : 'play';
    } else if (EkstepRendererAPI.getGlobalConfig().context.mode){
        mode = EkstepRendererAPI.getGlobalConfig().context.mode;
    }
    return mode;
}

function logContentProgress(value) {
    if (_.isUndefined(value)) {
        if (!_.isUndefined(Renderer)) {
            var stageLenth = Renderer.theme._data.stage.length;
            var currentIndex = _.findIndex(Renderer.theme._data.stage, {
                id: Renderer.theme._currentScene.id
            });
            currentIndex = currentIndex + 1;
            return (currentIndex / stageLenth) * 100;
        } else {
            return 100;
        }
    } else {
        return value;
    }
}

function setGlobalConfig(context) {
    if (!_.isUndefined(context)) {
        var AppConfigCopy = _.clone(AppConfig);
        var globalConfig = _.clone(AppConfig);
        globalConfig = _.extend(globalConfig, context);
        _.each(AppConfigCopy.contentLaunchers, function(launchers) {
            globalConfig.contentLaunchers.push(launchers)
        })
        _.each(AppConfigCopy.mimetypes, function(mimetype) {
            globalConfig.mimetypes.push(mimetype)
        })
        if (_.isUndefined(window.cordova)) {
            org.ekstep.service.renderer.api.setBaseUrl(globalConfig.host + globalConfig.apislug);
        }

        var otherData = {};
        for (var i = 0; i < globalConfig.telemetryEventsConfigFields.length; i++) {
            var data = globalConfig[globalConfig.telemetryEventsConfigFields[i]] || globalConfig[globalConfig.telemetryEventsConfigFields[i]];
            if (!_.isUndefined(data)) otherData[globalConfig.telemetryEventsConfigFields[i]] = data;
        }
        var etags = {
            'dims':otherData.dims || AppConfig.etags.dims,
            'app':otherData.app || AppConfig.etags.app,
            'partner':otherData.partner ||  AppConfig.etags.partner
        };
        otherData.etags = etags;
        delete otherData.dims;
        delete otherData.app;
        delete otherData.partner;
        if (globalConfig.context) {
            delete globalConfig.context.config;
            delete globalConfig.context.data;
            delete globalConfig.context.metadata;
        }
        GlobalContext.config = globalConfig;
        GlobalContext.config.otherData = otherData;
        window.globalConfig = GlobalContext.config;
    } else {
        window.globalConfig = _.clone(AppConfig);
    }
}

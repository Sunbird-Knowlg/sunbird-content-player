var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive"

// Need to modify the scope level hasStageSet
// hasStageSet = true

function startProgressBar(w, setInter, name) {
    jQuery('#loading').show();
    jQuery("#progressBar").width(0);
    jQuery('#loadingText').text(name);
    var elem = document.getElementById("progressBar");
    var width = w ? w : 20;
    var id = setInterval(frame, setInter ? setInter : 0.7);

    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            if (elem && elem.style)
                elem.style.width = width + '%';
            jQuery('#progressCount').text(width + '%');
        }
    }
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
    // window.dispatchEvent(evt);
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

function backbuttonPressed(pageId) {
    var data = (Renderer.running || HTMLRenderer.running) ? {
        type: 'EXIT_CONTENT',
        stageId: Renderer.theme ? Renderer.theme._currentStage : ""
    } : {
        type: 'EXIT_APP'
    };
    TelemetryService.interact('END', 'DEVICE_BACK_BTN', 'EXIT', data);
    if (pageId == "coverpage") {
        TelemetryService.end();
    }
    AudioManager.stopAll();
}

// TODO: After integration with Genie, onclick of exit we should go to previous Activity of the Genie.
// So, change exitApp to do the same.
function exitApp(pageId) {
    TelemetryService.interact("TOUCH", "gc_genie", "TOUCH", {
        stageId: ((pageId == "renderer" && GlobalContext.config.appInfo.mimeType != "application/vnd.ekstep.content-collection" ? Renderer.theme._currentStage : pageId))
    });
    try {
        TelemetryService.exit();
    } catch (err) {
        console.error('End telemetry error:', err.message);
    }
    localStorage.clear();
    localStorageGC = {};
    genieservice.endGenieCanvas();
}

function startApp(app) {
    if (!app) app = geniePackageName;
    if (!_.isUndefined(navigator) && !_.isUndefined(navigator.startApp)) {
        navigator.startApp.start(app, function(message) {
            exitApp();
            TelemetryService.exit(packageName, version)
        }, function(error) {
            if (app == geniePackageName)
                alert("Unable to start Genie App.");
            else {
                var bool = confirm('App not found. Do you want to search on PlayStore?');
                if (bool) cordova.plugins.market.open(app);
            }
        });
    }
}

function contentNotAvailable() {
    alert(AppMessages.NO_CONTENT_FOUND);
    exitApp();
}

function checkStage(showalert) {
    if (GlobalContext.config.appInfo.mimeType == 'application/vnd.ekstep.content-collection') {
        if (showalert == "showAlert") {
            alert("No stage found, redirecting to collection list page")
        }
        exitApp();
    } else {
        if (showalert == "showAlert") {
            alert("No Stage found, existing canvas")
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

// GC - GenieCanvas
var localStorageGC = {
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

        localStorage.setItem("canvasLS", JSON.stringify(thisData));
    },
    update: function() {
        //gettting from localstorage and updating all its values
        var lsData = localStorage.getItem("canvasLS");
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

function startTelemetry(id, ver) {
    localStorageGC.removeItem("telemetryService");
    var correlationData = [];
    if (GlobalContext.game.contentExtras) {
        GlobalContext.game.contentExtras = ("string" == typeof(GlobalContext.game.contentExtras)) ? JSON.parse(GlobalContext.game.contentExtras) : GlobalContext.game.contentExtras;
        for (var parentTree = '', contentExtrasLength = GlobalContext.game.contentExtras.length - 1, i = 0; i < contentExtrasLength && (parentTree += GlobalContext.game.contentExtras[i].identifier, i != contentExtrasLength - 1); i += 1) parentTree += "/";
        correlationData = [{
            "id": parentTree,
            "type": GlobalContext.game.contentExtras[0].contentType
        }];
    }
    TelemetryService.init(GlobalContext.game, GlobalContext.user, correlationData).then(function() {
        TelemetryService.start(id, ver);
        if (!_.isUndefined(TelemetryService.instance)) {
            var tsObj = _.clone(TelemetryService);
            tsObj._start = JSON.stringify(tsObj.instance._start);
            tsObj._end = JSON.stringify(tsObj.instance._end);
            localStorageGC.setItem("telemetryService", tsObj);
            localStorageGC.save();
        }
    }).catch(function(error) {
        console.log('TelemetryService init failed');
        alert('TelemetryService init failed.');
        exitApp();
    });
}

function getAsseturl(content) {
    var content_type = content.mimeType == 'application/vnd.ekstep.html-archive' ? "html/" : "ecml/";
    var path = window.location.origin + AppConfig.S3_content_host + content_type;
    path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
    return path;

}

var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive"

// Need to modify the scope level hasStageSet
    // hasStageSet = true

function startProgressBar(w, setInter) {
    var elem = document.getElementById("progressBar");
    var width = w ? w : 20;
    var id = setInterval(frame, setInter ? setInter : 0.7);
    function frame() {
        if (width >= 100) {
         clearInterval(id);
        } else {
        width++;
        if(elem && elem.style)
            elem.style.width = width + '%';
        jQuery('#progressCount').text(width + '%');
        }
    }
}
startProgressBar();
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
    if(pageId == "coverpage") {
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
    genieservice.endGenieCanvas();
}

function startApp(app) {
    if (!app) app = geniePackageName;
    navigator.startApp.start(app, function(message) {
            exitApp();
            TelemetryService.exit(packageName, version)
        },
        function(error) {
            if (app == geniePackageName)
                alert("Unable to start Genie App.");
            else {
                var bool = confirm('App not found. Do you want to search on PlayStore?');
                if (bool) cordova.plugins.market.open(app);
            }
        });
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
        window.location.hash = "#/content/list/"+ GlobalContext.previousContentId;
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
    Object.assign = function (target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(target);
        _.each(arguments, function(argument){
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

function startTelemetry(id,ver) {
    localStorage.removeItem('TelemetryService');
    localStorage.removeItem('_start');
    localStorage.removeItem('_end');
    TelemetryService.init(GlobalContext.game, GlobalContext.user);
    TelemetryService.start(id,ver);
    if (!_.isUndefined(TelemetryService.instance)) {
        localstorageFunction("TelemetryService", TelemetryService, 'setItem');
        /*var instance ={};
        instance = _.clone(TelemetryService.instance);
        instance._start= TelemetryService.instance._start;
        instance._end = TelemetryService.instance._end;
        TelemetryService.instance = instance;*/
        localstorageFunction("_end", TelemetryService.instance._end, 'setItem');
        localstorageFunction("_start", TelemetryService.instance._start, 'setItem');
    }
}

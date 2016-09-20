var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive",
    LANGUAGE_FONTS = {"english": "NotoSansDevanagari", 
                    "kannada":"NotoSansKannada",
                    "telugu": "NotoSansTelugu", 
                    "odia": "NotoSansOriya", 
                    "bengali": "NotoSansBengali",
                    "assamese": "NotoSansBengali",
                    "tamil": "NotoSansTamil"
                    };
                    
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

var _reloadInProgress = false;
function reloadStage() {
    if (_reloadInProgress) {
        return;
    }
    _reloadInProgress = true;
    setTimeout(function() {
        var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
        if (plugin) plugin.reload({
            type: "command",
            command: "reload",
            duration: "100",
            ease: "linear",
            effect: "fadeIn",
            asset: Renderer.theme._currentStage
        });
    }, 500);
    TelemetryService.interact("TOUCH", "gc_reload", "TOUCH", {stageId : Renderer.theme._currentStage});
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
        stageId: ((pageId == "renderer" ? Renderer.theme._currentStage : pageId))
    });
    try {
        TelemetryService.exit();
    } catch (err) {
        console.error('End telemetry error:', err.message);
    }
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

function getNavigateTo(navType) {
    var navigation = [];
    var navigateTo = undefined;
    if (!_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
        navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
        var direction = _.findWhere(navigation, {
            name: navType
        });
        if (direction) navigateTo = direction.value;
    }
    return navigateTo;
}

var submitOnNextClick = true;
function navigate(navType) {
    TelemetryService.interact("TOUCH", navType, null, {stageId : Renderer.theme._currentStage});
    var navigateTo = getNavigateTo(navType);

    if(_.isUndefined( Renderer.theme._currentScene)){
        return;
    }

    if(submitOnNextClick && OverlayHtml.isItemScene() && ("next" == navType)){
        evalAndSubmit();
        return;
    }

    submitOnNextClick = true;
    var changeScene = function() {
        var action = {
            "asset": Renderer.theme._id,
            "command": "transitionTo",
            "duration": "100",
            "ease": "linear",
            "effect": "fadeIn",
            "type": "command",
            "pluginId": Renderer.theme._id,
            "value": navigateTo
        };
        action.transitionType = navType;
        // Renderer.theme.transitionTo(action);
        CommandManager.handle(action);
    };
    if ("undefined" == typeof navigateTo && "next" == navType) {
        if (OverlayHtml.isItemScene() && Renderer.theme._currentScene._stageController.hasNext()) {
            changeScene();
        } else {
            if(config.showEndPage) {
                console.info("redirecting to endpage.");
                window.location.hash = "/content/end/" + GlobalContext.currentContentId;
                AudioManager.stopAll();
            } else {
                console.warn("Cannot move to end page of the content. please check the configurations..");
            }
        }
    } else {
        changeScene();
    }
}

function evalAndSubmit(){
    //If any one option is selected, then only allow user to submit
    var action = {
        "type": "command",
        "command": "eval",
        "asset": Renderer.theme._currentStage,
        "pluginId": Renderer.theme._currentStage
    };
    action.htmlEval = "true";
    action.success = "correct_answer";
    action.failure = "wrong_answer";
    CommandManager.handle(action);
}

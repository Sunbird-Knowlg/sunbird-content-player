var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive"

function removeRecordingFiles(path) {
    _.each(RecorderManager.mediaFiles, function(path) {
        $cordovaFile.removeFile(cordova.file.dataDirectory, path)
            .then(function(success) {
                // success
                console.log("success : ", success);
            }, function(error) {
                // error
                console.log("err : ", error);
            });
    })
}

function reloadStage(){
    var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
     if (plugin) plugin.reload({type:"command" ,command:"reload", duration: "500", ease: "linear", effect: "fadeIn", asset: Renderer.theme._currentStage});
}

function goToHome($state, isCollection, id, pageId) {
    
    if(isCollection){
        // TelemetryService.interract("TOUCH", (Renderer && Renderer.theme && Renderer.theme._currentStage) ? Renderer.theme._currentStage : pageId);
        TelemetryService.interact("TOUCH", "home", "TOUCH", {stageId : ((pageId == "renderer" ? Renderer.theme._currentStage : pageId))});
        $state.go('contentList', { "id": id });
    }
     if(Renderer.running) {
        TelemetryService.exit();
    }

    // if(Renderer.running){
    //     $state.go('showContent', { "contentId": id });
    // } else{
    //     if(GlobalContext.previousContentId)
            // $state.go('contentList', { "id": id });
    // }
        
}


function backbuttonPressed() {
    var data = (Renderer.running || HTMLRenderer.running) ? {
        type: 'EXIT_CONTENT',
        stageId: Renderer.theme._currentStage
    } : {
        type: 'EXIT_APP'
    };
    TelemetryService.interact('END', 'DEVICE_BACK_BTN', 'EXIT', data);
}

// TODO: After integration with Genie, onclick of exit we should go to previous Activity of the Genie.
// So, change exitApp to do the same.
function exitApp(pageId) {
    // TelemetryService.interrupt("OTHER", );
    TelemetryService.interact("TOUCH", "genie", "TOUCH", {stageId : ((pageId == "renderer" ? Renderer.theme._currentStage : pageId))});
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
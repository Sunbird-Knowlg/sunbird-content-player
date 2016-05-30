var packageName = "org.ekstep.quiz.app",
    version = AppConfig.version,
    packageNameDelhi = "org.ekstep.delhi.curriculum",
    geniePackageName = "org.ekstep.genieservices",

    CONTENT_MIMETYPES = ["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    COLLECTION_MIMETYPE = "application/vnd.ekstep.content-collection",
    ANDROID_PKG_MIMETYPE = "application/vnd.android.package-archive",
    count_iterate_item = 1;

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

function reloadStage() {
    var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
    if (plugin) plugin.reload({
        type: "command",
        command: "reload",
        duration: "500",
        ease: "linear",
        effect: "fadeIn",
        asset: Renderer.theme._currentStage
    });
}

function goToHome($state, isCollection, id, pageId) {
    if (isCollection) {
        // TelemetryService.interract("TOUCH", (Renderer && Renderer.theme && Renderer.theme._currentStage) ? Renderer.theme._currentStage : pageId);
        TelemetryService.interact("TOUCH", "gc_home", "TOUCH", {
            stageId: ((pageId == "renderer" ? Renderer.theme._currentStage : pageId))
        });
        if (Renderer.running)
            Renderer.cleanUp();
        else
            TelemetryService.end();
        $state.go('contentList', {
            "id": id
        });

    }
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
    if (!_.isEmpty(Renderer.theme._currentScene._data.param)) {
        navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
        var direction = _.findWhere(navigation, {
            name: navType
        });
        if (direction) navigateTo = direction.value;
    }
    return navigateTo;
}

function navigate(navType) {
    var navigateTo = getNavigateTo(navType);
    if (OverlayHtml.isItemScene() && "undefined" == typeof navigateTo && "next" == navType) {
        count_iterate_item++;
        var ctrl_total_items = Renderer.theme._currentScene._stageController;
        if (count_iterate_item > ctrl_total_items._repeat) {
            window.location.hash = "/content/end/" + GlobalContext.currentContentId;
        }
    }

    if ("undefined" == typeof navigateTo && "next" == navType && !OverlayHtml.isItemScene()) {
        console.info("redirecting to endpage.");
        window.location.hash = "/content/end/" + GlobalContext.currentContentId;
    } else {
        var action = {
            "asset": Renderer.theme._id,
            "command": "transitionTo",
            "duration": "100",
            "ease": "linear",
            "effect": "fadeIn",
            "type": "command",
            "value": navigateTo
        };
        action.transitionType = navType;
        Renderer.theme.transitionTo(action);
        var navigate = angular.element("navigate");
        navigate.trigger("navigateUpdate", {
            'show': false
        });

        jQuery('popup').hide();
    }
}
var endPage = angular.module("sunbird-endpage",[]);
endPage.controller("endPageController", function($scope, $rootScope, $state,$element, $stateParams) {
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    $scope.showEndPage = false;
    $rootScope.pageId = "sunbird-player-Endpage";
    $scope.pluginManifest = {"id": "org.sunbird.player.endpage", "ver": "1.1"};
    $scope.genieIcon;
    $scope.endpageBackground;
    $scope.replayIcon;
    $scope.isCordova = window.cordova ? true : false;
    $scope.pluginInstance = {};
    $scope.arrayToString = function(array) {
        return (_.isString(array)) ? array : (!_.isEmpty(array) && _.isArray(array)) ? array.join(", ") : "";
    };
    $scope.setLicense = function(){
        $scope.licenseAttribute = $scope.playerMetadata.license || 'Licensed under CC By 4.0 license'
    };

    $scope.getTotalScore = function(id) {
        if ("undefined" != typeof cordova) {
            org.ekstep.service.content.getLearnerAssessment(GlobalContext.user.uid, id, GlobalContext.game.contentExtras)
                .then(function(score) {
                    if (score && score.total_questions) {
                        $scope.$apply(function() {
                            $scope.score = (score.total_correct + "/" + score.total_questions);
                        });
                    } else {
                        $scope.score = undefined;
                    }
                })
        } else {
            $scope.score = undefined;
        }
    };

    $scope.replayContent = function() {
        EventBus.dispatch("event:openUserSwitchingModal", {'logGEEvent': $scope.pluginInstance._isAvailable});
    };
    $scope.replayCallback = function(){
        EkstepRendererAPI.hideEndPage();
        EkstepRendererAPI.dispatchEvent('renderer:content:replay');
    };
    
    $scope.setTotalTimeSpent = function() {
        var endEvent = _.filter(TelemetryService._data, function(event) {
            if (event) {
                return event.name == "OE_END";
            }
        })
        var startTime = endEvent.length > 0 ? endEvent[endEvent.length - 1].startTime : 0;
        if (startTime) {
            var totalTime = Math.round((new Date().getTime() - startTime) / 1000);
            var mm = Math.floor(totalTime / 60);
            var ss = Math.floor(totalTime % 60);
            $scope.totalTimeSpent = (mm > 9 ? mm : ("0" + mm)) + ":" + (ss > 9 ? ss : ("0" + ss));
        } else {
            $scope.showFeedbackArea = false;
        }
    };
    $scope.openGenie = function(){
        EkstepRendererAPI.dispatchEvent('renderer:genie:click');
    };
    
    $scope.handleEndpage = function() {
        $scope.setLicense();
        if (_(TelemetryService.instance).isUndefined()) {
            var otherData = GlobalContext.config.otherData;
            !_.isUndefined(otherData.cdata) ? correlationData.push(otherData.cdata) : correlationData.push({"id": CryptoJS.MD5(Math.random().toString()).toString(),"type": "ContentSession"});
            TelemetryService.init(tsObj._gameData, tsObj._user, correlationData, otherData);
        }

        TelemetryService.interact("TOUCH", $rootScope.content.identifier, "TOUCH", {
            stageId: "ContentApp-EndScreen",
            subtype: "ContentID"
        });
       
        setTimeout(function() {
            $rootScope.$apply();
        }, 1000);
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        $scope.setTotalTimeSpent();
        $scope.getTotalScore($rootScope.content.identifier);
        if (TelemetryService.instance.telemetryStartActive()) {
                var telemetryEndData = {};
                telemetryEndData.stageid = getCurrentStageId();
                telemetryEndData.progress = logContentProgress();
                TelemetryService.end(telemetryEndData);
        } else {
              console.warn('Telemetry service end is already logged Please log start telemetry again');
        }
    };
    $scope.initEndpage = function() {
        $scope.playerMetadata = content;
        $scope.genieIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/home.svg");
        $scope.scoreIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/score.svg");
        $scope.leftArrowIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/left-arrow.svg");
        $scope.rightArrowIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/right-arrow.svg");
        $scope.clockIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/clock.svg");
        $scope.replayIcon = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/replay.svg");
        $scope.endpageBackground = EkstepRendererAPI.resolvePluginResource($scope.pluginManifest.id, $scope.pluginManifest.ver, "renderer/assets/endpageBackground.png");
        $scope.handleEndpage();
    };
    EkstepRendererAPI.addEventListener('renderer:content:end', function() {
            $scope.initEndpage();
            $scope.safeApply();
    });
    EkstepRendererAPI.addEventListener('renderer:endpage:show', function() {
        $scope.showEndPage = true;
        $scope.initEndpage();
        $scope.safeApply();
    });
    EkstepRendererAPI.addEventListener('renderer:endpage:hide',function() {
        $scope.showEndPage = false;
        $scope.safeApply();
    });
});
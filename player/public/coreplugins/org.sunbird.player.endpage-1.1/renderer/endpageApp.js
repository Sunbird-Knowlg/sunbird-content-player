var endPage = angular.module("sunbird-endpage",[]);
endPage.controller("endPageController", function($scope, $rootScope, $state,$element, $stateParams) {
    var globalConfig = EkstepRendererAPI.getGlobalConfig();
    $scope.showEndPage = false;
    $rootScope.pageId = "sunbird-player-Endpage";
    $scope.pluginManifest = {"id": "org.sunbird.player.endpage", "ver": "1.1"};
    $scope.genieIcon;
    $scope.endpageBackground;
    $scope.replayIcon;
    /**
     * @property - {Object} which holds previous content of current content
     */     
    $scope.previousContent = {};
    /**
     * @property - {Object} which holds next content of current content
     */
    $scope.nextContent = {};
    $scope.isCordova = window.cordova ? true : false;
    $scope.pluginInstance = {};
    $scope.arrayToString = function(array) {
        return (_.isString(array)) ? array : (!_.isEmpty(array) && _.isArray(array)) ? array.join(", ") : "";
    };
    $scope.setLicense = function(){
        $scope.licenseAttribute = $scope.playerMetadata.license || 'Licensed under CC By 4.0 license'
    };

    $scope.getTotalScore = function(id) {
        var totalScore = 0, maxScore = 0;
        var teleEvents = org.ekstep.service.content.getTelemetryEvents();
        if (!_.isEmpty(teleEvents) && !_.isUndefined(teleEvents.assess)) {
            _.forEach(teleEvents.assess, function(value) {
                if(value.edata.score) {
                    totalScore = totalScore + value.edata.score;
                }
                if(value.edata.item.maxscore) {
                    maxScore = maxScore + value.edata.item.maxscore;
                } else {
                    maxScore = maxScore + 0;
                }
            });
            $scope.score = ($scope.convert(totalScore) + "/" + $scope.convert(maxScore));
        } else {
            $scope.score = undefined;
        }
    };
   
    $scope.replayContent = function() {
        if(isMobile && ($rootScope.users.length > 1)) {
            EkstepRendererAPI.dispatchEvent("event:openUserSwitchingModal", {'logGEEvent': $scope.pluginInstance._isAvailable});
        }else {
            $scope.replayCallback();
        }
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
        $scope.getRelevantContent($rootScope.content.identifier);
    };
    
    /**
     * @description - which helps to get previous and next content of current content
     */
    $scope.getRelevantContent = function(contentId){
        if (!isbrowserpreview) {
            if(!_.has($scope.previousContent, contentId) && !_.has($scope.nextContent, contentId)){
                var requestBody = {
                    "contentIdentifier": contentId,
                    "hierarchyInfo": $rootScope.content.hierarchyInfo,
                    "next": true,
                    "prev": true
                };
                //Call getPreviousAndNextContent function which is present inside interfaceService.js by passing current content-id and user-id 
                org.ekstep.service.content.getRelevantContent(JSON.stringify(requestBody)).then(function(response){
                    if(response){
                        $scope.previousContent[contentId] = response.prev;
                        $scope.nextContent[contentId] = response.next;
                    } else{
                        console.log('Error has occurred');
                    }
                });
            }
        }
    };

    /**
     * @description - to play next or previous content
     */
    $scope.contentLaunch = function(contentType, contentId) {
        var eleId = (contentType === 'previous') ? "gc_previousContent" : "gc_nextcontentContent";
        TelemetryService.interact("TOUCH", eleId, "TOUCH", {
            stageId: "ContentApp-EndScreen",
            plugin: $scope.pluginManifest
        }, "GE_INTERACT");

        var contentToPlay = (contentType === 'previous') ? $scope.previousContent[contentId] : $scope.nextContent[contentId];
        var contentMetadata = {};
        if(contentToPlay){
            contentMetadata = contentToPlay.content.contentData;
            _.extend(contentMetadata,  _.pick(contentToPlay.content, "hierarchyInfo", "isAvailableLocally", "basePath", "rollup"));
            contentMetadata.basepath = contentMetadata.basePath;
        }

        if (contentToPlay.content.isAvailableLocally) {
                EkstepRendererAPI.hideEndPage();
                var object = {
                    'config': GlobalContext.config,
                    'data': undefined,
                    'metadata': contentMetadata
                }
                GlobalContext.config = mergeJSON(AppConfig, contentMetadata);
                window.globalConfig = GlobalContext.config;

                $rootScope.content = window.content = content = contentMetadata;
                org.ekstep.contentrenderer.initializePreview(object)
                EkstepRendererAPI.dispatchEvent('renderer:player:show');
        } else {
            if(globalConfig.deeplinkBasePath){
                var deepLinkURL = globalConfig.deeplinkBasePath + "c/" + contentToPlay.content.identifier + "?hierarchyInfo=" + JSON.stringify($rootScope.content.hierarchyInfo);
                window.open(deepLinkURL, "_system");
            } else {
                console.warn(window.AppLables.noDeeplinkBasePath);
            }
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
        org.ekstep.service.content.clearTelemetryEvents();
        $scope.safeApply();
    });
    $scope.precision = function(a) {
        if (!isFinite(a)) return 0;
        var e = 1,
            p = 0;
        while (Math.round(a * e) / e !== a) {
            e *= 10;
            p++;
        }
        return p;
    };

    $scope.convert = function(totalScore) {
        if ((!isNaN(totalScore) && totalScore.toString().indexOf('.') != -1)) {
            var precisionLen = $scope.precision(totalScore);
            return precisionLen > 1 ? totalScore.toFixed(2) : totalScore;
        } else {
            return totalScore
        }
    };
     
});
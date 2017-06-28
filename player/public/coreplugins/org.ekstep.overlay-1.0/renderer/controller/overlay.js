'use strict';

app.controllerProvider.register("OverlayController", function($scope, $rootScope, $compile, $stateParams) {
    $rootScope.isItemScene = false;
    $rootScope.menuOpened = false;
    $rootScope.stageId = undefined;
    $scope.state_off = "off";
    $scope.state_on = "on";
    $scope.state_disable = "disable";
    $scope.showOverlayNext = true;
    $scope.showOverlayPrevious = true;
    $scope.showOverlaySubmit = false;
    $scope.showOverlayGoodJob = false;
    $scope.showOverlayTryAgain = false;
    $scope.overlayEvents = ["overlayNext", "overlayPrevious", "overlaySubmit", "overlayMenu", "overlayReload", "overlayGoodJob", "overlayTryAgain"];
    $scope.showOverlay = false;

    $scope.init = function() {
        if (GlobalContext.config.language_info) {
            var languageInfo = JSON.parse(GlobalContext.config.language_info);
            for (key in languageInfo) {
                $rootScope.languageSupport[key] = languageInfo[key];
            }
        }

        var evtLenth = $scope.overlayEvents.length;
        for (var i = 0; i < evtLenth; i++) {
            var eventName = $scope.overlayEvents[i];
            EventBus.addEventListener(eventName, $scope.overlayEventHandler, $scope);
        }
		EventBus.addEventListener("sceneEnter", function(data) {
			$rootScope.stageData = data.target;
			//TODO: Remove this currentStage parameter and use directly stageData._currentStage
			$rootScope.stageId = !_.isUndefined($rootScope.stageData) ? $rootScope.stageData._id : undefined;
		});
        EkstepRendererAPI.addEventListener("renderer:init:overlay", $scope.loadOverlay);
        EkstepRendererAPI.addEventListener("renderer:show:overlay", function(event) {
            $scope.showOverlay = true;
            $scope.safeApply();
        });
    }

    $scope.loadOverlay = function() {
        var gameArea = angular.element('#gameArea');
        /*gameArea.append("<div ng-include="+ this.templatePath+">");
        $compile(gameArea)($scope);*/
    }

    $rootScope.defaultSubmit = function() {
        EventBus.dispatch("actionDefaultSubmit");
    }

    $scope.openUserSwitchingModal = function() {
        TelemetryService.interact("TOUCH", "gc_open_userswitch", "TOUCH", {
            stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
        });
        EventBus.dispatch("event:openUserSwitchingModal");
        $scope.hideMenu();
    }

    $scope.navigate = function(navType) {
        if (!$rootScope.content) {
            // if $rootScope.content is not available get it from the base controller
            org.ekstep.contentrenderer.getContentMetadata($stateParams.itemId);
        }
        GlobalContext.currentContentId = $rootScope.content.identifier;
        GlobalContext.currentContentMimeType = $rootScope.content.mimeType;
        if (navType === "next") {
            EventBus.dispatch("actionNavigateNext", navType);
            EventBus.dispatch("nextClick");

        } else if (navType === "previous") {
            EventBus.dispatch("actionNavigatePrevious", navType);
            EventBus.dispatch("previousClick");
        }
    }

    $scope.overlayEventHandler = function(event) {
        // console.log("Event", event);
        //Switch case to handle HTML elements(Next, Previous, Submit, etc..)
        switch (event.type) {
            case "overlayNext":
                $scope.showOverlayNext = event.target;
                break;
            case "overlayPrevious":
                $scope.showOverlayPrevious = event.target;
                break;
            case "overlaySubmit":
                if (event.target === "off") {
                    $scope.showOverlaySubmit = false;
                } else {
                    $scope.showOverlaySubmit = true;
                    (event.target === "disable") ? $rootScope.enableEval = false: $rootScope.enableEval = true;
                }
                break;
            case "overlayMenu":
                break;
            case "overlayReload":
                break;
            case "overlayGoodJob":
                $scope.showOverlayGoodJob = event.target;
                break;
            case "overlayTryAgain":
                $scope.showOverlayTryAgain = event.target;
                break;
            default:
                console.log("Default case got called..");
                break;
        }
        $rootScope.safeApply();
    }

    $scope.openMenu = function() {
        //display a layer to disable clicking and scrolling on the gameArea while menu is shown
        if (jQuery('.menu-overlay').css('display') == "block") {
            $scope.hideMenu();
            return;
        }
        $scope.menuOpened = true;
        TelemetryService.interact("TOUCH", "gc_menuopen", "TOUCH", {
            stageId: $rootScope.stageId
        });
        jQuery('.menu-overlay').css('display', 'block');
        jQuery(".gc-menu").show();
        jQuery(".gc-menu").animate({
            "marginLeft": ["0%", 'easeOutExpo']
        }, 700, function() {});
    }

    $scope.hideMenu = function() {
        $scope.menuOpened = false;
        TelemetryService.interact("TOUCH", "gc_menuclose", "TOUCH", {
            stageId: $rootScope.stageId
        });
        jQuery('.menu-overlay').css('display', 'none');
        jQuery(".gc-menu").animate({
            "marginLeft": ["-31%", 'easeOutExpo']
        }, 700, function() {});
    }

    $scope.init();
});

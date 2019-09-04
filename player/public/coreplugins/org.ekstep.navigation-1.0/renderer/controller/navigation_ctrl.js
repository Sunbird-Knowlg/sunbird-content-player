'use strict';

var editor = angular.module('genie-canvas', [])
editor.directive('customNextNavigation', function () {
  return {
    restrict: 'E',
    template:  '<ng-include src="getTemplateUrl()" ng-click="navigate(\'next\')"/>',
    scope: true,
    link: function ($scope) {
      $scope.customNextIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.navigation", "1.0", "renderer/assets/next.png");
      var events = ["overlayNext", "renderer:next:hide", "renderer:next:show"];
      $scope.getTemplateUrl = function() {
        // return 'tesasldakdadt.html';
        console.log($scope.showPlayerPart, "this is the player part");
        if($scope.showPlayerPart){
          var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation")				
          return alertPluginInstance.custom_top_next
        }else{
          var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation")	
          console.log(alertPluginInstance.default_middle_next);							
          return alertPluginInstance.default_middle_next
        }        
      }      
      $scope.toggleNav = function (event) {
        var val;
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var defaultValue = globalConfig.overlay.showNext ? "on" : "off";
        var hideDefaultNext = function () {
          $timeout(function () {
            jQuery('next-navigation').hide();
          }, 50);
        };
        switch (event.type) {
          /**
           * renderer:next:show Event to show next navigation icon.
           * @event renderer:next:show
           * @listen renderer:next:show
           * @memberOf EkstepRendererEvents
           */
          case "renderer:next:show":
            val = "on";
            hideDefaultNext();
            break;
          /**
           * renderer:next:hide Event to hide next navigation icon.
           * @event renderer:next:hide
           * @listen renderer:next:hide
           * @memberOf EkstepRendererEvents
           */
          case "renderer:next:hide":
            val = "off";
            hideDefaultNext();
            break;
          case "overlayNext":
            val = event.target ? event.target : defaultValue;
            hideDefaultNext();
            break;
        }
        
        $scope.showCustomNext = val;
        $rootScope.safeApply();
      };
      _.each(events, function (event) {
        EkstepRendererAPI.addEventListener(event, $scope.toggleNav, $scope)
      });
    }
  }
})
  
editor.directive('customPreviousNavigation', function ($rootScope, $timeout) {
  return {
    restrict: 'E',
    // template: '',
    // template: '< ng-include src="getTemplateUrl()" ng-click="navigate(\'previous\')"/>',
    template: '<ng-include src="getTemplateUrl()" ng-click="navigate(\'previous\')"/>',
    link: function ($scope) {
      var events = ["overlayPrevious", "renderer:previous:hide", "renderer:previous:show", "renderer:previous:disable", "renderer:previous:enable"];
      $scope.customePreviousIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.navigation", "1.0", "renderer/assets/previous.png");
      $scope.changeValue = function (event) {
        var val;
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var defaultValue = globalConfig.overlay.showPrevious ? "on" : "off";
        var hideDefaultPrevious = function () {
          $timeout(function () {
            jQuery('previous-navigation').hide();
          }, 50);
        };
        $scope.getTemplateUrl = function() {

          // return 'tesasldakdadt.html';
          if($scope.showPlayerPart){
            var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation")
            return alertPluginInstance.custom_top_previous;
          }else{
            var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation")
            console.log(alertPluginInstance.default_middle_previous, "middle");				
            return alertPluginInstance.default_middle_previous
          }    
          
        }
        var disablePrevious = function () {
          var val = "";
          var navigateToStage = EkstepRendererAPI.getStageParam('previous');
          var stage = EkstepRendererAPI.getCurrentStage();
          if (stage && _.isUndefined(navigateToStage)) {
            val = "disable";
            hideDefaultPrevious();
            if (EkstepRendererAPI.isItemScene() && EkstepRendererAPI.getCurrentController().hasPrevious()) {
              val = "enable"
            }
          } else {
            val = "enable"
          }
          return val;
        };
        switch (event.type) {
          case "overlayPrevious":
            val = event.target ? event.target : defaultValue;
            hideDefaultPrevious();
            break;
          /**
           * renderer:previous:show Event to show previous navigation icon.
           * @event renderer:previous:show
           * @listen renderer:previous:show
           * @memberOf EkstepRendererEvents
           */
          case "renderer:previous:show":
            hideDefaultPrevious();
            val = "on";
            break;
          /**
           * renderer:previous:hide Event to hide previous navigation icon.
           * @event renderer:previous:hide
           * @listen renderer:previous:hide
           * @memberOf EkstepRendererEvents
           */
          case "renderer:previous:hide":
            hideDefaultPrevious();
            val = "off";
            break;

          case "renderer:previous:disable":
            val = disablePrevious();
            break;

          case "renderer:previous:enable":
            val = "on";
            break;
        }
        if (val == "on" && event.type !== "renderer:previous:enable") {
          val = disablePrevious();
        }

        $scope.showCustomPrevious = val;
        $rootScope.safeApply();
      }
      _.each(events, function (event) {
        EkstepRendererAPI.addEventListener(event, $scope.changeValue, $scope)
      })
    }
  }
})

editor.controller("CustomNavigationCtrl", function ($scope, $rootScope, $compile, $stateParams, $timeout) {
  var globalConfig = EkstepRendererAPI.getGlobalConfig();
  $scope.customNavigationVisible = false;
  $rootScope.isItemScene = false;
  $rootScope.stageId = undefined;
  $scope.state_off = "off";
  $scope.state_on = "on";
  $scope.state_disable = "disable";
  $scope.overlayVisible = false;
  $scope.pluginInstance = undefined;
  $scope.showPlayerPart = false;
  $scope.init = function () {

    EkstepRendererAPI.addEventListener("renderer:content:start", $scope.showCustomNavigation);
    EkstepRendererAPI.addEventListener("renderer:overlay:show", $scope.showCustomNavigation);
    EkstepRendererAPI.addEventListener("renderer:overlay:hide", $scope.hideCustomNavigation);
    EkstepRendererAPI.addEventListener("renderer:content:reset", $scope.resetNavigation);
    EkstepRendererAPI.addEventListener("renderer:use:navigation:top", $scope.setPlayerConfig);

    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation");
    EkstepRendererAPI.addEventListener("sceneEnter", function (data) {
      $timeout(function () {
        $scope.showCustomNavigation();
      }, 0);
    });

    $timeout(function () {
      $scope.showCustomNavigation();
    }, 0);
    
    if ($scope.pluginInstance) {
      if (globalConfig.overlay.showOverlay) {
        $scope.customNavigationVisible = $scope.pluginInstance.customNavigationVisible;
        $scope.safeApply();
      }
    }
  };

  $scope.setPlayerConfig = function () {
    $scope.showPlayerPart = true;
    $scope.safeApply();
  }

  $scope.showCustomNavigation = function () {
    if (!globalConfig.overlay.showOverlay) return;
    $scope.customNavigationVisible = true;
    $scope.hideDefaultNavigation();
    $scope.safeApply();
  };

  $scope.resetNavigation = function(){
    $scope.pluginInstance._customNavigationPlugins = [];
  }

  $scope.hideDefaultNavigation = function () {
    $timeout(function () {
      jQuery('previous-navigation').hide();
      jQuery('next-navigation').hide();
      EkstepRendererAPI.dispatchEvent("renderer:previous:disable");
    }, 50);
  };

  $scope.hideCustomNavigation = function () {
    $scope.customNavigationVisible = false;
    $scope.safeApply();
  };

  $scope.navigate = function (navType) {
    var currentStageId = EkstepRendererAPI.getCurrentStageId();
    if (navType === "next") {
      /**
       * actionNavigateNext  event used to navigate to next stage from the current stage of the content.
       * @event actionNavigateNext
       * @fires actionNavigateNext
       * @memberof EkstepRendererEvents
       */
      EventBus.dispatch("renderer:navigation:next", currentStageId);

    } else if (navType === "previous") {
      /**
       * actionNavigatePrevious  event used to navigate to previous stage from the current stage of the content.
       * @event actionNavigatePrevious
       * @fires actionNavigatePrevious
       * @memberof EkstepRendererEvents
       */
      EventBus.dispatch("renderer:navigation:prev");
    }
  };

  $scope.init();
})

//# sourceURL=CustomNavigationCtrl.js

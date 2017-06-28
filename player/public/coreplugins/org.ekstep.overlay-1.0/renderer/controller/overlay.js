'use strict';

app.controllerProvider.register("OverlayController", function($scope, $compile) {
// app.controller("OverlayController", function($scope, $compile) {
		$scope.showOverlay = false;

		$scope.init = function(){
			console.log("Overlay Ctrl init")
			EkstepRendererAPI.addEventListener("renderer:init:overlay", $scope.loadOverlay);
			EkstepRendererAPI.addEventListener("renderer:show:overlay", function(event){
				console.log("renderer:show:overlay", event);
				$scope.showOverlay = true;
				$scope.safeApply();
		});
		}

		$scope.loadOverlay = function(){
			console.log("load Overlay");
			var gameArea = angular.element('#gameArea');
      /*gameArea.append("<div ng-include="+ this.templatePath+">");
      $compile(gameArea)($scope);*/
		}

		$scope.init();

		
});
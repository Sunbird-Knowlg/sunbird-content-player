'use strict';

app.controllerProvider.register("OverlayController", function($scope, $compile) {
// app.controller("OverlayController", function($scope, $compile) {
		$scope.init = function(){
			console.log("Overlay Ctrl init")
			EkstepRendererAPI.addEventListener("renderer:init:overlay", $scope.loadOverlay);
		}

		$scope.loadOverlay = function(){
			console.log("load Overlay");
			var gameArea = angular.element('#gameArea');
      /*gameArea.append("<div ng-include="+ this.templatePath+">");
      $compile(gameArea)($scope);*/
		}

		$scope.init();
		console.log("Overlay controller");
});
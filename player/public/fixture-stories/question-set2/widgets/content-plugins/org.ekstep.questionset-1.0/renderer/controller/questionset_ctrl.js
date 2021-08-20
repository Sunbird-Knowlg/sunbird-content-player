'use strict';
angular.module('genie-canvas')
.directive('templateContent', function () {
	/**
	 * Directive to dynamically include HTML content in the existing DOM
	 * Ex:
	 *    <template-content path="/path/to/file.html"></template-content>
	 */
	 return {
	 	restrict: 'E',
	 	scope: false,
	 	transclude: true,
	 	link: function (scope, element, attrs) {
	 		scope.contentUrl = attrs.path;
	 		attrs.$observe('path', function (p) {
	 			scope.contentUrl = p;
	 		});
	 	},
	 	template: '<div ng-include="contentUrl"></div>'
	 }
	})
.directive('qsGoodJob', function($rootScope) {
	return {
		restrict: 'AE',
		template: '<div class="popup"> <div class="popup-overlay" ng-click="hidePopup()"></div> <div class="popup-full-body"> <div class="font-lato assess-popup assess-goodjob-popup"> <div class="correct-answer" style=" text-align: center;"> <div class="banner"> <img ng-src="assets/icons/banner3.png" height="100%" width="100%" src="assets/icons/banner3.png"> </div> <div class="sign-board"> <img ng-src="assets/icons/check.png" id="correctButton" width="40%" src="assets/icons/check.png"> </div> </div> <div id="popup-buttons-container"> <div ng-keydown="$event.keyCode === 13 && hidePopup();moveNextStage();" ng-click="hidePopup();moveNextStage();" class="primary center button ng-binding" tabindex="0" aria-label="Next" role="button">Next</div> </div> </div> </div> </div>',
		link: function(scope, element, attrs) {
			EkstepRendererAPI.addEventListener('renderer:load:popup:goodJob', function (event) {
				element.show();
			});
			scope.hidePopup = function(){
				element.hide();
			}
			scope.moveNextStage = function(){
				EkstepRendererAPI.dispatchEvent('renderer:nextStage');
				scope.hidePopup();
				element.hide();
			}
		}
	}
})
.directive('qsTryAgain', function($rootScope) {
	return {
		restrict: 'AE',
		template: '<div class="popup"> <div class="popup-overlay" ng-click="tryAgainHidePopup()"></div> <div class="popup-full-body"> <div class="font-lato assess-popup assess-tryagain-popup"> <div class="wrong-answer" style=" text-align: center;"> <div class="banner"> <img ng-src="assets/icons/banner2.png" height="100%" width="100%" src="assets/icons/banner2.png"> </div> <div class="sign-board"><img ng-src="assets/icons/incorrect.png" width="40%" id="incorrectButton" src="assets/icons/incorrect.png"> </div> </div> <div id="popup-buttons-container"> <div ng-click="tryAgainHidePopup();moveNextStage();" tabindex="0" aria-label="Next" role="button" class="left button ng-binding">Next</div> <div ng-click="tryAgainSameQ();" tabindex="0" aria-label="Try Again" role="button" class="right primary button ng-binding">Try Again</div> </div> </div> </div> </div>',
		link: function(scope, element, attrs) {
			EkstepRendererAPI.addEventListener('renderer:load:popup:tryAgain', function (event) {
				element.show();
			});
			scope.tryAgainHidePopup = function(){
				element.hide();
			}
			scope.moveNextStage = function(){
				EkstepRendererAPI.dispatchEvent('renderer:nextStage');
				scope.tryAgainHidePopup();
				element.hide();
			}
			scope.tryAgainSameQ = function(){
				scope.tryAgainHidePopup();
				element.hide();
			}
		}
	}
})
.controllerProvider.register("questionsetctrl", function($scope, $ocLazyLoad,$compile) {

/**
 * Event handler to dynamically load HTML file and add it to DOM.
 * @event "renderer:load:html"
 */
 EkstepRendererAPI.addEventListener('renderer:load:html', function (event) {
 	var data = event.target;
 	if (data.path) {
 		$ocLazyLoad.load([{type: 'html', path: data.path}]).then(function () {
 			if (data.toElement) {
 				var element = angular.element(data.toElement);
 				var ngElement = angular.element('<template-content path="' + data.path + '"></template-content>');
 				element.append(ngElement);
 				$compile(element.contents())($scope);
 				$scope.safeApply();
 				if (_.isFunction(data.callback)) data.callback(data);
 			}
 		});
 	}
 });

/**
 * Event handler to dynamically load a JS file.
 * @event "renderer:load:js"
 */
 EkstepRendererAPI.addEventListener('renderer:load:js', function (event) {
 	var data = event.target;
 	if (data.path) {
 		$ocLazyLoad.load({type: 'js', path: data.path}).then(function () {
 			if (_.isFunction(data.callback)) data.callback(data);
 		});
 	}
 	$scope.safeApply();
 });

});

//# sourceURL=questionSetCtrl.js